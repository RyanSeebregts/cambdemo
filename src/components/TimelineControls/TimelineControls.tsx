import { useMemo } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import classes from './TimelineControls.module.css';

interface OwnProps {
    time: number;
    totalTime: number;
    isPlaying: boolean;
    speed: number;
    togglePlay: () => void
    toggleSpeed: () => void
}
export default function TimelineControls(props: OwnProps) {

    const time = useMemo(() => {
        const seconds = Math.floor((props.time) / 50);
        const remainingMilliseconds = (props.time) % 50;
        
        const formattedSeconds = String(seconds).padStart(2, '0');
        const formattedMilliSeconds = String(remainingMilliseconds).padStart(2, '0');
        
        return `${formattedSeconds}:${formattedMilliSeconds}`;
    }, [props.time])

    const totalTime = useMemo(() => {
        const seconds = Math.floor(props.totalTime / 50);
        const remainingMilliseconds = props.totalTime % 50;
        
        const formattedSeconds = String(seconds).padStart(2, '0');
        const formattedMilliSeconds = String(remainingMilliseconds).padStart(2, '0');
        
        return `${formattedSeconds}:${formattedMilliSeconds}`;
    }, [props.totalTime])
    
    return (
        <div className={classes.container}>
            <p>
                {`Time: ${time} / ${totalTime}`}
            </p>
            
            <button onClick={props.togglePlay}>
                {
                    props.isPlaying ? 
                        <FaPause />
                        :
                        <FaPlay />
                }
            </button>

            <button onClick={props.toggleSpeed}>
                {
                    props.speed === 1 ? 
                        "1x"
                        :
                        "2x"
                }
            </button>
        </div>
    )
}
