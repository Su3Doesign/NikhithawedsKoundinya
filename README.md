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
star sequence ends in the couple's Telugu names. The knots and seven-step
scenes retain their effects and have pause/replay controls.

**Auto-read starts automatically when the invitation opens**, plays each
scene, and turns the page after time to read it. The speed menu controls reading
and scene playback. The new **1×** is the previous **1.5×** pace, and the new
**0.5×** is the previous **1×** pace; the fastest **1.5×** option uses a 2×
multiplier of the original pace. Touching the page, changing
chapters, pressing Escape, or hiding the tab pauses automatic page turning.
Music remains independent. Reduced-motion mode skips the 3D turn and presents
still content; the invitation also remains readable without JavaScript.

The **Scroll version** link opens `scroll.html`, which shares the corrected
photos, Telugu invitation and star-to-names sequence in a linear layout.
`js/app.js` contains shared effects; `js/book.js` manages fitting and turns;
`book.css` styles the book and surroundings.

## Current event and RSVP details

- Mehndi: Friday, **11 December 2026**.
- Haldi and Pelli Kuthuru: Saturday, **12 December 2026**.
- Wedding: Sunday, **13 December 2026, 8:22 pm IST**.
- Calls and WhatsApp: **+91 80082 92935**. Both links use `rsvp.whatsapp`.

The calendar, countdown, Telugu invitation and wedding event row all use
`muhurtham` in `details.js`. Venue name/address, pre-wedding event times and
locations, and panchangam details are still unprovided. The existing map link
works; unfilled optional lines are hidden, so there are no empty pages.

## Bring back Talambralu

Talambralu is disabled in both the book and scroll views, leaving ten book
pages. Its full markup, four verses, rice animation, assets, styling and
original chapter position are retained. To restore it, set
**`sections.talambralu: true` in `details.js`** and redeploy.
`js/sections.js` applies that setting before chapters and effects initialize.
The HTML also keeps it hidden when JavaScript is unavailable.

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

Auto-scroll starts when the page opens. Use pause/resume and **0.5×**, **1×**
or **1.5×** speed. `autoScroll.pixelsPerSecond` in `details.js` is the original
base pace (80); the new speed options apply 1×, 1.5× and 2× multipliers, so the
default pace is 120 pixels per second. Set `autoScroll.startAutomatically` to
`false` to disable automatic start in both views. Manual navigation or hiding
the tab pauses the tour. It stops at the end, where **Replay** starts again.
An initially hidden tab starts on first visibility; a guest pause stays paused.
Music attempts playback on opening and uses the first interaction when the browser requires it.

## Local preview

Run `python3 -m http.server 8000` in this repository and open
`http://localhost:8000/`. No build step or package installation is needed.

The separate Sites checkout packages these same files under `dist/`. Keep
asset paths relative to `index.html`; do not add `dist/` to `music.src`.
