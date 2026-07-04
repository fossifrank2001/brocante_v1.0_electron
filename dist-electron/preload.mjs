"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // API URL
  getApiUrl: () => electron.ipcRenderer.invoke("get-api-url"),
  // Database Management
  dbGetInfo: () => electron.ipcRenderer.invoke("db:get-info"),
  dbGetPaths: () => electron.ipcRenderer.invoke("db:get-paths"),
  dbReset: () => electron.ipcRenderer.invoke("db:reset"),
  dbSeedDemo: () => electron.ipcRenderer.invoke("db:seed-demo"),
  dbExport: () => electron.ipcRenderer.invoke("db:export"),
  dbImport: () => electron.ipcRenderer.invoke("db:import"),
  // Google Drive Sync
  gdriveConfigure: (clientId, clientSecret) => electron.ipcRenderer.invoke("gdrive:configure", { clientId, clientSecret }),
  gdriveAuth: () => electron.ipcRenderer.invoke("gdrive:auth"),
  gdriveUpload: () => electron.ipcRenderer.invoke("gdrive:upload"),
  gdriveListBackups: () => electron.ipcRenderer.invoke("gdrive:list-backups"),
  gdriveDownload: (fileId) => electron.ipcRenderer.invoke("gdrive:download", { fileId }),
  gdriveDeleteBackup: (fileId) => electron.ipcRenderer.invoke("gdrive:delete-backup", { fileId }),
  gdriveSetAutoSync: (enabled, interval) => electron.ipcRenderer.invoke("gdrive:set-auto-sync", { enabled, interval }),
  gdriveDisconnect: () => electron.ipcRenderer.invoke("gdrive:disconnect"),
  gdriveStatus: () => electron.ipcRenderer.invoke("gdrive:status"),
  // Google Drive Sync Events (push from main → renderer)
  onSyncEvent: (callback) => {
    electron.ipcRenderer.on("sync-event", callback);
    return () => electron.ipcRenderer.off("sync-event", callback);
  },
  // Local Backups
  backupList: () => electron.ipcRenderer.invoke("backup:list"),
  backupRestore: (filename) => electron.ipcRenderer.invoke("backup:restore", { filename }),
  backupCreateNow: () => electron.ipcRenderer.invoke("backup:create-now"),
  // Auto-Updater
  updaterCheck: () => electron.ipcRenderer.invoke("updater:check"),
  updaterInstall: () => electron.ipcRenderer.invoke("updater:install"),
  onUpdateEvent: (callback) => {
    electron.ipcRenderer.on("update-event", callback);
    return () => electron.ipcRenderer.off("update-event", callback);
  },
  // Keyboard Shortcuts (push from main → renderer)
  onShortcut: (callback) => {
    electron.ipcRenderer.on("shortcut", callback);
    return () => electron.ipcRenderer.off("shortcut", callback);
  },
  // Printers
  getPrinters: () => electron.ipcRenderer.invoke("get-printers"),
  printThermal: (printerName) => electron.ipcRenderer.invoke("print-thermal", { printerName })
});
