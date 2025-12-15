
import React from 'react'
import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material'

export default function Topbar(){
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Box sx={{flexGrow:1}}>
          <Typography variant="h6">Automatic Timetable</Typography>
        </Box>
        <Box sx={{display:'flex', alignItems:'center', gap:2}}>
          <Typography variant="body2">Admin</Typography>
          <Avatar>AD</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
