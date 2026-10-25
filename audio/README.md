# Add the wedding song

1. Upload your MP3 of **Dichotomy of Fame** into this folder with the exact filename:
   `dichotomy-of-fame.mp3`
2. In the repository's `details.js`, change the music setting to:

   ```js
   music: {
     src: "audio/dichotomy-of-fame.mp3",
     volume: 0.36,
   },
   ```

The file's full repository path is `audio/dichotomy-of-fame.mp3` (beside the
root `index.html` there is an `audio` folder). In the Sites deployment checkout,
these files are under `dist/`; do not include `dist/` in the `src` value.

Use a real MP3 audio file. Stereo, 44.1 kHz, and 128–192 kbps work well on phones.
Renaming a different file extension to `.mp3` does not convert the audio.

Commit/upload both the MP3 and the `details.js` change, then deploy that version.
Tap the music button to check it. The owner's chosen song loops; guests have
only play/pause controls, with no file upload or song selector.

The song file is not included yet. Until it is uploaded, `src` is intentionally
empty and the invitation uses its original generated instrumental.
