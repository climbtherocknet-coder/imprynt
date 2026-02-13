# Hetzner Deployment Checklist

## Pre-Deploy: Stripe Dashboard Setup

Do this in the Stripe Dashboard (dashboard.stripe.com) BEFORE deploying. Use test mode first, switch to live when ready.

### 1. Create Products + Prices

**Product: Imprynt Premium (subscription)**
- Create product "Imprynt Premium"
- Add price: $5.99/month (recurring, monthly) → copy price ID → `STRIPE_PRICE_MONTHLY`
- Add price: $49.99/year (recurring, yearly) → copy price ID → `STRIPE_PRICE_ANNUAL`

**Product: Sygnet Ring (one-time)**
- Create product "Sygnet Ring"
- Add price: $39-49 one-time → copy price ID → `STRIPE_PRODUCT_RING`

**Product: Armilla Band (one-time)**
- Create product "Armilla Band"
- Add price: $29-39 one-time → copy price ID → `STRIPE_PRODUCT_BAND`

### 2. Set Up Customer Portal
- Settings → Billing → Customer Portal
- Enable: update payment method, switch plans, cancel subscription, view invoices
- Set cancellation to "at end of billing period" (not immediate)

### 3. Webhook Endpoint
- After deploying, add webhook: `https://trysygnet.com/api/stripe/webhook`
- Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 4. Get API Keys
- Developers → API Keys
- Copy publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Copy secret key → `STRIPE_SECRET_KEY`

---

## Hetzner VPS Setup

### 1. Provision Server
- Hetzner Cloud Console → Create Server
- Location: Ashburn or Hillsboro (US users)
- Image: Ubuntu 24.04
- Type: CX21 ($4.85/mo, 2 vCPU, 4GB RAM) or CX31 ($8.45/mo, 2 vCPU, 8GB RAM)
- Add SSH key
- Create

### 2. Server Initial Setup
```bash
# SSH in
ssh root@YOUR_SERVER_IP

# Update
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Create app user
adduser --disabled-password imprynt
usermod -aG docker imprynt

# Firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### 3. DNS Setup (Cloudflare)
- Add A record: `trysygnet.com` → YOUR_SERVER_IP (DNS only, not proxied initially)
- Add A record: `www.trysygnet.com` → YOUR_SERVER_IP
- Add A record: `imprynt.io` → YOUR_SERVER_IP (if ready)
- Once SSL is working via Caddy, you can switch to proxied if you want Cloudflare's CDN

### 4. Deploy Application
```bash
# As imprynt user
su - imprynt

# Clone repo
git clone https://github.com/YOUR_REPO/imprynt.git
cd imprynt

# Create production env file
cp .env.production.example .env.production
nano .env.production
# Fill in ALL values (see below)

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Verify health
curl http://localhost:3000/api/health
```

### 5. Production .env.production Values
```
DOMAIN=trysygnet.com
POSTGRES_USER=imprynt
POSTGRES_PASSWORD=[generate: openssl rand -base64 32]
POSTGRES_DB=imprynt
DATABASE_URL=postgresql://imprynt:[SAME_PASSWORD]@db:5432/imprynt
NEXTAUTH_URL=https://trysygnet.com
NEXTAUTH_SECRET=[generate: openssl rand -base64 32]
STRIPE_SECRET_KEY=[from Stripe Dashboard]
STRIPE_WEBHOOK_SECRET=[from Stripe Dashboard, after webhook created]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[from Stripe Dashboard]
STRIPE_PRICE_MONTHLY=[from Stripe Dashboard]
STRIPE_PRICE_ANNUAL=[from Stripe Dashboard]
STRIPE_PRODUCT_RING=[from Stripe Dashboard]
STRIPE_PRODUCT_BAND=[from Stripe Dashboard]
NEXT_PUBLIC_APP_URL=https://trysygnet.com
NEXT_PUBLIC_APP_NAME=Imprynt
ADMIN_EMAILS=tim@imprynt.io
```

### 6. Run Database Migration
```bash
# After first deploy, run the account_status migration
docker compose -f docker-compose.prod.yml exec db psql -U imprynt -d imprynt -f /docker-entrypoint-initdb.d/01-init.sql

# If init.sql already ran on first boot, just run the new migration:
docker compose -f docker-compose.prod.yml exec db psql -U imprynt -d imprynt -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));"
```

### 7. Create First Invite Code
```bash
docker compose -f docker-compose.prod.yml exec db psql -U imprynt -d imprynt -c "INSERT INTO invite_codes (code, created_by, max_uses, note) VALUES ('LAUNCH2026', 'tim@imprynt.io', 50, 'Launch invite code');"
```

### 8. Post-Deploy Verification
- [ ] https://trysygnet.com loads (Caddy SSL working)
- [ ] Register with invite code
- [ ] Complete setup wizard (all 5 steps)
- [ ] Profile renders at slug URL
- [ ] Save Contact downloads valid vCard
- [ ] Admin panel accessible at /admin
- [ ] Stripe checkout works (use test mode first)
- [ ] Webhook endpoint responds (check Stripe Dashboard → Webhooks → Recent events)

### 9. Ongoing
```bash
# Redeploy after git push
cd ~/imprynt
git pull
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Database backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U imprynt imprynt > backup_$(date +%Y%m%d).sql
```

---

## Stripe Test vs Live

Start with TEST MODE keys. Everything works the same but no real charges. Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

Switch to live keys when you're ready to take real money. Just swap the env vars and redeploy.

## Pricing Note

Pricing is currently hidden on the landing page (set to "coming soon"). When you're ready to show prices:
- Update `src/app/page.tsx` pricing section (the original values are in the git history)
- Make sure Stripe prices match what's on the landing page
