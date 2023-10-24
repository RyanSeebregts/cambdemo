"use client"
import Timeline from '../components/TimelineElement/Timeline'
import classes from './page.module.css'

export default function Home() {
 
  return (
    <main className={classes.container}>
        <p className={classes.header}>
          Camba.ai
        </p>
      <Timeline />
    </main>
  )
}
