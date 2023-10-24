import { baseAudio } from '../../util/data';
import classes from './TrackSelector.module.css'

//The track selector holds the buttons which add audio tracks into the timeline
//Currently there are only 4 tracks (piano, drums, guitar and trumpet)
interface OwnProps {
    addTrack: (track: string) => void;
}
export default function TrackSelector(props: OwnProps) {
    return (
        <div className={classes.container}>
            {
                baseAudio.map((audio, key) => 
                    <button key={key} className={classes.trackButton} style={{background: audio.color}} onClick={() => props.addTrack(audio.type)}>{audio.name}</button>
                )
            }
        </div>        
    )
}