# Imprynt Production Deploy
# Run from PowerShell in D:\Docker\imprynt
#
# Prerequisites:
#   - SSH key auth set up (ssh root@5.78.85.128 works without password)
#   - All changes committed and pushed to GitHub
#
# Usage:
#   cd D:\Docker\imprynt
#   .\deploy.ps1

$ErrorActionPreference = "Stop"
$SERVER = "root@5.78.85.128"
$REMOTE_DIR = "/opt/imprynt"

Write-Host "`n=== IMPRYNT DEPLOY ===" -ForegroundColor Cyan

# Step 0: Verify git is clean and pushed
Write-Host "`n[1/6] Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "ERROR: Uncommitted changes detected:" -ForegroundColor Red
    git status --short
    Write-Host "`nCommit and push first, then run deploy again." -ForegroundColor Red
    exit 1
}

$local = git rev-parse HEAD
$remote = git rev-parse "origin/main"
if ($local -ne $remote) {
    Write-Host "WARNING: Local HEAD doesn't match origin/main. Push first?" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") { exit 1 }
}
Write-Host "Git is clean. HEAD: $($local.Substring(0,8))" -ForegroundColor Green

# Step 1: Backup production database
Write-Host "`n[2/6] Backing up production database..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U imprynt imprynt > backup_${timestamp}.sql && echo 'Backup: backup_${timestamp}.sql ($(wc -c < backup_${timestamp}.sql) bytes)'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backup failed. Aborting deploy." -ForegroundColor Red
    exit 1
}
Write-Host "Backup complete." -ForegroundColor Green

# Step 2: Pull latest code
Write-Host "`n[3/6] Pulling latest code on server..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_DIR && git pull origin main"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git pull failed." -ForegroundColor Red
    exit 1
}
Write-Host "Code updated." -ForegroundColor Green

# Step 3: Run migrations
Write-Host "`n[4/6] Running database migrations..." -ForegroundColor Yellow
# This runs all migration files in order. Each uses IF NOT EXISTS / IF EXISTS
# so they're safe to re-run.
ssh $SERVER @"
cd $REMOTE_DIR
echo 'Checking migrations...'
for f in db/migrations/*.sql; do
    echo "  Running: `$f"
    docker compose -f docker-compose.prod.yml exec -T db psql -U imprynt -d imprynt < `$f 2>&1 | tail -1
done
echo 'Migrations complete.'
"@
Write-Host "Migrations applied." -ForegroundColor Green

# Step 4: Rebuild and restart
Write-Host "`n[5/6] Rebuilding application..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build 2>&1 | tail -5"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed. Check server logs." -ForegroundColor Red
    exit 1
}

# Wait for app to be healthy
Write-Host "Waiting for app to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
$health = ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health"
if ($health -ne "200") {
    Write-Host "WARNING: Health check returned $health. Check logs:" -ForegroundColor Yellow
    ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs --tail=20 app"
} else {
    Write-Host "App is healthy." -ForegroundColor Green
}

# Step 5: Seed demo profiles
Write-Host "`n[6/6] Seeding demo profiles..." -ForegroundColor Yellow
$seedFile = "$REMOTE_DIR/db/seeds/demo-profiles.sql"
ssh $SERVER "if [ -f $seedFile ]; then docker compose -f docker-compose.prod.yml exec -T db psql -U imprynt -d imprynt < $seedFile && echo 'Demo seed complete.'; else echo 'No seed file found, skipping.'; fi"

# Verify demo profiles
$demoCount = ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T db psql -U imprynt -d imprynt -t -c `"SELECT COUNT(*) FROM users WHERE is_demo = true;`""
Write-Host "Demo profiles in database: $($demoCount.Trim())" -ForegroundColor Cyan

# Done
Write-Host "`n=== DEPLOY COMPLETE ===" -ForegroundColor Green
Write-Host "Verify at: https://imprynt.io" -ForegroundColor Cyan
Write-Host "Demo:      https://imprynt.io/demo" -ForegroundColor Cyan
Write-Host "Admin:     https://imprynt.io/dashboard" -ForegroundColor Cyan
