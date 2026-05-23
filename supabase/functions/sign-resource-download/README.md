# sign-resource-download (optional Edge Function)

Hardened download flow when anon free reads or short-lived signed URLs from the client are not sufficient.

## Flow

1. `POST` body: `{ resourceId, fileId?, sessionId? }`
2. Verify JWT (optional) or session cookie.
3. Call `record_resource_download` via service role.
4. Call `storage.createSignedUrl` with **service role** (120s TTL).
5. Return `{ signedUrl, expiresAt }`.

## Deploy

```bash
supabase functions deploy sign-resource-download --no-verify-jwt
```

Set secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

Never expose the service role key in the Vite client.
