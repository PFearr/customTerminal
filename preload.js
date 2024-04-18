const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  command: (title) => ipcRenderer.send('command', title),
  onCommand: (callback) => ipcRenderer.on('onCommand', (_event, ...args) => callback(...args)),
  setPrompt: (callback) => ipcRenderer.on('setPrompt', (_event, ...args) => callback(...args)),
  ready: (callback) => ipcRenderer.send('ready'),
  clear: (callback) => ipcRenderer.on('clear', (_event, ...args) => callback(...args)),
  allowInput: (callback) => ipcRenderer.on('allowInput', (_event, ...args) => callback(...args)),
  run_cmd: (callback) => ipcRenderer.on('run_cmd', (_event, ...args) => callback(...args)),
  prompt: (callback) => ipcRenderer.on('prompt', (_event, ...args) => callback(...args)),
  send_prompt: (msg) => ipcRenderer.send('send_prompt', msg),
  remove_prompt: (callback) => ipcRenderer.on('remove_prompt', (_event, ...args) => callback(...args)),
})