/* ------------------------------------------------------------------
   Everything that changes lives here.

   Leave a value as "" and the page shows a placeholder, or leaves the
   line out. Fill it in, save, and the page picks it up everywhere it
   appears: the card's face, the muhurtham, the countdown, the
   calendar link, the closing card and the WhatsApp message.
   ------------------------------------------------------------------ */
window.INVITE = {
  /* The uploaded recording is the only background music.
     Try playing on opening; browsers that block sound until interaction
     start it on the first tap or key press. Volume: 0 to 1. */
  music: {
    src: "audio/dichotomy-of-fame.mp3",
    volume: 0.36,
  },

  /* The tour starts when the invitation opens; guests can pause it.
     Speed labels 0.5x / 1x / 1.5x use the former 1x / 1.5x / 2x pace. */
  autoScroll: {
    startAutomatically: true,
    pixelsPerSecond: 80,
  },

  /* Talambralu is retained, but removed from both invitation views.
     Set true to bring back its original page, verse and rice effects. */
  sections: {
    talambralu: false,
  },

  bride: {
    name: "Nikhitha",
    te: "నిఖిత",
  },
  groom: {
    first: "Sai",
    name: "Koundinya",
    te: "సాయి కౌండిన్య",
  },

  /* The muhurtham, in India time.
     Format: "YYYY-MM-DDTHH:MM" (24-hour), e.g. "2026-12-13T20:22" */
  muhurtham: "2026-12-13T20:22",

  /* How long the calendar entry should run, in hours */
  durationHours: 3,

  /* The almanac line, as the purohit gives it. Telugu is best here.
     samvatsaram: e.g. "పరాభవ"   masam: e.g. "మాఘ"
     paksham: "శుక్ల" or "బహుళ"   tithi: e.g. "పంచమి"
     nakshatram: e.g. "రోహిణి"     lagnam: e.g. "మీన"
     Leave them empty and the line is not shown. */
  panchangam: {
    samvatsaram: "",
    masam: "",
    paksham: "",
    tithi: "",
    nakshatram: "",
    lagnam: "",
  },

  venue: {
    name: "",            // e.g. "Sri Kanya Convention"
    nameTe: "",          // e.g. "శ్రీ కన్య కన్వెన్షన్"
    address: "",         // e.g. "Road No. 2, Banjara Hills, Hyderabad"
    mapUrl: "https://share.google/GivuVJPLMGz9PauWb",   // opens from the Directions button
  },

  /* The gatherings, in the order they happen. Set show:false to hide one.
     when: free text, e.g. "Friday · 11 December · 6:00 pm"
     where: leave empty if it is at home; the line is then left out. */
  events: {
    gorintaku:    { show: true,  when: "Friday · 11 December", where: "" },
    haldi:        { show: true,  when: "Saturday · 12 December", where: "" },
    pellikuthuru: { show: true,  when: "Saturday · 12 December", where: "" },
    sangeet:      { show: false, when: "", where: "" },
    vivaham:      { show: true,  when: "", where: "" },   // left blank, it uses the muhurtham and venue above
    vindu:        { show: false, when: "", where: "" },
  },

  rsvp: {
    /* Country code and number, digits only, e.g. "919876543210" */
    whatsapp: "918008292935",
    /* How the number should read on the page, e.g. "+91 98765 43210" */
    display: "+91 80082 92935",
    message: "Namaskaram! We will be there to bless Nikhitha and Sai Koundinya.",
  },
};
