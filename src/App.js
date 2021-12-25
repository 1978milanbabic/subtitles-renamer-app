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
  Popup,
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
  }
  const handleRemoveSingleVideo = nmb => {
    let reduced = videos.filter(vid => vid.nmb !== nmb)
    setVideos(reduced)
  }
  const handleRemoveSingleTitle = nmb => {
    let reduced = subs.filter(sub => sub.nmb !== nmb)
    setSubs(reduced)
  }

  // receiving messages from BE
  useEffect(() => {
    window.api.receive('fromMain', data => {
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
              ext: vid.ext,
              reorderDialog: false
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
              ext: sub.ext,
              reorderDialog: false
            }
          })
          setSubs(subObj)
        }
        // copy folder added
        if (data.copyPath) {
          setOutputFolder(data.copyPath)
        }
      }
    })
  }, [])

  // changing season
  useEffect(() => {
    if (season) {
      // change videos newNames
      if (videos) {
        let editVidNewName = videos.map(vid => {
          vid.newName = `s${season}e${vid.nmb < 10 ? '0' + vid.nmb : vid.nmb}${vid.ext}`
          return vid
        })
        setVideos(editVidNewName)
      }
      // change subtitles new names
      if (subs) {
        let editSubNewName = subs.map(sub => {
          sub.newName = `s${season}e${sub.nmb < 10 ? '0' + sub.nmb : sub.nmb}${sub.ext}`
          return sub
        })
        setSubs(editSubNewName)
      }
    } else {
      // delete season
      // change videos newNames
      if (videos) {
        let editVidNewName = videos.map(vid => {
          vid.newName = ''
          return vid
        })
        setVideos(editVidNewName)
      }
      // change subtitles new names
      if (subs) {
        let editSubNewName = subs.map(sub => {
          sub.newName = ''
          return sub
        })
        setSubs(editSubNewName)
      }
    }
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
      }
    }, 1500)
  }
  // *******************************
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
      }
    }, 1500)
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
                    <Popup
                      on='click'
                      pinned
                      position='top left'
                      trigger={
                        <Label color='blue'>
                          {video.nmb}
                        </Label>
                      }
                    >
                      <Popup.Header>
                        Reorder or Remove Video
                      </Popup.Header>
                      <Popup.Content>
                        <Input
                          value={curVideoNmb || video.nmb}
                          onChange={(e, { value }) => handleReorderVideo(value, video.nmb)}
                          autoFocus
                          onFocus={e => {e.target.selectionStart = 0, e.target.selectionEnd = 2}}
                        />
                        <br /><br />
                        <Button
                          color='red'
                          onClick={() => handleRemoveSingleVideo(video.nmb)}
                        >
                          Remove
                        </Button>
                      </Popup.Content>
                    </Popup>
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
                    <Popup
                      on='click'
                      pinned
                      position='top left'
                      trigger={
                        <Label color='blue'>
                          {title.nmb}
                        </Label>
                      }
                    >
                      <Popup.Header>
                        Reorder or Remove title
                      </Popup.Header>
                      <Popup.Content>
                        <Input
                          value={curtitleNmb || title.nmb}
                          onChange={(e, { value }) => handleReorderTitle(value, title.nmb)}
                          autoFocus
                          onFocus={e => {e.target.selectionStart = 0, e.target.selectionEnd = 2}}
                        />
                        <br /><br />
                        <Button
                          color='red'
                          onClick={() => handleRemoveSingleTitle(title.nmb)}
                        >
                          Remove
                        </Button>
                      </Popup.Content>
                    </Popup>
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
          >
            Execute
          </Button>
          <br/>
          <br/>
        </>
      )}
    </Container>
  )
}

export default App
