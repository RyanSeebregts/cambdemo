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
To do this we store all the audio tracks a user has added in an array of tracks. We then have a secondary array which stores which tracks are playing and which arent. Currently an item in the playing tracks array is just a duplicate object of the item from the list of all tracks, but this could be optomised to instead use their ID and then lookup the tracks from all tracks. This is done multiple times every second however so it does become a slight issue in performance if that is done. An array of playing tracks was chose (instead of an alternative such as a flag on all the tracks), due to us needing to iterate through all the tracks regularly to check if we need to change the offset of the audio we are currently playing for each track. If we were to do this for all tracks, then it would become extremely slow when we added many many tracks. But instead now we are only limited by the number of total tracks playing at once, which gives us much improved performance.

Now since we are manageing the playing and pausing of all audio, we also have to be careful when we change the location of any object in the timeline of tracks, or the time of the timeline itself. This is because we don't want to only play the tracks from the beginning, we want to play the tracks from the time that corresponds to the time in the timeline. This means we need to calculate the offset for a track any time any elements in the timeline change. Luckily this can be optomised most of the time to only be done on the tracks it effects. And only ever needs to be done on the tracks currently being played, which optomises it further.

