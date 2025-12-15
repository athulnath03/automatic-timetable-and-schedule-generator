
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardHome from './components/DashboardHome'
import GeneratePage from './components/GeneratePage'
import SavedPage from './components/SavedPage'

export default function App(){
  return (
    <Box sx={{display:'flex', height:'100%'}}>
      <Sidebar />
      <Box sx={{flex:1, display:'flex', flexDirection:'column'}}>
        <Topbar />
        <Box className="app-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/saved" element={<SavedPage />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}
