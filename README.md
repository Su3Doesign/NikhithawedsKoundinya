# NikhithawedsKoundinya

The wedding invitation is the site's home page (`index.html`). Dates, venue and RSVP details go in `details.js`. The earlier engagement invitation is in `engagement/`.

Public invitation for guests: https://su3doesign.github.io/NikhithawedsKoundinya/

## Invitation book

The home page is a tall open invitation book, with the reading page on the right
and part of the left page outside the frame. The surroundings are an overhead
pooja arrangement with bananas, a coconut, turmeric, kumkum, rice and a diya.

Use the arrows, left/right keys, chapter menu, or a horizontal swipe to turn
pages. Every section stays on exactly one leaf. The complete composition fits the
available paper area, including on small screens. There are no continuation
pages and no internal scrolling.
The reverse of every turning leaf is blank paper.
The turn gently lifts the outside edge with a travelling shadow; the content
remains one intact sheet. Reduced-motion users get an immediate page change.
The bookmark has been removed. Small textured pasupu and kumkuma touches sit
in the four outer corners of each leaf, clear of the text.

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
The full heading **చల్లపల్లి వారి పెళ్లి పిలుపు** is bold on pages 1 and 3.
The first line, **చల్లపల్లి వారి**, is larger than **పెళ్లి పిలుపు** beneath it;
their combined height keeps room for the rest of the card on a phone.
Elsewhere, only the surname **చల్లపల్లి** is bold. The couple's names on
pages 1 and 3 are semibold, with the same typeface and size; the surrounding
invitation wording stays regular.

The portrait scene crossfades from the original couple photograph to the two
supplied portraits in `img/portraits/`. Every image uses `object-fit: contain`
without a rounded mask, so heads and full figures remain visible. The bride's
current image is the supplied purple-saree watercolor at
`img/portraits/nikhitha-watercolor.jpg`. The individual portraits introduce
**వధువు** and **వరుడు** with a brush reveal that follows each Telugu letter
and vowel mark. The plum/indigo ink has a paper texture and a small finishing
flourish. These captions occupy their own row beneath the complete portrait;
on very short landscape screens they occupy a separate column. They cannot
overlap either face. The portrait's outer paper edges softly blend into the
leaf, and the original photos remain unchanged. The outlined SVG lettering
in `img/lettering/` is embedded in both HTML files, so it does not depend on a
font download. Reduced-motion users see completed lettering without animation.
The first couple photograph has no role watermark. The Arundhati
star sequence ends in the couple's Telugu names. The knots and seven-step
scenes retain their effects and have pause/replay controls.
The Shubham page closes on warm ivory paper with a small muggu, lamps and a
Telugu blessing. It has no black background.

**Auto-read starts automatically when the invitation opens**, plays each
scene, and turns the page after time to read it. The speed menu controls reading
and scene playback. The new **1×** is the previous **1.5×** pace, and the new
**0.5×** is the previous **1×** pace; the fastest **1.5×** option uses a 2×
multiplier of the original pace. **Only the auto-read Pause button turns off
automatic page turning.** Next/Previous, chapter selection, swipes, keyboard
navigation, language choices, music and scene controls all keep it running.
Each newly selected page gets its full reading time; other interactions do not
reset or delay its timer. Scene pause/replay changes only that scene's effects.

Opening another tab or app temporarily holds the page, its reading timer and
any page turn in progress. Returning resumes from the same point at the selected
speed, without counting time away or skipping pages. A deliberate Pause stays
paused after navigation and after returning. At the last page, the tour finishes
and offers **Read again**; navigating back also continues if auto-read is enabled.
Music remains independent. Reduced-motion mode skips the 3D turn and presents
still content; the invitation also remains readable without JavaScript.

The **Scroll version** link opens `scroll.html`, which shares the corrected
photos, Telugu invitation and star-to-names sequence in a linear layout.
`js/app.js` contains shared effects; `js/book.js` manages fitting and turns;
`js/presence.js` shares temporary away/return handling with both views and music;
`book.css` styles the book and surroundings.

## Current event and RSVP details

- Mehndi: Friday, **11 December 2026**.
- Haldi and Pelli Kuthuru: Saturday, **12 December 2026**.
- Wedding: Sunday, **13 December 2026, 8:22 pm IST**.
- Calls and WhatsApp: **+91 80082 92935**. Both links use `rsvp.whatsapp`.

The calendar, countdown, Telugu invitation and wedding event row all use
`muhurtham` in `details.js`. The venue is **Kothapali Sri Ramulu Kanakamma
Lions Club Auditorium, Nidadavolu, Andhra Pradesh 534301**. The supplied map
and Directions button both open https://maps.app.goo.gl/Jujf5zxxT4sRujSr8.
`img/venue-map.jpg` is the owner's latest map without the white vignette,
retained without cropping or redrawing. The venue leaf matches its paper color
(#f5ece3), with no image frame, shadow or added vignette.
The previous terrain image and its license remain in the repository as an
unused alternative. The complete venue section still fits one leaf, including
on a phone in landscape. Pre-wedding event times/locations and panchangam details
are still unprovided; unfilled optional lines are hidden.

The corner treatment is inspired by the customary application of pasupu and
kumkuma to a shubhalekha; see the [Telugu reference](https://telugu.hashtagu.in/devotional/why-pasupu-and-kukuma-put-for-wedding-card-what-is-the-reason-of-invitation-cards-247180.html).

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
key press anywhere on the invitation starts music while auto-read continues.
An initially hidden tab attempts music and auto-read on its first visibility.
The music button also starts
it and lets guests pause or resume. A deliberate pause stays paused during
navigation. Music loops, waits while the invitation is in the background and
resumes on return if it was playing. Loading failures
allow retry without stopping the invitation. These controls apply to both the
book and scroll views. See `audio/README.md` to replace the recording.

## Auto-scroll in the scroll view

Auto-scroll starts when the page opens. Use pause/resume and **0.5×**, **1×**
or **1.5×** speed. `autoScroll.pixelsPerSecond` in `details.js` is the original
base pace (80); the new speed options apply 1×, 1.5× and 2× multipliers, so the
default pace is 120 pixels per second. Set `autoScroll.startAutomatically` to
`false` to disable automatic start in both views. Only **Pause scroll** turns
auto-scroll off. Taps, controls, keyboard navigation and manual scrolling keep
it enabled; it continues from the newly selected position at the same pace.
Switching away holds the position until the guest returns. It finishes at the
end, where **Replay** starts again; scrolling back up also continues if enabled.
An initially hidden tab starts on first visibility; a guest pause stays paused.
Music attempts playback on opening and uses the first interaction when the browser requires it.

## Local preview

Run `python3 -m http.server 8000` in this repository and open
`http://localhost:8000/`. No build step or package installation is needed.

With Python Playwright and Chromium installed, run the interaction regressions
against that server with `python tests/tour_browser.py --url http://localhost:8000`.
They check page controls, scene interactions, reading pace, away/return lifecycle,
music, explicit Pause, replay and the linear scroll view.

The separate Sites checkout packages these same files under `dist/`. Keep
asset paths relative to `index.html`; do not add `dist/` to `music.src`.
