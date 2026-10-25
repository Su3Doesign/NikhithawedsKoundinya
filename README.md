# NikhithawedsKoundinya

The wedding invitation is the site's home page (`index.html`). Dates, venue and RSVP details go in `details.js`. The earlier engagement invitation is in `engagement/`.

## Invitation book

The home page is a tall open invitation book, with the reading page on the right
and part of the left page outside the frame. The surroundings are an overhead
pooja arrangement with bananas, a coconut, turmeric, kumkum, rice and a diya.

Use the arrows, left/right keys, chapter menu, or a horizontal swipe to turn
pages. Every section stays on exactly one leaf. The complete composition fits the
available paper area, including on small screens. There are no continuation
pages and no internal scrolling.
The reverse of every turning leaf is blank paper.

The main invitation opens in Telugu, with a traditional family, bride, groom,
muhurtham and invitation hierarchy headed **చల్లపల్లి వారి పెళ్లి పిలుపు**.
Suranna headings and names, Noto Serif Telugu body text, a slim temple border,
mango toranam and muggu ornament follow the supplied print references. The
border occupies reserved edge bands; side foliage stays outside the book. The
cover and invitation use the full reading-page width, with narrow paper margins.
On short screens the wording reflows to keep that width instead of shrinking
into a narrow card. Landscape uses two columns within the same invitation leaf.
The entire family invitation, muhurtham and signoff remain on the same page.
The surname follows the existing family spelling, Challapalli / చల్లపల్లి.
Existing family names and wedding details are preserved; unprovided panchangam
details are not invented.

The portrait scene crossfades from the original couple photograph to the two
supplied portraits in `img/portraits/`. Every image uses `object-fit: contain`
without a rounded mask, so heads and full figures remain visible. The Arundhati
star sequence ends in the couple's Telugu names. The knots, talambralu and
seven-step scenes retain their effects and have pause/replay controls.

**Auto-read** plays each scene and turns the page after time to read it. The
speed menu controls reading and scene playback. Touching the page, changing
chapters, pressing Escape, or hiding the tab pauses automatic page turning.
Music remains independent. Reduced-motion mode skips the 3D turn and presents
still content; the invitation also remains readable without JavaScript.

The **Scroll version** link opens `scroll.html`, which shares the corrected
photos, Telugu invitation and star-to-names sequence in a linear layout.
`js/app.js` contains shared effects; `js/book.js` manages fitting and turns;
`book.css` styles the book and surroundings.

## Background music

The uploaded **Dichotomy of Fame** recording at `audio/dichotomy-of-fame.mp3`
is the default and only background music. `details.js` selects its path and
volume. The previous generated instrumental has been removed.

The invitation tries to play the recording when it opens. Browsers that block
audible autoplay require an interaction first; in that case, the first tap or
key press anywhere on the invitation starts music. The music button also starts
it and lets guests pause or resume. A deliberate pause stays paused during
navigation. Music loops and pauses when the tab is hidden. Loading failures
allow retry without stopping the invitation. These controls apply to both the
book and scroll views. See `audio/README.md` to replace the recording.

## Auto-scroll in the scroll view

Tap **Auto-scroll**, then use pause/resume and **0.5×**, **1×** or **1.5×** speed.
`autoScroll.pixelsPerSecond` in `details.js` controls the base pace (default 80).
Manual navigation or hiding the tab pauses the tour. It stops at the end, where
**Replay** starts again. Auto-scroll starts only when requested; music attempts playback on page load.

## Local preview

Run `python3 -m http.server 8000` in this repository and open
`http://localhost:8000/`. No build step or package installation is needed.

The separate Sites checkout packages these same files under `dist/`. Keep
asset paths relative to `index.html`; do not add `dist/` to `music.src`.
