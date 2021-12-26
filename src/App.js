import React, { useEffect, useState } from 'react'
import _ from 'lodash'

// styles
import 'semantic-ui-css/semantic.min.css'
import './App.css'

// semantic-ui
import {
  Container,
  Table,
  Button,
  Input,
  Grid,
  Label,
  Icon,
  Modal,
  Header,
  Dimmer,
  Loader
} from 'semantic-ui-react'

let vidInputTimeout, titleInputTimeout

function App() {
  // states
  const [videos, setVideos] = useState([])
  const [subs, setSubs] = useState([])
  const [season, setSeason] = useState('')
  const [outputFolder, setOutputFolder] = useState('')
  const [curVideoNmb, setCurVideoNmb] = useState()
  const [curtitleNmb, setCurtitleNmb] = useState()

  const [videoModal, setVideoModal] = useState({
    open: false,
    fileNmb: 0
  })
  const [titleModal, setTitleModal] = useState({
    open: false,
    fileNmb: 0
  })

  const [noOutPutFolderError, setNoOutputFolderError] = useState(false)
  const [noSeasonError, setNoSeasonError] = useState(false)

  const [showLoader, setShowLoader] = useState(false)
  const [copySuccessModal, setCopySuccessModal] = useState(false)
  const [copyErrorModal, setCopyErrorModal] = useState(false)

  // buttons
  const handleChooseFiles = e => {
    window.api.send('toMain', 'prompt subtitles')
  }
  const handleChooseVideos = e => {
    window.api.send('toMain', 'prompt videos')
  }
  const handleOutputFolder = e => {
    window.api.send('toMain', 'prompt folder')
  }
  const handleReset = e => {
    setVideos([])
    setSubs([])
    setSeason('')
    setOutputFolder('')
  }
  const handleChangeSeason = (e, { value }) => {
    setSeason(value && value !== '' ? value : '')
    // change videos newNames
    if (videos && videos.length > 0) {
      let editVidNewName = videos.map(vid => {
        vid.newName = `s${value}e${vid.nmb < 10 ? '0' + vid.nmb : vid.nmb}${vid.ext}`
        return vid
      })
      setVideos(editVidNewName)
    }
    // change subtitles new names
    if (subs && subs.length > 0) {
      let editSubNewName = subs.map(sub => {
        sub.newName = `s${value}e${sub.nmb < 10 ? '0' + sub.nmb : sub.nmb}${sub.ext}`
        return sub
      })
      setSubs(editSubNewName)
    }
  }
  const handleRemoveSingleVideo = nmb => {
    let reduced = videos.filter(vid => vid.nmb !== nmb)
    setVideos(reduced)
    setVideoModal({
      open: false,
      fileNmb: 0
    })
  }
  const handleRemoveSingleTitle = nmb => {
    let reduced = subs.filter(sub => sub.nmb !== nmb)
    setSubs(reduced)
    setTitleModal({
      open: false,
      fileNmb: 0
    })
  }

  // receiving messages from BE
  useEffect(() => {
    let messages = window.api.receive('fromMain', data => {
      if (data) {
        // videos added
        if (data.videoFiles && data.videoFiles.length > 0) {
          // setting video array of objects
          let givenVideos = data.videoFiles
          let vidObj = givenVideos.map((vid, i) => {
            return {
              nmb: i + 1,
              sourceName: vid.sourceName,
              sourcePath: vid.sourcePath,
              newName: (season && season !== '') ? `s${season}e${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}${vid.ext}` : '',
              ext: vid.ext
            }
          })
          setVideos(vidObj)
        }
        // titles added
        if (data.subtitleFiles && data.subtitleFiles.length > 0) {
          // setting titles array of objects
          let givenSubs = data.subtitleFiles
          let subObj = givenSubs.map((sub, i) => {
            return {
              nmb: i + 1,
              sourceName: sub.sourceName,
              sourcePath: sub.sourcePath,
              newName: (season && season !== '') ? `s${season}e${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}${sub.ext}` : '',
              ext: sub.ext
            }
          })
          setSubs(subObj)
        }
        // copy folder added
        if (data.copyPath) {
          setOutputFolder(data.copyPath)
        }
        // receive copy messages
        if (data && data.copyVideo) {
          let message = data.copyVideo
          // report error
          if (message === 'error') {
            // hide dimmer
            setShowLoader(false)
            // show error message
            setCopyErrorModal('Movies')
          }
        }
        if (data && data.copyTitles) {
          let message = data.copyTitles
          console.log('titles log: ', message)
          if (message === 'all files copied') {
            // hide dimmer
            setShowLoader(false)
            // show success message
            setCopySuccessModal(true)
          }
          // report error
          if (message === 'error') {
            // hide dimmer
            setShowLoader(false)
            // show error message
            setCopyErrorModal('Subtitles')
          }
        }
      }
    })
    return () => messages = null
  }, [season])

  // changing order of videos
  const handleReorderVideo = (value, nmb) => {
    // display typing
    setCurVideoNmb(parseInt(value))
    clearTimeout(vidInputTimeout)
    vidInputTimeout = setTimeout(() => {
      // check if nmb
      let parsed = parseInt(value)
      let number = parsed
      if (parsed) {
        let reorderedVideos = _.cloneDeep(videos)
        // reorderedVideos[nmb].nmb = parsed
        reorderedVideos = reorderedVideos.map(vid => {
          // change changed object
          if (vid.nmb === nmb) {
            vid.nmb = parsed
          } else if (vid.nmb !== nmb && vid.nmb === number) {
            vid.nmb += 1
            number +=1
          }
          // change new name
          vid.newName = `s${season}e${vid.nmb < 10 ? '0' + vid.nmb : vid.nmb}${vid.ext}`
          return vid
        })
        // reorder
        const reorder = arr => {
          return _.orderBy(arr, ['nmb'], ['asc'])
        }
        let asc = reorder(reorderedVideos)
        // set
        setCurVideoNmb()
        setVideos(asc)
        setVideoModal({
          open: false,
          fileNmb: 0
        })
      }
    }, 1500)
  }

  // changing order of subtitles
  const handleReorderTitle = (value, nmb) => {
    // display typing
    setCurtitleNmb(parseInt(value))
    clearTimeout(titleInputTimeout)
    titleInputTimeout = setTimeout(() => {
      // check if nmb
      let parsed = parseInt(value)
      let number = parsed
      if (parsed) {
        let reorderedTitles = _.cloneDeep(subs)
        // reorderedTitles[nmb].nmb = parsed
        reorderedTitles = reorderedTitles.map(sub => {
          // change changed object
          if (sub.nmb === nmb) {
            sub.nmb = parsed
          } else if (sub.nmb !== nmb && sub.nmb === number) {
            sub.nmb += 1
            number +=1
          }
          // change new name
          sub.newName = `s${season}e${sub.nmb < 10 ? '0' + sub.nmb : sub.nmb}${sub.ext}`
          return sub
        })
        // reorder
        const reorder = arr => {
          return _.orderBy(arr, ['nmb'], ['asc'])
        }
        let asc = reorder(reorderedTitles)
        // set
        setCurtitleNmb()
        setSubs(asc)
        setTitleModal({
          open: false,
          fileNmb: 0
        })
      }
    }, 1500)
  }

  // send request to copy files
  const handleReqCopy = () => {
    // errors
    if  (!outputFolder || outputFolder === '') {
      // show no folder error
      setNoOutputFolderError(true)
    } else {
      if (!season || season === '') {
        // show no seson set error
        setNoSeasonError(true)
      }
    }

    // send
    if (((videos && videos.length > 0) || (subs && subs.length > 0)) && outputFolder && outputFolder !== '') {
      // show dimmer
      setShowLoader(true)
      // prevent race
      setTimeout(() => {
        window.api.send('toMain', {
          req: 'create',
          videos,
          subs,
          outputFolder
        })
      }, 400)
    }
  }

  // copy success modal handler
  const handleCloseSuccess = () => {
    setCopySuccessModal(false)
    // reset data
    setVideos([])
    setSubs([])
    setSeason('')
    setOutputFolder('')
  }

  return (
    <Container className='App'>
      {/* options header */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <Button
                primary
                onClick={handleChooseVideos}
              >Choose Videos</Button>
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Button
                primary
                onClick={handleChooseFiles}
              >Choose Subtitles</Button>
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Input
                label='Season'
                type='text'
                placeholder='01 ... 02'
                value={season}
                onChange={handleChangeSeason}
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
            <Input
              action={{
                color: 'teal',
                labelPosition: 'left',
                icon: 'folder',
                content: 'Output',
                onClick: handleOutputFolder
              }}
              actionPosition='left'
              placeholder='Output'
              value={outputFolder}
            />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Button
                color='red'
                onClick={handleReset}
              >Reset</Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
      </Table>
      {/* videos and titles tables */}
      <Grid>
        <Grid.Column width={8}>
          {/* videos table */}
          <Table fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell collapsing>
                  #
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Videos (Original Name):
                </Table.HeaderCell>
                <Table.HeaderCell width={5}>
                  new Video Names:
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {videos && videos.map(video => (
                <Table.Row key={video.nmb} className='fixed-height'>
                  <Table.Cell>
                    <Label
                      color='blue'
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        setVideoModal({
                          open: true,
                          fileNmb: video.nmb
                        })
                      }}
                    >
                      {video.nmb}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>
                    {video.sourceName}
                  </Table.Cell>
                  <Table.Cell>
                    {video.newName}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
        <Grid.Column width={8}>
          {/* subtitles table */}
          <Table fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell collapsing>
                  #
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Subtitles (Original Name):
                </Table.HeaderCell>
                <Table.HeaderCell width={5}>
                  new Titles Names:
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {subs && subs.map((title, i) => (
                <Table.Row key={`title-${title.nmb}`} className='fixed-height'>
                  <Table.Cell>
                    <Label
                      color='blue'
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        setTitleModal({
                          open: true,
                          fileNmb: title.nmb
                        })
                      }}
                    >
                      {title.nmb}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>
                    {title.sourceName}
                  </Table.Cell>
                  <Table.Cell>
                    {title.newName}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid>
      {/* execute button */}
      {((videos && videos.length > 0) || (subs && subs.length > 0)) && (
        <>
          <br/>
          <br/>
          <Button
            style={{marginLeft: '40%'}}
            primary
            size='huge'
            onClick={handleReqCopy}
          >
            Execute
          </Button>
          <br/>
          <br/>
        </>
      )}

      {/* edit video modal */}
      <Modal
        basic
        open={videoModal && videoModal.open}
        onClose={() => setVideoModal({
          open: false,
          fileNmb: 0
        })}
        size='tiny'
      >
        <Header>Edit or remove Video</Header>
        <Modal.Content>
          <Input
            value={curVideoNmb || videoModal.fileNmb}
            onChange={(e, { value }) => handleReorderVideo(value, videoModal.fileNmb)}
            autoFocus
            onFocus={e => {e.target.selectionStart = 0, e.target.selectionEnd = 2}}
          />&emsp;&emsp;
          <Button
            color='red'
            onClick={() => handleRemoveSingleVideo(videoModal.fileNmb)}
          >
            Remove
          </Button>
        </Modal.Content>
      </Modal>

      {/* edit title modal */}
      <Modal
        basic
        open={titleModal && titleModal.open}
        onClose={() => setTitleModal({
          open: false,
          fileNmb: 0
        })}
        size='tiny'
      >
        <Header>Edit or remove Title</Header>
        <Modal.Content>
          <Input
            value={curtitleNmb || titleModal.fileNmb}
            onChange={(e, { value }) => handleReorderTitle(value, titleModal.fileNmb)}
            autoFocus
            onFocus={e => {e.target.selectionStart = 0, e.target.selectionEnd = 2}}
          />&emsp;&emsp;
          <Button
            color='red'
            onClick={() => handleRemoveSingleTitle(titleModal.fileNmb)}
          >
            Remove
          </Button>
        </Modal.Content>
      </Modal>

      {/* output folder not defined error */}
      <Modal
        size='tiny'
        open={noOutPutFolderError}
        onClose={() => setNoOutputFolderError(false)}
      >
        <Header>Can Not Execute!</Header>
        <Modal.Content>
          <p>Output Folder Not Selected!</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={() => setNoOutputFolderError(false)}>
            <Icon name='checkmark' /> OK
          </Button>
        </Modal.Actions>
      </Modal>

      {/* season not defined error */}
      <Modal
        size='tiny'
        open={noSeasonError}
        onClose={() => setNoSeasonError(false)}
      >
        <Header>Can Not Execute!</Header>
        <Modal.Content>
          <p>Season Not Defined!</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={() => setNoSeasonError(false)}>
            <Icon name='checkmark' /> OK
          </Button>
        </Modal.Actions>
      </Modal>

      {/* copying files loader */}
      <Dimmer active={showLoader}>
        <Loader />
      </Dimmer>

      {/* error copying - from BE */}
      <Modal
        size='tiny'
        open={!!copyErrorModal}
        onClose={() => setCopyErrorModal(false)}
      >
        <Header>Error!</Header>
        <Modal.Content>
          <p>Error ocured while copying {copyErrorModal || ''} files!</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={() => setCopyErrorModal(false)}>
            <Icon name='checkmark' /> OK
          </Button>
        </Modal.Actions>
      </Modal>

      {/* copy success */}
      <Modal
        size='tiny'
        open={copySuccessModal}
        onClose={handleCloseSuccess}
      >
        <Header>Success!</Header>
        <Modal.Content>
          <p>All files successfully copied!</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={handleCloseSuccess}>
            <Icon name='checkmark' /> OK
          </Button>
        </Modal.Actions>
      </Modal>

    </Container>
  )
}

export default App
