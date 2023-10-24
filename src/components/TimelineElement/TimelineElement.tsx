"use client"
import $ from 'jquery';
import { useEffect, useRef } from 'react';
import { pixelToTime, timeToPixel } from '../../util/timeConversionUtil';
import classes from './TimelineElement.module.css'

interface OwnProps {
    name: string;
    start: number;
    length: number;
    color: string;
    id: string;
    setStart: (id: string, start: number) => void
    index: number;
    firstElement: boolean;
}
export default function TimelineElement(props: OwnProps) {
    const draggableRef = useRef(null);

    useEffect(() => {
        if (draggableRef.current) {
            $(draggableRef.current).draggable({
            axis: "x",
            containment: "parent",
            stop: (e, ui) => {
                props.setStart(props.id, pixelToTime(ui.position.left))
            }
            });
        }
    }, [props.setStart]);
      
    return (
        <div className={classes.container} style={{background: props.index % 2 !== 1 ? "#585858" : undefined}}>
            <div 
                ref={draggableRef} 
                style={{
                    background: props.color, 
                    width: `${timeToPixel(props.length)}px`, 
                    left: timeToPixel(props.start)
                }} 
                className={classes.element}
            >
                <p>{props.name}</p>

                <div className={classes.info} style={{top: props.firstElement ? "0px" : undefined, bottom: !props.firstElement ? "calc(100% + 10px)" : undefined}}>
                    <p>Starts: {(props.start * 2)/100}</p>
                    <p>Duration: {(props.length * 2)/100}</p>
                    <p>Name: {props.name}</p>
                </div>
            </div>
        </div>
    )
}
