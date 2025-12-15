
import React from 'react'
import { Grid, Paper, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function DashboardHome(){
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{p:3}}>
            <Typography variant="h6">Generate Timetable</Typography>
            <Typography sx={{mt:1, color:'text.secondary'}}>Create optimized timetables quickly.</Typography>
            <Button variant="contained" sx={{mt:2}} component={Link} to="/generate">Start</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{p:3}}>
            <Typography variant="h6">About</Typography>
            <Typography sx={{mt:1, fontSize:14}}>
              This dashboard generates automatic school timetables using a greedy scheduling algorithm.
              Navigate to the Generate tab to create your timetable.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
