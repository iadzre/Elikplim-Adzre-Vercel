-- Allow authenticated admins to delete visitor notes ("Leave a Note" submissions)
-- from the CMS. Insert stays anon-only, select stays authenticated-only.

drop policy if exists "contact_authenticated_delete" on public.contact_submissions;
create policy "contact_authenticated_delete"
  on public.contact_submissions for delete
  to authenticated
  using (true);
