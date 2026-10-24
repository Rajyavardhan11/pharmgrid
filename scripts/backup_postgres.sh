#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL required}"
: "${BACKUP_S3_URI:?BACKUP_S3_URI required}"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
file="/tmp/pharmgrid-${timestamp}.dump"
pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" --file="$file"
aws s3 cp "$file" "${BACKUP_S3_URI%/}/$(basename "$file")" --sse AES256
rm -f "$file"
