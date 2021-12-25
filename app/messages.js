const { ipcMain, dialog } = require('electron')
const path = require('path')
const _ = require('lodash')

// defining files and paths
let videoFiles, subtitleFiles, copyPath

// on messages
ipcMain.on('toMain', (event, arg) => {
  // open videos
  if (arg === 'prompt videos') {
    const getVideos = dialog.showOpenDialog({
      title: 'Choose Videos',
      properties: ['openFile', 'multiSelections'],
      filters: [{name: 'Videos', extensions: ['mkv', 'mp4', 'avi']}]
    })
    getVideos.then(videos => {
      if (videos && !videos.canceled && videos.filePaths.length > 0) {
        videoFiles = videos.filePaths.map(vid => {
          return {
            sourceName: path.basename(vid),
            sourcePath: path.resolve(vid),
            ext: path.parse(vid).ext,
            newName: '',
            newPath: ''
          }
        })
        // send to FE
        event.reply('fromMain', { videoFiles })
      }
    })
  }
  // open subtitles
  if (arg === 'prompt subtitles') {
    const getSubs = dialog.showOpenDialog({
      title: 'Choose Subtitles',
      properties: ['openFile', 'multiSelections'],
      filters: [{name: 'Subtitles', extensions: ['txt', 'sub', 'srt']}]
    })
    getSubs.then(subs => {
      if (subs && !subs.canceled && subs.filePaths.length > 0) {
        subtitleFiles = subs.filePaths.map(sub => {
          return {
            sourceName: path.basename(sub),
            sourcePath: path.resolve(sub),
            ext: path.parse(sub).ext,
            newName: '',
            newPath: ''
          }
        })
        // send to FE
        event.reply('fromMain', { subtitleFiles })
      }
    })
  }
  // choose output folder
  if (arg === 'prompt folder') {
    const getFolder = dialog.showOpenDialog({
      title: 'Choose output folder',
      properties: ['openDirectory', 'createDirectory', 'promptToCreate']
    })
    getFolder.then(folder => {
      if (folder && !folder.canceled && folder.filePaths.length === 1) {
        copyPath = path.resolve(folder.filePaths[0])
        // send to FE
        event.reply('fromMain', { copyPath })
      }
    })
  }
})
