/* Load fonts and pictures, build every scene, then expose renderAt for the renderer. */
(async function () {
  const fonts = [['400 100px Ramabhadra', 'చల్లపల్లి వారి పెండ్లి పిలుపు నిఖిత సాయి కౌండిన్య శుభం సుముహూర్తం'], ['400 100px Gurajada', 'శ్రీ గణేశాయ నమః కుమార్తె కుమారుడు ఆహ్వానిస్తున్నాము'],
    ['300 100px Jost', 'A'], ['400 100px Jost', 'A'], ['500 100px Jost', 'A'], ['600 100px Jost', 'A']];
  await Promise.all(fonts.map(([f, s]) => document.fonts.load(f, s)));
  await document.fonts.ready;
  const list = {
    ganesha: 'assets/ganesha-hd.png', ornament: { src: 'assets/ornament.svg', data: { resolution: 4 } }, impact: 'assets/impact-couple.png', impactInv: 'assets/impact-couple-inv.png', lamp: { src: 'assets/diya-lamp.svg', data: { resolution: 3 } },
    frame: '../img/patrika-frame-clear.png', couple: '../img/pair-silk-1086.webp', venueMap: '../img/venue-map.jpg',
    bride: '../img/portraits/nikhitha-watercolor.jpg', groom: '../img/portraits/sai-koundinya.jpg', brideMatte: 'assets/bride-matte.png', groomMatte: 'assets/groom-matte.png',
    marigold: '../img/art/marigold.png', leaf: '../img/art/leaf.png', gorintaku: '../img/art/gorintaku.webp',
    bangles: '../img/art/bangles.webp', kalasham: '../img/art/kalasham.webp', mangal: '../img/art/knots.webp',
  };
  C.A = {};
  C.SVG = { bride: await (await fetch('../img/lettering/bride.svg')).text(), groom: await (await fetch('../img/lettering/groom.svg')).text() };
  for (const [k, v] of Object.entries(list)) C.A[k] = await PIXI.Assets.load(v);
  await C.init();
  C.buildLayers();
  (window.SCENES || []).forEach(build => build());
  window.renderAt = async (t, q) => { await C.renderAt(t); return C.app.canvas.toDataURL('image/jpeg', q || 0.93); };
  window.duration = C.DURATION;
  window.ready = true;
})().catch(e => { window.failed = String(e && e.stack || e); console.error(e); });
