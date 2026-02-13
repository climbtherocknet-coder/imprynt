#!/bin/bash
# Imprynt Database Backup Script
# Usage: ./scripts/backup.sh
# Cron example: 0 3 * * * /path/to/imprynt/scripts/backup.sh

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="imprynt_backup_${TIMESTAMP}.sql.gz"
KEEP_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Dump database from the running container, compress
docker exec imprynt-db pg_dump -U "${POSTGRES_USER:-imprynt}" "${POSTGRES_DB:-imprynt}" \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

# Check if backup was created successfully
if [ -s "${BACKUP_DIR}/${FILENAME}" ]; then
  echo "[$(date)] Backup created: ${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
else
  echo "[$(date)] ERROR: Backup file is empty or missing"
  rm -f "${BACKUP_DIR}/${FILENAME}"
  exit 1
fi

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "imprynt_backup_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Cleaned up backups older than ${KEEP_DAYS} days"
