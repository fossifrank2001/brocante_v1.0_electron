import { BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';

let checkTimer: NodeJS.Timeout | null = null;

export type UpdateEventType =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

interface UpdateEvent {
  type: UpdateEventType;
  version?: string;
  releaseNotes?: string;
  progress?: number;
  error?: string;
}

/**
 * Send update events to the renderer process.
 */
function sendUpdateEvent(event: UpdateEvent): void {
  try {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('update-event', event);
      }
    }
  } catch (e) {
    console.error('[AutoUpdater] Failed to send event:', e);
  }
}

/**
 * Setup the auto-updater with all event handlers.
 * Should be called once from main.ts after the window is created.
 */
export function setupAutoUpdater(_win: BrowserWindow): void {
  // Don't auto-download — let us control the flow
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Disable code signature verification (we're not signing for now)
  autoUpdater.forceDevUpdateConfig = false;

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...');
    sendUpdateEvent({ type: 'checking' });
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`);
    sendUpdateEvent({
      type: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
    });
    // Automatically start downloading
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-not-available', (_info: UpdateInfo) => {
    console.log('[AutoUpdater] Application is up to date.');
    sendUpdateEvent({ type: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[AutoUpdater] Download progress: ${progress.percent.toFixed(1)}%`);
    sendUpdateEvent({
      type: 'downloading',
      progress: Math.round(progress.percent),
    });
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    console.log(`[AutoUpdater] Update downloaded: v${info.version}`);
    sendUpdateEvent({
      type: 'downloaded',
      version: info.version,
    });
  });

  autoUpdater.on('error', (error: Error) => {
    console.error('[AutoUpdater] Error:', error.message);
    sendUpdateEvent({
      type: 'error',
      error: error.message,
    });
  });

  // Check for updates on startup (with a delay to not block app launch)
  setTimeout(() => {
    checkForUpdates();
  }, 10000); // 10 seconds after launch

  // Check every 4 hours
  const FOUR_HOURS = 4 * 60 * 60 * 1000;
  checkTimer = setInterval(() => {
    checkForUpdates();
  }, FOUR_HOURS);
}

/**
 * Manually check for updates.
 */
export function checkForUpdates(): void {
  try {
    autoUpdater.checkForUpdates();
  } catch (e: any) {
    console.error('[AutoUpdater] Check failed:', e.message);
  }
}

/**
 * Install the downloaded update and restart the app.
 */
export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true);
}

/**
 * Cleanup timers.
 */
export function stopAutoUpdater(): void {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}
