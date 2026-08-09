#!/usr/bin/env sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

backup_dir="${BACKUP_DIR:-./backups}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/benzo-${timestamp}.sql.gz"

mkdir -p "$backup_dir"
pg_dump "$DATABASE_URL" | gzip > "$backup_file"

find "$backup_dir" -type f -name 'benzo-*.sql.gz' -mtime "+${retention_days}" -delete

echo "$backup_file"
