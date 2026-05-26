-- Allow Lightroom preset and related download MIME types on resource-files bucket.
update storage.buckets
set allowed_mime_types = array[
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'application/octet-stream',
  'application/xml',
  'text/xml',
  'image/jpeg',
  'image/png',
  'image/dng',
  'image/x-adobe-dng',
  'video/mp4',
  'text/plain',
  'font/ttf',
  'font/otf'
]
where id = 'resource-files';
