import axios from "axios"
import React from "react"

const Nav = () => {
  const loggedIn = sessionStorage.getItem('logged_in')
  
  const spotifyLogin = () => {
    axios.get('/login').then((res)=> {
      sessionStorage.setItem('logged_in', 'true')
      window.location.replace(res.data.url)
    }).catch((error) => {
      console.log(error)
    })
  }

  const sortByEnergy = () => {
    const sortedTracks = _.orderBy(tracks, track => track.analysis.energy, ['asc'])
    setTracks(sortedTracks)
  }

  return (
    <div className="nav">
      <h1>Wrapped Spoiler</h1>
      {!loggedIn && <button onClick={spotifyLogin}>Login</button>}
    </div>
  )
}

export default Nav

