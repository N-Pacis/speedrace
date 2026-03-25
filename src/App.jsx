import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SpeedTest from './pages/SpeedTest'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/speed-test">Speed Test</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speed-test" element={<SpeedTest />} />
      </Routes>
    </BrowserRouter>
  )
}
