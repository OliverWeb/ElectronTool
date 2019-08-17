'use strict'

import { app, BrowserWindow, Menu } from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false
    }
  })
  // 打包后展示控制台
  // mainWindow.webContents.openDevTools()
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  Menu.setApplicationMenu(null)
  require('./model/menu.js') // 右键菜单

  require('./model/tray.js') // 托盘菜单
}

/* start 只启动一个实例 */
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})
if (shouldQuit) {
  app.quit()
}
/* end  开启一个实例 */

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ipc 通信
// ipcMain.on('asynchronous-message', (event, arg) => {
//   console.log(arg) // prints "ping"
//   event.sender.send('asynchronous-reply', 'pong')
// })

// ipcMain.on('newPage', () => {
//   const modalPath = process.env.NODE_ENV === 'development'
//     ? 'http://localhost:9080/#/newPage'
//     : `file://${__dirname}/index.html#newPage`
//   let win = new BrowserWindow({
//     height: 563,
//     width: 1000,
//     webPreferences: {
//       webSecurity: false
//     }
//   })
//   win.on('close', function () {
//     win = null
//   })
//   win.loadURL(modalPath)
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
