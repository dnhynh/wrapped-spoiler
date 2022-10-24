import React, {useState, useEffect} from 'react'
import axios from 'axios'
import TrackBlock from './TrackBlock'
import _ from 'lodash'

const MainBody = () => {
  const [tracks, setTracks] = useState([])
  const getRecent = () => {
    axios.get('/recent').then((res) => {
      setTracks(res.data.allTrackInfo)
    }).catch((error) => console.log(error))
  }

  useEffect(() => {
    console.log(tracks)
    if(tracks) console.log(true)
  }, [tracks])

  const sortByEnergy = () => {
    const sortedTracks = _.orderBy(tracks, track => track.analysis.energy, ['asc'])
    setTracks(sortedTracks)
  }

  const getTopTracks = () => {
    axios.get('/top-tracks').then((res) => {
      console.log('res: ', res.data)
    }).catch((e) => {
      console.log('error: ', e)
    })
  }

  const getTopArtists = () => {
    axios.get('/top-artists').then((res) => {
      console.log('res: ', res.data)
    }).catch((e) => {
      console.log('error: ', e)
    })
  }
  
  return (
    <div className="main-body">
      {tracks.length ? <div className="tracks-container">{tracks.map((track, index) => <TrackBlock key={index} trackInfo={track}/>)}</div> : 
      <button onClick={getRecent}>Get Recent</button>}
      <button onClick={getTopTracks}>Get Tracks</button>
      <button onClick={getTopArtists}>Get Artists</button>
    </div>
  )
}

export default MainBody