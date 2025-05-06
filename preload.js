const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (username, password, rememberMe) => ipcRenderer.invoke('login', username, password, rememberMe),
  signup: (username, password, fullname) => ipcRenderer.invoke('signup', username, password, fullname),
  logout: () => ipcRenderer.invoke('logout'),
  closeApp: () => ipcRenderer.invoke('closeApp'),
  validatePassword: (username, password) => ipcRenderer.invoke('validate-password', username, password),
  onAutoLogin: (callback) => ipcRenderer.on('auto-login', (event, data) => callback(data)),
  onStopMusic: (callback) => ipcRenderer.on('stop-music', callback)
});