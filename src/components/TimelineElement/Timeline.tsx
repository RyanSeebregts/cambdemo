import { useCallback, useEffect, useMemo, useState } from 'react';
import Scrubber from './Scrubber';
import TimelineElement from './TimelineElement';
import {v4 as uuid} from 'uuid'
import TrackSelector from '../TrackSelector/TrackSelector';
import { AudioFileType } from '../../util/types';
import { baseAudio } from '../../util/data';
import classes from './Timeline.module.css'
import TimelineControls from '../TimelineControls/TimelineControls';
import elementClasses from './TimelineElement.module.css'
import { timeToPixel } from '../../util/timeConversionUtil';

import dynamic from 'next/dynamic';

const DynamicTimelineElement = dynamic(
  () => import('./TimelineElement'),
  { ssr: false }
);

const DynamicScrubbingElement = dynamic(
    () => import('./Scrubber'),
    { ssr: false }
  );

const checkIfAudioNotPlaying = (id: string, playingAudio: AudioFileType[]) => {
    return playingAudio.find((file) => file.id === id) === undefined;
}

const checkIfAudioBetweenStartEnd = (currentTime: number, start: number, length: number) => {
    const endTime = start + length;
    if(currentTime >= start) {
        if(currentTime <= endTime) {
            return true;
        }
    }
    return false;
}

export default function Timeline() {
    
    const [time, setTime] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const [audioFiles, setAudioFiles] = useState<AudioFileType[]>([]);
    const [audioFilesPlaying, setAudioFilePlaying] = useState<AudioFileType[]>([]);

    const toggleSpeedHandler = useCallback(() => {
        const newSpeed = speed === 1 ? 2 : 1;
        setSpeed(newSpeed)
        audioFilesPlaying.forEach((audio) => {
            audio.audio.playbackRate = newSpeed
        })
    }, [speed, setSpeed, audioFilesPlaying])

    const setTimeHandler = useCallback((newTime: number) => {
        const newAudioFilesPlaying = [];
        for(const file of audioFilesPlaying) {
            const res = checkIfAudioNotPlaying(file.id, newAudioFilesPlaying)
            if(res) {
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

    const handleSetAudioFileStart = useCallback((id: string, start: number) => {
        const newAudioFiles = [...audioFiles];
        const index = newAudioFiles.findIndex((file) => file.id === id);
        if(index < 0) return;
        newAudioFiles[index].start = start;
        setAudioFiles(newAudioFiles);

        const newAudioFilesPlaying = [...audioFilesPlaying];
        const indexPlaying = newAudioFilesPlaying.findIndex((file) => file.id === id);
        if(indexPlaying < 0) return;
        const offset = time - start;
        newAudioFilesPlaying[indexPlaying].audio.currentTime = offset/50;
    }, [audioFiles, setAudioFiles, time])

    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying)
    }, [setIsPlaying, isPlaying])

    const setupPlayArray = useCallback(() => {
        const newAudioFilesPlaying:AudioFileType[] = audioFilesPlaying
        audioFiles.forEach((file) => {
            if (checkIfAudioBetweenStartEnd(time, file.start, file.length)) {
                const res = checkIfAudioNotPlaying(file.id, newAudioFilesPlaying)
                if(res) {
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
                if(!checkIfAudioNotPlaying(file.id, newAudioFilesPlaying)) {
                    const index = newAudioFilesPlaying.findIndex((audioFile) => audioFile.id === file.id);
                    newAudioFilesPlaying[index].audio.pause();
                    newAudioFilesPlaying.splice(index, 1);
                }
            }
        }); 
        setAudioFilePlaying(newAudioFilesPlaying);
        audioFilesPlaying.forEach((file) => {
            file.audio.play();
        })
    }, [time, audioFiles, speed])

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

    const emptyAudioTimeline = useMemo(() => {
        if(audioFiles.length > 2) {
            return []
        }
        return new Array(3 - audioFiles.length).fill(0)
    }, [audioFiles])

    const deleteTrackHandler = useCallback((id: string) => {
        const newAudioFiles = [...audioFiles];
        const index = newAudioFiles.findIndex((file) => file.id === id);
        if(index < 0) return;
        newAudioFiles.splice(index, 1);
        setAudioFiles(newAudioFiles);
        
        const newAudioFilesPlaying = [...audioFilesPlaying];
        const indexPlaying = newAudioFilesPlaying.findIndex((file) => file.id === id);
        if(indexPlaying < 0) return;
        newAudioFilesPlaying[indexPlaying].audio.pause();
        newAudioFilesPlaying.splice(indexPlaying, 1);
        setAudioFilePlaying(newAudioFilesPlaying);

    }, [audioFiles, setAudioFiles, setAudioFilePlaying, audioFilesPlaying])
    
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
                    {
                        emptyAudioTimeline.map((_, key) => 
                                <div className={elementClasses.container} key={key} style={{background: (key + audioFiles.length % 2) !== 1 ? "#3f3f3f" : undefined}} />

                        )
                    }
                </div>
            </div>
        </>
    )
}
