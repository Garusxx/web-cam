import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Webcam from './components/Webcam'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Webcmap App</h1>
      <div className="card">
        <Webcam />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
