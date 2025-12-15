
import React from 'react'
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SaveIcon from '@mui/icons-material/Save'

const drawerWidth = 260

export default function Sidebar(){
  const location = useLocation()
  return (
    <Drawer variant="permanent" sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
    }}>
      <Toolbar sx={{px:2, py:3}}>
        <div>
          <div style={{fontWeight:700}}>Timetable Dashboard</div>
          <div style={{fontSize:12, color:'#666'}}>Automatic Scheduling</div>
        </div>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton component={Link} to="/" selected={location.pathname === '/'}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} to="/generate" selected={location.pathname === '/generate'}>
          <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
          <ListItemText primary="Generate" />
        </ListItemButton>
        <ListItemButton component={Link} to="/saved" selected={location.pathname === '/saved'}>
          <ListItemIcon><SaveIcon /></ListItemIcon>
          <ListItemText primary="Saved" />
        </ListItemButton>
      </List>
    </Drawer>
  )
}
