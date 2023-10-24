import { useCallback, useEffect, useMemo, useState } from 'react';
import {v4 as uuid} from 'uuid'
import TrackSelector from '../TrackSelector/TrackSelector';
import { AudioFileType } from '../../util/types';
import { baseAudio } from '../../util/data';
import classes from './Timeline.module.css'
import TimelineControls from '../TimelineControls/TimelineControls';
import elementClasses from './TimelineElement.module.css'
import { timeToPixel } from '../../util/timeConversionUtil';
import dynamic from 'next/dynamic';

//This is one of the workarounds to get rid of the error messages from nextjs when using Jquery UI (due to Jquery UI not being SSR compatable)
const DynamicTimelineElement = dynamic(
  () => import('./TimelineElement'),
  { ssr: false }
);

const DynamicScrubbingElement = dynamic(
    () => import('./Scrubber'),
    { ssr: false }
);

//Check if the audio with a given ID is not being played
const checkIfAudioNotPlaying = (id: string, playingAudio: AudioFileType[]) => {
    return playingAudio.find((file) => file.id === id) === undefined;
}

//Check if the current time is between the audios start and end time
const checkIfAudioBetweenStartEnd = (currentTime: number, start: number, length: number) => {
    const endTime = start + length;
    if(currentTime >= start && currentTime <= endTime) {
        return true;
    }
    return false;
}

