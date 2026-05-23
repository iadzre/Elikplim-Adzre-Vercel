#!/usr/bin/env node
/**
 * Compress public/images and upload to Supabase Storage.
 * Generates URL map + SQL to update CMS tables.
 *
 * Usage:
 *   npm run media:migrate              # full migration
 *   npm run media:migrate -- --dry-run
 *   npm run media:migrate -- --only slider
 *   npm run media:migrate -- --skip-upload   # compress + write map only (local)
 *
 * Requires: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or linked Supabase CLI)
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
} from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseAdminConfig, loadEnvFiles, publicStorageUrl } from './lib/loadEnv.mjs';
import {
  compressionProfile,
  isImageFile,
  isVideoFile,
  resolveBucket,
  sqlEscape,
  storageObjectPath,
  toLegacyDbPath,
} from './lib/mediaPaths.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = join(ROOT, 'public/images');
const GENERATED_DIR = join(ROOT, 'supabase/generated');
const FALLBACK_OUT = join(ROOT, 'src/constants/storageMediaUrls.js');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipUpload = args.includes('--skip-upload');
const onlyIdx = args.indexOf('--only');
const onlyFilter = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

/** @type {Array<{ localPath: string, bucket: string, objectPath: string, publicUrl: string, bytes: number, compressed: boolean }>} */
const results = [];

