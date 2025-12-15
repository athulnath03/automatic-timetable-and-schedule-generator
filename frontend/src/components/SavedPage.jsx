
import React from 'react'
import { Paper, Typography } from '@mui/material'

export default function SavedPage(){
  return (
    <Paper sx={{p:3}}>
      <Typography variant="h6">Saved Timetables</Typography>
      <Typography sx={{mt:2}}>No saved timetables yet. Persistence can be added with SQLite/SQLAlchemy.</Typography>
    </Paper>
  )
}
