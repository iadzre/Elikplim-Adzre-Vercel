-- Increase max upload size for marketplace downloadable files.
-- Previous limit: 524,288,000 bytes (~500MB)
-- New limit: 2,147,483,648 bytes (2GB)

update storage.buckets
set file_size_limit = 2147483648
where id = 'resource-files';

