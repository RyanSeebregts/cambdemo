This is my demo project for Camb AI

Created with default NextJS (13) template
## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Add audio track by clicked one of the 4 instruments. Remove a track by clicking the delete button on the track you want. 

The tracks can be moved around, And the play needle can be moved to a different time slot.

Playback speed can be set to 1x or 2x

Hovering on a track shows the tracks length and the start time of that track


## Libraries Used

I tried to keep the libraries down to a minimum to showcase my own ability, so the libraries used were:
 
    - JQuery
    - JQuery UI
    - React Icons
    - UUID
    - NextJS (I guess its the framework, but I'll put it here anyway)

## Explanation and Justification

So the application tries to solve a few issues related to this type of audio timeline playback.

Firstly there is the issue of keeping track of which audio is playing/should be playing, given that we are not using any third party audio libraries.
This means we will have to manually play and pause all audio clips outself and then try keep track of which ones should be and should not be playing. 
To do this we store the AudioTracks in a 

