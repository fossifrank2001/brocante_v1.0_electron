import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

let backupTimer: NodeJS.Timeout | null = null;

/**
 * Get the backup directory path.
 */
function getBackupDir(): string {
  return path.join(app.getPath('userData'), 'data', 'backups');
}

/**
 * Get the database path.
 */
function getDbPath(): string {
  return path.join(app.getPath('userData'), 'data', 'database', 'brocante.sqlite');
}

/**
 * Ensure the backup directory exists.
 */
function ensureBackupDir(): void {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get the backup filename for today.
 */
function getTodayBackupName(): string {
  const dayIndex = new Date().getDay();
  const dayName = DAYS_FR[dayIndex];
  return `backup-${dayName}.sqlite`;
}

/**
 * Create a backup of the current database.
 * Uses day-of-week naming for automatic 7-day rotation.
 * Returns the backup filename on success, null on failure.
 */
export function createBackup(): { success: boolean; filename?: string; error?: string } {
  const dbPath = getDbPath();

  if (!fs.existsSync(dbPath)) {
    return { success: false, error: 'Base de données introuvable.' };
  }

  const stats = fs.statSync(dbPath);
  if (stats.size === 0) {
    return { success: false, error: 'Base de données vide, backup ignoré.' };
  }

  ensureBackupDir();

  const filename = getTodayBackupName();
  const backupPath = path.join(getBackupDir(), filename);

  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[Backup] ✅ Backup créé : ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    return { success: true, filename };
  } catch (e: any) {
    console.error(`[Backup] ❌ Échec du backup :`, e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Check if today's backup already exists and is recent (< 1 hour old).
 */
function isTodayBackupRecent(): boolean {
  const backupPath = path.join(getBackupDir(), getTodayBackupName());
  if (!fs.existsSync(backupPath)) return false;

  try {
    const stats = fs.statSync(backupPath);
    const ageMs = Date.now() - stats.mtime.getTime();
    const oneHourMs = 60 * 60 * 1000;
    return ageMs < oneHourMs;
  } catch {
    return false;
  }
}

/**
 * List all available local backups with metadata.
 */
export function listBackups(): Array<{
  filename: string;
  size: number;
  date: string;
  dayName: string;
}> {
  ensureBackupDir();
  const dir = getBackupDir();

  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sqlite'));

    return files.map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      const dayMatch = filename.match(/^backup-(.+)\.sqlite$/);
      return {
        filename,
        size: stats.size,
        date: stats.mtime.toISOString(),
        dayName: dayMatch ? dayMatch[1] : filename,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e: any) {
    console.error('[Backup] Failed to list backups:', e.message);
    return [];
  }
}

/**
 * Restore the database from a local backup file.
 */
export function restoreBackup(filename: string): { success: boolean; error?: string } {
  const backupPath = path.join(getBackupDir(), filename);
  const dbPath = getDbPath();

  if (!fs.existsSync(backupPath)) {
    return { success: false, error: `Backup "${filename}" introuvable.` };
  }

  // Safety: backup the current DB before restoring
  const safetyPath = dbPath + '.pre-restore.bak';
  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, safetyPath);
    }
  } catch (e: any) {
    console.warn('[Backup] Could not create safety copy before restore:', e.message);
  }

  try {
    fs.copyFileSync(backupPath, dbPath);
    console.log(`[Backup] ✅ Base restaurée depuis : ${filename}`);
    return { success: true };
  } catch (e: any) {
    console.error('[Backup] ❌ Restauration échouée:', e.message);
    // Try to restore the safety copy
    if (fs.existsSync(safetyPath)) {
      try {
        fs.copyFileSync(safetyPath, dbPath);
        console.log('[Backup] Safety copy restored after failed restore.');
      } catch {}
    }
    return { success: false, error: e.message };
  }
}

/**
 * Start the automatic daily backup system.
 * Checks every hour if today's backup exists; creates one if not.
 */
export function startDailyBackup(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
  }

  // Create initial backup on startup (if not already done today)
  if (!isTodayBackupRecent()) {
    createBackup();
  }

  // Check every hour
  const ONE_HOUR = 60 * 60 * 1000;
  backupTimer = setInterval(() => {
    if (!isTodayBackupRecent()) {
      createBackup();
    }
  }, ONE_HOUR);

  console.log('[Backup] 🔄 Système de backup quotidien démarré (vérification toutes les heures)');
}

/**
 * Stop the automatic backup system.
 */
export function stopDailyBackup(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}
