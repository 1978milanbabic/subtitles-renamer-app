const { ipcMain, dialog } = require('electron')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')

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
  // copy files
  if (arg && arg.req && arg.req === 'create') {
    let { outputFolder, subs, videos } = arg
    // copy videos
    const copyVideoFile = async vid => {
      let { sourcePath, newName } = vid
      // send start message
      event.reply('fromMain', {
        copyVideo: newName,
        start: true
      })
      // do copy
      try {
        await fs.copy(sourcePath, path.join(outputFolder, newName))
        // send success message
        console.log('copied: ', newName)
        // success
        event.reply('fromMain', {
          copyVideo: newName,
          success: true
        })
        return true
      } catch (err) {
        console.error(err)
        event.reply('fromMain', {
          copyVideo: newName,
          error: true
        })
        return false
      }
    }
    // copy titles
    const copyTitle = async sub => {
      let { sourcePath, newName } = sub
      // send start message
      event.reply('fromMain', {
        copyTitle: newName,
        start: true
      })
      // do copy
      try {
        await fs.copy(sourcePath, path.join(outputFolder, newName))
        // send success message
        console.log('copied: ', newName)
        // success
        event.reply('fromMain', {
          copyTitle: newName,
          success: true
        })
        return true
      } catch (err) {
        console.error(err)
        event.reply('fromMain', {
          copyTitle: newName,
          error: true
        })
        return false
      }
    }
    // execute copy
    let vidNmb = 0
    let subNmb = 0

    const exeCopySubs = async () => {
      let doCopy = await copyTitle(subs[subNmb])
      if (doCopy && (subNmb + 1) < subs.length) {
        subNmb++
        exeCopySubs()
      } else {
        // end
        console.log('all copied!')
        event.reply('fromMain', {copyTitles: 'all files copied'})
      }
    }

    let executeCopy = async () => {
      let doCopy = await copyVideoFile(videos[vidNmb])
      if (doCopy && (vidNmb + 1) < videos.length) {
        vidNmb++
        executeCopy()
      } else {
        // end
        console.log('all videos copied!')
        event.reply('fromMain', {copyVideo: 'all videos copied'})
        // copy sync titles
        exeCopySubs(0)
      }
    }
    // do copy all
    executeCopy(0)
  }
})
