const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  storeApiKey: (apiKey) => ipcRenderer.invoke("store-api-key", apiKey),
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
});
