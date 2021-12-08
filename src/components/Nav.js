import axios from "axios"
import React from "react"

const spotifyLogin = () => {
  axios.get('/login').then((res)=> {
    window.location.replace(res.data.url)
  })
}

const getRecent = () => {
  axios.get('/recent').then((res) => {
    console.log(res.data)
  })
}

const Nav = () => {
  return (
    <div className="nav">
      <h1>Digital Versicolor</h1>
      <button onClick={spotifyLogin}>Login</button>
      <button onClick={getRecent}>Get Recent</button>
    </div>
  )
}

export default Nav

