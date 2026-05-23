import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @param {string} [root]
 */
export function loadEnvFiles(root = ROOT) {
  for (const name of ['.env.local', '.env']) {
    const filePath = join(root, name);
    if (!existsSync(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

/**
 * @returns {{ url: string, serviceRoleKey: string }}
 */
export function getSupabaseAdminConfig() {
  loadEnvFiles();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!serviceRoleKey && url) {
    try {
      const ref = new URL(url).hostname.split('.')[0];
      const json = execSync(`supabase projects api-keys --project-ref ${ref} -o json`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const keys = JSON.parse(json);
      const service = keys.find((k) => k.id === 'service_role' || k.name === 'service_role');
      if (service?.api_key) {
        serviceRoleKey = service.api_key;
      }
    } catch {
      // CLI unavailable — caller must set SUPABASE_SERVICE_ROLE_KEY
    }
  }

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).'
    );
  }

  return { url, serviceRoleKey };
}

export function publicStorageUrl(supabaseUrl, bucket, objectPath) {
  const base = supabaseUrl.replace(/\/$/, '');
  const encoded = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