export default function Timeline() {
    
    //This is the current time of our timeline
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [audioFiles, setAudioFiles] = useState<AudioFileType[]>([]);
    const [audioFilesPlaying, setAudioFilePlaying] = useState<AudioFileType[]>([]);

    //toggle the playing state
    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying)
    }, [setIsPlaying, isPlaying])

    //toggle between the 2 playback speeds
    const toggleSpeedHandler = useCallback(() => {
        const newSpeed = speed === 1 ? 2 : 1;
        setSpeed(newSpeed)
        audioFilesPlaying.forEach((audio) => {
            audio.audio.playbackRate = newSpeed
        })
    }, [speed, setSpeed, audioFilesPlaying])

    //function to set the time of the timeline
    const setTimeHandler = useCallback((newTime: number) => {
        //here we have to check if out timeline is now going to be in the middle of any of our audio files
        const newAudioFilesPlaying = [];
        for(const file of audioFilesPlaying) {
            //if our audio is playing and we are not outside of its time now, we want to keep playing
            //but we also want to check if we are now at a different offset in the audio track
            if(checkIfAudioBetweenStartEnd(newTime, file.start, file.length)) {
                const offset = newTime - file.start;
                file.audio.currentTime = offset/50;
                newAudioFilesPlaying.push(file)
            } else {
                file.audio.pause();
            }
        }
        setAudioFilePlaying(newAudioFilesPlaying)
        setTime(newTime);
    }, [time, audioFilesPlaying])

    //this is the function to move the audio tracks horizontally, by settin gthe start time of a track
    const handleSetAudioFileStart = useCallback((id: string, start: number) => {
        const newAudioFiles = [...audioFiles];
        //find the track
        const index = newAudioFiles.findIndex((file) => file.id === id);
        if(index < 0) return;
        //set its start time to the new start time
        newAudioFiles[index].start = start;
        setAudioFiles(newAudioFiles);

        //if we are currently playing this audio track, then we also want to ensure that we change which part we are playing due to it movine in time
        const newAudioFilesPlaying = [...audioFilesPlaying];
        const indexPlaying = newAudioFilesPlaying.findIndex((file) => file.id === id);
        if(indexPlaying < 0) return;
        const offset = time - start;
        newAudioFilesPlaying[indexPlaying].audio.currentTime = offset/50;
    }, [audioFiles, setAudioFiles, time])

    //this adds audio tracks into the array of all tracks
    const addAudioHandler = useCallback((type: string) => {
        const baseAudioFound = baseAudio.find((audio) => audio.type === type);
        if(!baseAudioFound) return;
        const newAudio = {
            ...baseAudioFound,
            audio: new Audio(baseAudioFound.audio),
            id: uuid(),
            start: 0
        }
        const newAudioFiles = [...audioFiles];
        newAudioFiles.push(newAudio as AudioFileType)
        setAudioFiles(newAudioFiles);
    }, [audioFiles])

    //this delete audio tracks from the array of all tracks
    const deleteTrackHandler = useCallback((id: string) => {
        const newAudioFiles = [...audioFiles];
        const index = newAudioFiles.findIndex((file) => file.id === id);
        if(index < 0) return;
        newAudioFiles.splice(index, 1);
        setAudioFiles(newAudioFiles);
        
        //if an audio track is playing when we delete it, we want to also stop playing it
        const newAudioFilesPlaying = [...audioFilesPlaying];
        const indexPlaying = newAudioFilesPlaying.findIndex((file) => file.id === id);
        if(indexPlaying < 0) return;
        newAudioFilesPlaying[indexPlaying].audio.pause();
        newAudioFilesPlaying.splice(indexPlaying, 1);
        setAudioFilePlaying(newAudioFilesPlaying);

    }, [audioFiles, setAudioFiles, setAudioFilePlaying, audioFilesPlaying])

    //this function manages which tracks are playing. It is called in the intervals decided by the useEffect below
    const setupPlayArray = useCallback(() => {
        const newAudioFilesPlaying:AudioFileType[] = audioFilesPlaying
        //Here we go through each track to see if it should be playing.
        audioFiles.forEach((file) => {
            if (checkIfAudioBetweenStartEnd(time, file.start, file.length)) {
                //if the track should be playing, then we want to ensure we are playing it at the correct part of the track
                if(checkIfAudioNotPlaying(file.id, newAudioFilesPlaying)) {
                    const offset = time - file.start;
                    if(file.audio) {
                        const newAudioPlayingObject = {...file}
                        newAudioPlayingObject.audio.currentTime = offset/50;
                        newAudioPlayingObject.audio.playbackRate = speed;
                        newAudioFilesPlaying.push(newAudioPlayingObject)
                    }
                }
            }
            else {
                //if it should not be playing then make sure it is not in the array for the playing tracks
                if(!checkIfAudioNotPlaying(file.id, newAudioFilesPlaying)) {
                    const index = newAudioFilesPlaying.findIndex((audioFile) => audioFile.id === file.id);
                    newAudioFilesPlaying[index].audio.pause();
                    newAudioFilesPlaying.splice(index, 1);
                }
            }
        }); 
        setAudioFilePlaying(newAudioFilesPlaying);
        //only play the tracks inside the array of playing tracks
        audioFilesPlaying.forEach((file) => {
            file.audio.play();
        })
    }, [time, audioFiles, speed])

    //This useEffect is responsible for kicking off the main loop which is what manages the audio files
    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        let timeoutId: NodeJS.Timeout | undefined;
    
        function startInterval() {
            intervalId = setInterval(() => {
                if(time >= 1500) {
                    togglePlay();
                    return;
                }
                setTime((prevTime) => prevTime + (10 * speed));
                setupPlayArray();
            }, 100);
        }
    
        if (isPlaying) {
            const now = new Date();
            const msUntilNextInterval = 100 - (now.getMilliseconds() % 100);
            timeoutId = setTimeout(startInterval, msUntilNextInterval);
        } else {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
    
            audioFilesPlaying.forEach((file) => {
                file.audio.pause();
            });
            setAudioFilePlaying([]);
        }
    
        return () => {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isPlaying, setupPlayArray]);
    
    return (
        <>
            <TrackSelector addTrack={addAudioHandler} />

            <TimelineControls isPlaying={isPlaying} togglePlay={togglePlay} time={time} totalTime={1500} toggleSpeed={toggleSpeedHandler} speed={speed}/>

            <div className={classes.timelineContainer}>
                <div className={classes.timeline} style={{width: timeToPixel(1500)}}>
                    <DynamicScrubbingElement time={time} setTime={setTimeHandler}/>
                    {
                        audioFiles.map((a, key) =>
                                <DynamicTimelineElement deleteTrack={deleteTrackHandler} firstElement={key === 0} key={key} index={key} name={a.name} length={a.length} start={a.start} color={a.color} id={a.id} setStart={handleSetAudioFileStart} />
                        )
                    }
                </div>
            </div>
        </>
    )
}
