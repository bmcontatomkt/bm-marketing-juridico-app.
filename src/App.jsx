import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AgencyDashboard from './components/AgencyDashboard'
import ClientView from './components/ClientView'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AgencyDashboard />} />
        <Route path="/client/:postId" element={<ClientView />} />
      </Routes>
    </Router>
  )
}

export default App
