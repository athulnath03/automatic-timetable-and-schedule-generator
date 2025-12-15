
/**
 * TimetableView - Displays generated timetables
 * Renders each class's schedule in a table format
 */

import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

export default function TimetableView({timetable}){
  if(!timetable) return null
  const { days, periods_per_day, grid } = timetable
  return (
    <div>
      {Object.keys(grid).map(cls=>(
        <div key={cls} style={{marginBottom:24}}>
          <Typography variant="h6" sx={{mb:1}}>{cls}</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Day / Period</TableCell>
                  {Array.from({length:periods_per_day}).map((_,i)=>(<TableCell key={i}>P{i+1}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {grid[cls].map((row,ri)=>(
                  <TableRow key={ri}>
                    <TableCell><strong>{days[ri]}</strong></TableCell>
                    {row.map((cell,ci)=>(<TableCell key={ci} style={{whiteSpace:'pre-line'}}>{cell}</TableCell>))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </div>
  )
}
