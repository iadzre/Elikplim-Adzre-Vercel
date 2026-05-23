-- Remove seed file metadata that pointed at storage objects never uploaded.
-- Re-attach files via Admin → Shop → resource → Download files.

delete from public.resource_files rf
using public.resources r
where rf.resource_id = r.id
  and r.slug in (
    'cinematic-ui-kit',
    'portfolio-template-system',
    'device-mockup-studio',
    'reel-transition-pack'
  )
  and rf.file_path = r.id::text || '/1/' || rf.file_name;
