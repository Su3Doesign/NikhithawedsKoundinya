# Wedding music

`dichotomy-of-fame.mp3` is the uploaded recording and default background song.
`details.js` selects `audio/dichotomy-of-fame.mp3` at volume `0.36`.
The previous generated instrumental has been removed; no substitute tune plays.

The site attempts audible playback on opening. If the browser blocks autoplay,
the first tap or key press anywhere on the invitation starts the recording
without pausing auto-read or auto-scroll.
The music button also plays, pauses, and resumes it. Music loops and pauses
when the tab is hidden. Browser autoplay restrictions cannot be overridden by
the website.

To replace the music, upload a real MP3 here and update `music.src` in
`details.js` if its filename changes. Keep paths relative to the site's root;
do not add `dist/` to the path. Commit both the audio and configuration before
deploying. Loading failures display a retry message instead of another tune.
