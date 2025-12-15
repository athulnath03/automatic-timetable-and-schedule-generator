
/**
 * GeneratePage - Timetable generation interface
 * Allows users to input classes, subjects, and days to generate a timetable
 */

import React, { useState } from 'react'
import { Paper, Grid, TextField, Button, Typography, Box } from '@mui/material'
import axios from 'axios'
import TimetableView from './TimetableView'

function emptySubject(){ return {name:'', teacher:'', periods_per_week:1} }

export default function GeneratePage(){
  const [days, setDays] = useState(['Mon','Tue','Wed','Thu','Fri'])
  const [periods, setPeriods] = useState(6)
  const [classes, setClasses] = useState(['10A'])
  const [subjects, setSubjects] = useState([emptySubject()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timetable, setTimetable] = useState(null)

  const addSubject = () => setSubjects(s=>[...s, emptySubject()])
  const updateSubject = (idx,key,val) => { const c=[...subjects]; c[idx][key]=val; setSubjects(c) }
  const removeSubject = (idx)=> setSubjects(s=>s.filter((_,i)=>i!==idx))
  const addClass = ()=> setClasses(c=>[...c, `Class${c.length+1}`])
  const updateClass = (idx,val)=> { const c=[...classes]; c[idx]=val; setClasses(c) }

  const handleGenerate = async () => {
    setLoading(true); setError(null)
    try {
      const payload = { days, periods_per_day: periods, classes, subjects }
      const res = await axios.post('/api/generate', payload)
      setTimetable(res.data)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Paper sx={{p:3}}>
        <Typography variant="h6">Input</Typography>
        <Grid container spacing={2} sx={{mt:1}}>
          <Grid item xs={12} md={6}>
            <TextField label="Days (comma separated)" fullWidth value={days.join(',')} onChange={e=>setDays(e.target.value.split(',').map(s=>s.trim()))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Periods per day" type="number" fullWidth value={periods} onChange={e=>setPeriods(Number(e.target.value))} />
          </Grid>

          <Grid item xs={12}>
            <Typography>Classes</Typography>
            {classes.map((c,i)=>(
              <Box key={i} sx={{mt:1}}>
                <TextField value={c} onChange={e=>updateClass(i,e.target.value)} />
              </Box>
            ))}
            <Button sx={{mt:1}} onClick={addClass}>Add Class</Button>
          </Grid>

          <Grid item xs={12}>
            <Typography>Subjects</Typography>
            {subjects.map((s,i)=>(
              <Box key={i} sx={{display:'flex', gap:1, mt:1}}>
                <TextField label="Subject" value={s.name} onChange={e=>updateSubject(i,'name',e.target.value)} />
                <TextField label="Teacher" value={s.teacher} onChange={e=>updateSubject(i,'teacher',e.target.value)} />
                <TextField label="Periods/week" type="number" value={s.periods_per_week} onChange={e=>updateSubject(i,'periods_per_week',Number(e.target.value))} sx={{width:140}} />
                <Button color="error" onClick={()=>removeSubject(i)}>Remove</Button>
              </Box>
            ))}
            <Button sx={{mt:1}} onClick={addSubject}>Add Subject</Button>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleGenerate}>{loading ? 'Generating...' : 'Generate'}</Button>
            {error && <Typography color="error" sx={{mt:1}}>{error}</Typography>}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{mt:3}}>
        {timetable ? <TimetableView timetable={timetable} /> : <Paper sx={{p:3}}>No timetable yet.</Paper>}
      </Box>
    </div>
  )
}
