(function () {
  const {Menu, ipcMain, BrowserWindow} = require('electron')

  // 右键菜单
  const contextMenuTemplate = [
    {
      label: '全选', role: 'selectall'
    },
    {
      label: '复制', role: 'copy'
    },
    {
      label: '粘贴', role: 'paste'
    },
    // {type: 'separator'}, // 分隔线
    // {
    //   label: '刷新', role: 'reload'
    // },
    // {
    //   label: '强制刷新', role: 'forcereload'
    // },
    {type: 'separator'}, // 分隔线
    {
      label: '设置',
      click: function () {
        BrowserWindow.getFocusedWindow().webContents.send('setting', 'setting')
      }
    }
    /* {type: 'separator'}, // 分隔线
    {
      label: '导入指纹',
      click: () => {
        console.log('click')
      }
    },
    {
      label: '导出指纹',
      click: () => {
        console.log('click')
      }
    } */
  ]

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)

  ipcMain.on('contextmenu', function () {
    contextMenu.popup(BrowserWindow.getFocusedWindow())
  })
})()
