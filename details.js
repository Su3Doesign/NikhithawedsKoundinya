/* ------------------------------------------------------------------
   Everything that changes lives here.

   Leave a value as "" and the page shows a placeholder in its place.
   Fill it in, save, and the page picks it up everywhere it appears:
   the hero, the muhurtham card, the countdown, the calendar link,
   the closing card and the WhatsApp message.
   ------------------------------------------------------------------ */
window.INVITE = {
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
     Format: "YYYY-MM-DDTHH:MM", e.g. "2027-02-14T09:32" */
  muhurtham: "",

  /* How long the calendar entry should run, in hours */
  durationHours: 3,

  /* The almanac line, as the purohit gives it. Telugu is best here.
     samvatsaram: e.g. "పరాభవ"   masam: e.g. "మాఘ"
     paksham: "శుక్ల" or "బహుళ"   tithi: e.g. "పంచమి"
     nakshatram: e.g. "రోహిణి"     lagnam: e.g. "మీన"
     (The weekday is worked out from the date.) */
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
    mapUrl: "",          // a Google Maps share link
  },

  /* The other gatherings. Set show:false to hide one.
     when: free text, e.g. "Thu 11 Feb · 6:00 pm" */
  events: {
    gorintaku:    { show: true, when: "", where: "" },
    sangeet:      { show: true, when: "", where: "" },
    pellikuthuru: { show: true, when: "", where: "" },
    vivaham:      { show: true, when: "", where: "" },   // left blank, it uses the muhurtham and venue above
    vindu:        { show: true, when: "", where: "" },
  },

  rsvp: {
    /* Country code and number, digits only, e.g. "919876543210" */
    whatsapp: "",
    /* How the number should read on the page, e.g. "+91 98765 43210" */
    display: "",
    message: "Namaskaram! We will be there to bless Nikhitha and Sai Koundinya.",
  },
};
