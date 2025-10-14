const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const path = require("path");
const isDev = process.env.ELECTRON_IS_DEV === "1";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icon.png"),
    titleBarStyle: "default",
    show: false,
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for secure storage
ipcMain.handle("store-api-key", async (event, apiKey) => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(apiKey);
      return { success: true, data: encrypted.toString("base64") };
    } else {
      return { success: false, error: "Encryption not available" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-api-key", async () => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      // In a real app, you'd retrieve from persistent storage
      // For now, we'll return null to indicate no stored key
      return { success: true, data: null };
    } else {
      return { success: false, error: "Encryption not available" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});
