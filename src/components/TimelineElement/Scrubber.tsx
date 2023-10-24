"use client"
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import { useEffect, useRef, useState } from 'react';
import { pixelToTime, timeToPixel } from '../../util/timeConversionUtil';
import classes from './Scrubber.module.css';

interface OwnProps {
    time: number;
    setTime: (newTime: number) => void;
}

export default function Scrubber(props: OwnProps) {
    const draggableRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (draggableRef.current) {
            $(draggableRef.current).draggable({
                axis: "x",
                containment: "parent",
                start: () => {
                    setIsDragging(true);
                },
                stop: (e, ui) => {
                    props.setTime(pixelToTime(ui.position.left));
                    setIsDragging(false);
                }
            });
        }
    }, [props.setTime]);

    useEffect(() => {
        if (!isDragging && draggableRef.current) {
            $(draggableRef.current).css("left", timeToPixel(props.time));
        }
    }, [props.time, isDragging]);


    return (
        <div ref={draggableRef} className={classes.container}>
            <div className={classes.handle} />
        </div>  
    )
}
