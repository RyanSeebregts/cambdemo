export type AudioFileType = {
    id: string;
    name: string;
    audio: HTMLAudioElement;
    color: string;
    length: number;
    start: number;
}

export type BaseAudio = {
    name: string;
    type: string;
    audio: string;
    color: string;
    length: number;
}