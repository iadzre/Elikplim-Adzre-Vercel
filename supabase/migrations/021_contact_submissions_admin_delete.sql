-- Allow CMS admins (profiles.role = 'admin') to delete visitor notes ("Leave a Note"
-- submissions). Marketplace shoppers (customer/creator roles) share the same auth
-- session, so restrict deletes to admins only. Insert stays anon-only, select stays
-- authenticated-only.

drop policy if exists "contact_authenticated_delete" on public.contact_submissions;
drop policy if exists "contact_admin_delete" on public.contact_submissions;
create policy "contact_admin_delete"
  on public.contact_submissions for delete
  to authenticated
  using (public.is_marketplace_admin());
