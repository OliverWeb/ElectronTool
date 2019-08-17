var {Menu, Tray, BrowserWindow, app} = require('electron')

// var path = require('path')
// const menubarPic = process.platform === 'darwin'
//   ? `${__static}/icon.icns`
//   : `${__static}/icon.png`

var iconTray = new Tray(`${__static}/icon.png`)

// 绑定右键菜单

var trayMenu = Menu.buildFromTemplate([

  {
    label: '设置',
    click: function () {
      BrowserWindow.getAllWindows()[0].webContents.send('setting', 'setting')
    }
  },
  {

    label: '联系我们',
    click: function () {
      console.log('update')
    }
  },
  {

    label: '退出',
    click: function () {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    }
  }
])
iconTray.setContextMenu(trayMenu)

iconTray.setToolTip('Oliver')

// 实现点击关闭按钮让应用保存在托盘里面 ，双击托盘打开应用

var win = BrowserWindow.getFocusedWindow()

win.on('close', (e) => {
  console.log(win.isFocused())

  if (!win.isFocused()) {
    win = null
  } else {
    win.hide()
    // e.preventDefault() // 阻止窗口的关闭事件
  }
})

// 监听任务栏图标的点击事件
iconTray.on('double-click', function () {
  win.show()
})

// 设置快捷键
// if (process.env.NODE_ENV !== 'development') {
//   const template = [{
//     label: 'Edit',
//     submenu: [
//       { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
//       { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
//       { type: 'separator' },
//       { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
//       { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
//       { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
//       { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
//       {
//         label: 'Quit',
//         accelerator: 'CmdOrCtrl+Q',
//         click () {
//           app.quit()
//         }
//       }
//     ]
//   }]
//   let menu = Menu.buildFromTemplate(template)
//   Menu.setApplicationMenu(menu)
// }
