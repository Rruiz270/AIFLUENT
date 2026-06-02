export const BACKUP_CONFIG = {
  strategy: 'pg_dump',
  frequency: 'daily',
  retention: '30 days',
  location: process.env.BACKUP_S3_BUCKET || 'local',

  getRestoreCommand(backupFile: string): string {
    return `pg_restore -d ${process.env.DATABASE_URL} ${backupFile}`
  },

  getDumpCommand(): string {
    return `pg_dump ${process.env.DATABASE_URL} --format=custom --file=backup_$(date +%Y%m%d_%H%M%S).dump`
  },
}