function listFilesRecursive(dir, base = dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      files.push(relative(base, full));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

/**
 * @param {string} filePath
 * @param {{ maxWidth: number, quality: number }} profile
 */
async function compressImage(filePath, profile) {
  const input = sharp(filePath);
  const meta = await input.metadata();
  let pipeline = sharp(filePath);
  if (meta.width && meta.width > profile.maxWidth) {
    pipeline = pipeline.resize({ width: profile.maxWidth, withoutEnlargement: true });
  }
  return pipeline.webp({ quality: profile.quality, effort: 4 }).toBuffer();
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
async function uploadBuffer(admin, bucket, objectPath, buffer, contentType) {
  const { error } = await admin.storage.from(bucket).upload(objectPath, buffer, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw error;
}

/** @type {string[]} */
const uploadFailures = [];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  if (!existsSync(IMAGES_DIR)) {
    console.error(`Missing ${IMAGES_DIR}. Run npm run media:pull or copy public/images locally.`);
    process.exit(1);
  }

  mkdirSync(GENERATED_DIR, { recursive: true });

  let admin = null;
  let supabaseUrl = process.env.VITE_SUPABASE_URL || '';

  if (!skipUpload && !dryRun) {
    const config = getSupabaseAdminConfig();
    supabaseUrl = config.url;
    admin = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } else {
    loadEnvFiles();
    supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://example.supabase.co';
  }

  let files = listFilesRecursive(IMAGES_DIR);
  if (onlyFilter) {
    files = files.filter((f) => f.startsWith(`${onlyFilter}/`) || f.startsWith(onlyFilter));
  }

  console.log(`Found ${files.length} files under public/images${onlyFilter ? ` (filter: ${onlyFilter})` : ''}`);

  let savedBytes = 0;
  let originalBytes = 0;

  for (const rel of files) {
    const abs = join(IMAGES_DIR, rel);
    const stat = statSync(abs);
    originalBytes += stat.size;

    if (isVideoFile(rel)) {
      const bucket = resolveBucket(rel);
      const objectPath = storageObjectPath(rel, 'original');
      const dbPath = toLegacyDbPath(rel);
      const publicUrl = publicStorageUrl(supabaseUrl, bucket, objectPath);

      console.log(`[video] ${rel} (${formatBytes(stat.size)}) → ${bucket}/${objectPath}`);

      if (!dryRun && !skipUpload && admin) {
        try {
          const buffer = readFileSync(abs);
          await uploadBuffer(admin, bucket, objectPath, buffer, 'video/mp4');
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`  ✗ upload failed: ${message}`);
          uploadFailures.push(`${rel}: ${message}`);
          continue;
        }
      }

      results.push({
        localPath: dbPath,
        bucket,
        objectPath,
        publicUrl,
        bytes: stat.size,
        compressed: false,
      });
      continue;
    }

    if (!isImageFile(rel)) {
      console.warn(`[skip] unsupported file: ${rel}`);
      continue;
    }

    const bucket = resolveBucket(rel);
    const profile = compressionProfile(rel);
    const objectPath = storageObjectPath(rel, 'webp');
    const dbPath = toLegacyDbPath(rel);
    const publicUrl = publicStorageUrl(supabaseUrl, bucket, objectPath);

    let buffer;
    if (dryRun) {
      buffer = Buffer.alloc(0);
    } else {
      buffer = await compressImage(abs, profile);
    }
    savedBytes += dryRun ? 0 : stat.size - buffer.length;

    const outLabel = dryRun
      ? `(dry-run ~${formatBytes(stat.size)} → webp)`
      : `${formatBytes(stat.size)} → ${formatBytes(buffer.length)}`;

    console.log(`[image] ${rel} ${outLabel} → ${bucket}/${objectPath}`);

    if (!dryRun && !skipUpload && admin) {
      try {
        await uploadBuffer(admin, bucket, objectPath, buffer, 'image/webp');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ upload failed: ${message}`);
        uploadFailures.push(`${rel}: ${message}`);
        continue;
      }
    }

    results.push({
      localPath: dbPath,
      bucket,
      objectPath,
      publicUrl,
      bytes: dryRun ? stat.size : buffer.length,
      compressed: true,
    });
  }

  const mapPath = join(GENERATED_DIR, 'media-url-map.json');
  writeFileSync(mapPath, `${JSON.stringify(results, null, 2)}\n`);

  const sqlLines = [
    '-- Generated by scripts/migrate-media-to-storage.mjs',
    '-- Apply: npm run supabase:media-urls',
    'begin;',
    '',
  ];

  for (const row of results) {
    const oldPath = row.localPath;
    const newUrl = row.publicUrl;
    sqlLines.push(
      `update public.home_slides set src = '${sqlEscape(newUrl)}' where src = '${sqlEscape(oldPath)}';`
    );
    sqlLines.push(
      `update public.hero set background_value = '${sqlEscape(newUrl)}' where background_value = '${sqlEscape(oldPath)}';`
    );
    sqlLines.push(
      `update public.projects set cover_image_url = '${sqlEscape(newUrl)}' where cover_image_url = '${sqlEscape(oldPath)}';`
    );
    sqlLines.push(
      `update public.project_gallery_items set src = '${sqlEscape(newUrl)}' where src = '${sqlEscape(oldPath)}';`
    );
    sqlLines.push(
      `update public.portfolio_projects set cover_src = '${sqlEscape(newUrl)}' where cover_src = '${sqlEscape(oldPath)}';`
    );
    sqlLines.push(
      `update public.project_media set src = '${sqlEscape(newUrl)}' where src = '${sqlEscape(oldPath)}';`
    );
  }

  sqlLines.push('', 'commit;', '');
  const sqlPath = join(GENERATED_DIR, 'update-media-urls.sql');
  writeFileSync(sqlPath, sqlLines.join('\n'));

  const sliderFallbacks = results
    .filter((r) => r.localPath.startsWith('/images/slider/'))
    .sort((a, b) => a.localPath.localeCompare(b.localPath))
    .map((r, i) => ({
      id: `storage-slide-${i + 1}`,
      src: r.publicUrl,
      alt: `Slide ${i + 1}`,
    }));

  const fallbackJs = `/** Auto-generated by scripts/migrate-media-to-storage.mjs — do not edit manually */
/** @type {import('../lib/contentMappers').HomeSlide[]} */
export const STORAGE_HOME_SLIDES = ${JSON.stringify(sliderFallbacks, null, 2)};

/** @type {Record<string, string>} Legacy /images/ path → Supabase public URL */
export const LEGACY_MEDIA_URL_MAP = ${JSON.stringify(
    Object.fromEntries(results.map((r) => [r.localPath, r.publicUrl])),
    null,
    2
  )};
`;
  writeFileSync(FALLBACK_OUT, fallbackJs);

  console.log('');
  console.log(`Wrote ${mapPath}`);
  console.log(`Wrote ${sqlPath}`);
  console.log(`Wrote ${FALLBACK_OUT}`);
  if (!dryRun) {
    console.log(
      `Compression saved ~${formatBytes(savedBytes)} across images (${formatBytes(originalBytes)} scanned)`
    );
  }
  if (uploadFailures.length) {
    const failPath = join(GENERATED_DIR, 'upload-failures.txt');
    writeFileSync(failPath, `${uploadFailures.join('\n')}\n`);
    console.log(`\n⚠ ${uploadFailures.length} upload(s) failed — see ${failPath}`);
    console.log('Large videos (>50MB) may require Supabase Pro or external hosting (YouTube/Vimeo).');
  }
  if (dryRun) {
    console.log('Dry run — no uploads performed.');
  } else if (skipUpload) {
    console.log('Skip upload — maps/SQL generated only.');
  } else if (!uploadFailures.length) {
    console.log('');
    console.log('Next: npm run supabase:media-urls');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
