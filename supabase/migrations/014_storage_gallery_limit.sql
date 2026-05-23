-- Raise project-gallery per-file limit for legacy video uploads (Director_2.mp4 ~156MB)
update storage.buckets
set file_size_limit = 209715200
where id = 'project-gallery';
