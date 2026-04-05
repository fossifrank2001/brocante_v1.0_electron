import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // API URL
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),

  // Database Management
  dbGetInfo: () => ipcRenderer.invoke('db:get-info'),
  dbGetPaths: () => ipcRenderer.invoke('db:get-paths'),
  dbReset: () => ipcRenderer.invoke('db:reset'),
  dbSeedDemo: () => ipcRenderer.invoke('db:seed-demo'),
  dbExport: () => ipcRenderer.invoke('db:export'),
  dbImport: () => ipcRenderer.invoke('db:import'),

  // Google Drive Sync
  gdriveConfigure: (clientId: string, clientSecret: string) =>
    ipcRenderer.invoke('gdrive:configure', { clientId, clientSecret }),
  gdriveAuth: () => ipcRenderer.invoke('gdrive:auth'),
  gdriveUpload: () => ipcRenderer.invoke('gdrive:upload'),
  gdriveListBackups: () => ipcRenderer.invoke('gdrive:list-backups'),
  gdriveDownload: (fileId: string) =>
    ipcRenderer.invoke('gdrive:download', { fileId }),
  gdriveDeleteBackup: (fileId: string) =>
    ipcRenderer.invoke('gdrive:delete-backup', { fileId }),
  gdriveSetAutoSync: (enabled: boolean, interval?: number) =>
    ipcRenderer.invoke('gdrive:set-auto-sync', { enabled, interval }),
  gdriveDisconnect: () => ipcRenderer.invoke('gdrive:disconnect'),
  gdriveStatus: () => ipcRenderer.invoke('gdrive:status'),

  // Printers
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printThermal: (printerName: string) =>
    ipcRenderer.invoke('print-thermal', { printerName }),
})

