# Short URL Setup (impr.in)

## Prerequisites
- Domain `impr.in` registered and DNS configured
- A record pointing to Hetzner server IP
- SSL certificate (Caddy handles this automatically)

## DNS Setup
Add an A record for `impr.in` pointing to the server IP.
Add a CNAME for `www.impr.in` pointing to `impr.in` (optional).

## Caddy Configuration

Add a new site block to the Caddyfile. The path rewrite approach is simplest — Caddy rewrites all short domain requests to the `/go/` route on the main app:

```
impr.in {
    rewrite * /go{uri}
    reverse_proxy localhost:3000
}
```

This means `impr.in/TkfXM_CKmuVQ` becomes `localhost:3000/go/TkfXM_CKmuVQ`, which the existing `/go/[id]` route handles (looks up redirect_id, logs analytics, redirects to slug).

The root `impr.in/` becomes `localhost:3000/go/` which will 404 or redirect to home — this is fine since nobody should visit the bare short domain.

## App Configuration

Set the environment variable in `.env` (or `.env.local` / `.env.production`):

```
NEXT_PUBLIC_SHORT_DOMAIN=impr.in
```

Rebuild and restart the container:

```bash
docker compose build && docker compose up -d
```

## What Changes When Enabled

- **Dashboard "My Links":** Share Link shows `impr.in/{id}` instead of `{origin}/go/{id}`
- **QR codes:** Encode `https://impr.in/{id}` (shorter URL = simpler QR pattern = easier to scan)
- **Setup wizard:** QR on launch screen uses short URL

The `/go/` route on the main domain continues to work as a fallback.

## Verification

1. Visit `https://impr.in/{any_redirect_id}` — should redirect to the profile
2. Dashboard should now show `impr.in/{id}` as the Share Link
3. QR codes should encode the short URL
4. Existing `/go/{id}` URLs on the main domain still work
