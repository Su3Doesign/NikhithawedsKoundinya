/* ------------------------------------------------------------------
   Photograph -> painting, driven by scroll.

   Three textures: the photograph, the painting's washes, and its ink
   line (alpha). As progress runs 0 -> 1 the photo fades back toward the
   paper while the line draws itself in along an organic noise front,
   then the washes bloom in, with a little extra pigment at their edge.
   Raw WebGL1, one quad. Falls back to a plain cross-fade of two images.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var VS = 'attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }';
  var FS = [
    'precision mediump float;',
    'varying vec2 uv;',
    'uniform sampler2D uPhoto, uWash, uLine;',
    'uniform float uP; uniform vec2 uCover;',
    'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);',
    '  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }',
    'float fbm(vec2 p){ float a = .5, s = 0.; for (int k = 0; k < 4; k++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }',
    'void main(){',
    '  vec2 t = (uv - .5) * uCover + .5;',
    '  vec3 paper = vec3(.957, .922, .855);',
    '  vec3 photo = texture2D(uPhoto, t).rgb;',
    '  vec3 wash = texture2D(uWash, t).rgb;',
    '  float line = texture2D(uLine, t).a;',
    '  float sweep = t.y * .55 + t.x * .15;',
    '  float n1 = fbm(t * 5.) * .55 + sweep;',
    '  float lp = smoothstep(0., .55, uP) * 1.45;',
    '  float lineIn = smoothstep(n1 - .05, n1 + .05, lp);',
    '  float fade = smoothstep(.04, .5, uP);',
    '  vec3 under = mix(photo, paper, fade * .92);',
    '  float n2 = fbm(t * 3. + 7.1) * .6 + (1. - t.y) * .25;',
    '  float wp = smoothstep(.38, .98, uP) * 1.25;',
    '  float washIn = smoothstep(n2 - .09, n2 + .09, wp);',
    '  vec3 col = mix(under, wash, washIn);',
    '  float front = washIn * (1. - washIn) * 4.;',
    '  col *= 1. - .12 * front;',
    '  col = mix(col, vec3(.2, .137, .102), line * lineIn * .95);',
    '  gl_FragColor = vec4(col, 1.);',
    '}'
  ].join('\n');

  function load(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = src;
    });
  }

  function create(canvas, srcs) {
    var api = { ok: false, p: 0, ready: null };
    var gl;
    try { gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false }); } catch (e) { gl = null; }
    if (!gl) { api.ready = Promise.resolve(false); return api; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog, loc = {}, tex = [], aspect = 0.75;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(prog);
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var a = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ['uPhoto', 'uWash', 'uLine', 'uP', 'uCover'].forEach(function (k) { loc[k] = gl.getUniformLocation(prog, k); });
    } catch (e) { api.ready = Promise.resolve(false); return api; }

    function upload(unit, im) {
      var t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    api.resize = function () {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(r.width * dpr));
      canvas.height = Math.max(2, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      // cover-fit the 3:4 artwork into whatever box the canvas has
      var boxA = r.width / Math.max(r.height, 1);
      gl.uniform2f(loc.uCover, boxA > aspect ? 1 : boxA / aspect, boxA > aspect ? aspect / boxA : 1);
      api.draw();
    };
    api.draw = function () {
      if (!api.ok) return;
      gl.uniform1f(loc.uP, api.p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    api.ready = Promise.all([load(srcs.photo), load(srcs.wash), load(srcs.line)]).then(function (ims) {
      aspect = ims[0].naturalWidth / ims[0].naturalHeight;
      tex = ims.map(function (im, i) { return upload(i, im); });
      gl.uniform1i(loc.uPhoto, 0); gl.uniform1i(loc.uWash, 1); gl.uniform1i(loc.uLine, 2);
      api.ok = true;
      api.resize();
      return true;
    }).catch(function () { return false; });
    return api;
  }

  window.Paint = { create: create };
})();
