-- Migration 021 shipped a contact_submissions DELETE policy that allowed ANY
-- authenticated user (including marketplace shoppers) to delete visitor notes.
-- Since 021 was already applied on remote, this migration corrects the policy in
-- place: restrict deletes to CMS admins (profiles.role = 'admin').

drop policy if exists "contact_authenticated_delete" on public.contact_submissions;
drop policy if exists "contact_admin_delete" on public.contact_submissions;
create policy "contact_admin_delete"
  on public.contact_submissions for delete
  to authenticated
  using (public.is_marketplace_admin());
