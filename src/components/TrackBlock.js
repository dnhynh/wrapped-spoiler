import React from 'react'

const TrackBlock = (props) => {
  const {
    song_name, 
    artists,
    analysis,
    album,
    preview:previewUrl,
  } = props.trackInfo

  const artistsElement = artists.map((artist, index) => (
    <div key={index}>
      <p>{artist}</p>  
    </div>)
    )

  return (
    <div className='track-block'>
      <p>{song_name}</p>
      {artistsElement}
    </div>
  )
}

export default TrackBlock