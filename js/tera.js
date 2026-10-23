/* ------------------------------------------------------------------
   The tera: a silk cloth held between bride and groom, lowered at the
   muhurtham. A grid of vertices in raw WebGL, folded by a few sine
   waves, lit from the upper left, with a soft shadow on the photograph.
   Falls back to a flat painted cloth where WebGL isn't available.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var VS = [
    'attribute vec2 aUV;',
    'uniform vec2 uRes; uniform vec4 uRect; uniform float uP, uT, uV, uShadow;',
    'varying vec2 vUV; varying float vShade; varying float vSpec;',
    'vec3 disp(vec2 uv){',
    '  float w = uRect.z, h = uRect.w;',
    '  float x = (uv.x - 0.5) * w;',
    '  float y = uRect.y + uv.y * h + uP * (h + uRes.y * 0.3);',
    '  float side = 2.0 * uv.x - 1.0;',
    '  y += (1.0 - side * side) * (0.014 + 0.08 * uP) * w * (1.0 - uv.y * 0.65);',
    '  float z = sin(uv.x * 11.0 + uT * 1.1 + uv.y * 2.5) * 0.010 * w * (0.4 + uv.y)',
    '          + sin(uv.y * 6.0 - uT * 1.5 + uv.x * 4.0) * 0.008 * w * uv.y',
    '          + sin(uv.x * 30.0 + sin(uv.y * 3.0 + uT * 0.8) * 0.7) * 0.0035 * w * (0.3 + uv.y)',
    '          + sin(uv.x * 7.0 + uT * 5.0 + uv.y * 3.0) * uV * 0.04 * w * uv.y;',
    '  x += sin(uT * 0.9 + uv.y * 2.0) * 0.006 * w * uv.y + z * 0.15;',
    '  return vec3(uRect.x + w * 0.5 + x, y, z);',
    '}',
    'void main(){',
    '  vec3 p = disp(aUV);',
    '  vec3 n = normalize(cross(disp(aUV + vec2(0.01, 0.0)) - p, disp(aUV + vec2(0.0, 0.01)) - p));',
    '  if (n.z < 0.0) n = -n;',
    '  vec3 L = normalize(vec3(-0.45, -0.55, 1.0));',
    '  vShade = 0.58 + 0.52 * max(dot(n, L), 0.0);',
    '  vSpec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 36.0) * 0.22;',
    '  vUV = aUV;',
    '  vec2 c = vec2(uRect.x + uRect.z * 0.5, uRect.y + uRect.w * 0.5);',
    '  vec2 q = c + (p.xy - c) * (1.0 + p.z / 900.0);',
    '  q += uShadow * vec2(uRect.z * 0.035, uRect.w * 0.045);',
    '  gl_Position = vec4(q.x / uRes.x * 2.0 - 1.0, 1.0 - q.y / uRes.y * 2.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'uniform sampler2D uTex; uniform float uShadow;',
    'varying vec2 vUV; varying float vShade; varying float vSpec;',
    'void main(){',
    '  if (uShadow > 0.5) { gl_FragColor = vec4(0.16, 0.10, 0.07, 0.20); return; }',
    '  vec3 c = texture2D(uTex, vUV).rgb * vShade + vec3(vSpec);',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  /* the cloth itself: turmeric silk, a kumkum border woven with zari,
     and a cream medallion with the kalasham at its centre */
  function paintCloth(size, kal) {
    var W = size, H = Math.round(size * 1.12);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#EDB63C'); g.addColorStop(0.55, '#E0A526'); g.addColorStop(1, '#CF931C');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // weave and a silk sheen
    x.globalAlpha = 0.07; x.fillStyle = '#7A4A08';
    for (var yy = 0; yy < H; yy += 3) x.fillRect(0, yy, W, 1);
    x.globalAlpha = 0.05; x.fillStyle = '#FFF2C8';
    for (var xx = 0; xx < W; xx += 4) x.fillRect(xx, 0, 1, H);
    x.globalAlpha = 1;

    var b = Math.round(W * 0.085), z = '#F2CF74';
    x.fillStyle = '#B3261E';
    x.fillRect(0, 0, W, b); x.fillRect(0, H - b, W, b); x.fillRect(0, 0, b, H); x.fillRect(W - b, 0, b, H);
    x.fillStyle = z;
    var t = Math.max(2, Math.round(W * 0.004));
    [b * 0.18, b * 0.82].forEach(function (o) {
      x.fillRect(o, o, W - 2 * o, t); x.fillRect(o, H - o - t, W - 2 * o, t);
      x.fillRect(o, o, t, H - 2 * o); x.fillRect(W - o - t, o, t, H - 2 * o);
    });
    var tw = b * 0.5, th = b * 0.42, i;
    x.beginPath();
    for (i = b; i < W - b - tw * 0.5; i += tw) { x.moveTo(i, b); x.lineTo(i + tw / 2, b + th); x.lineTo(i + tw, b); }
    for (i = b; i < W - b - tw * 0.5; i += tw) { x.moveTo(i, H - b); x.lineTo(i + tw / 2, H - b - th); x.lineTo(i + tw, H - b); }
    x.fillStyle = '#B3261E'; x.fill();
    x.fillStyle = '#F5EFE3';
    for (i = b * 0.5; i < W; i += b * 0.5) { dot(x, i, b * 0.5, W * 0.0045); dot(x, i, H - b * 0.5, W * 0.0045); }
    for (i = b * 0.5; i < H; i += b * 0.5) { dot(x, b * 0.5, i, W * 0.0045); dot(x, W - b * 0.5, i, W * 0.0045); }

    // the medallion
    var cx = W / 2, cy = H * 0.48, R = W * 0.25;
    x.fillStyle = '#F5EFE3'; dot(x, cx, cy, R);
    x.strokeStyle = '#B3261E'; x.lineWidth = W * 0.006; x.beginPath(); x.arc(cx, cy, R * 0.93, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#B3261E';
    for (i = 0; i < 36; i++) { var a = i / 36 * Math.PI * 2; dot(x, cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12, W * (i % 2 ? 0.0045 : 0.008)); }
    if (kal && kal.naturalWidth) {
      var kh = R * 1.6, kw = kh * kal.naturalWidth / kal.naturalHeight;
      x.drawImage(kal, cx - kw / 2, cy - kh * 0.54, kw, kh);
    } else {
      x.fillStyle = '#B3261E'; dot(x, cx, cy, R * 0.18);
    }
    return c;
  }
  function dot(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }

  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
    return s;
  }

  function create(canvas, frame, pin, fallbackEl, kalSrc) {
    var api = { ok: false, p: 0, v: 0, active: false };
    var gl = null, prog, loc = {}, count = 0, tex;
    var rect = [0, 0, 1, 1], res = [1, 1], dpr = 1;
    var size = window.innerWidth < 700 ? 768 : 1024;
    var cloth = paintCloth(size, null);

    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'high-performance' });
    } catch (e) { gl = null; }

    if (gl) {
      try {
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
        gl.useProgram(prog);
        ['uRes', 'uRect', 'uP', 'uT', 'uV', 'uShadow', 'uTex'].forEach(function (k) { loc[k] = gl.getUniformLocation(prog, k); });

        var SX = 40, SY = 48, uv = [], idx = [], i, j;
        for (j = 0; j <= SY; j++) for (i = 0; i <= SX; i++) uv.push(i / SX, j / SY);
        for (j = 0; j < SY; j++) for (i = 0; i < SX; i++) {
          var a = j * (SX + 1) + i, b = a + 1, c = a + SX + 1, d = c + 1;
          idx.push(a, c, b, b, c, d);
        }
        count = idx.length;
        var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
        var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
        var aUV = gl.getAttribLocation(prog, 'aUV');
        gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

        tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloth);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(loc.uTex, 0);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        api.ok = true;
      } catch (err) { gl = null; api.ok = false; }
    }

    if (kalSrc) {
      var kim = new Image();
      kim.onload = function () {
        cloth = paintCloth(size, kim);
        if (api.ok) {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloth);
          api.draw(performance.now() / 1000);
        } else if (fallbackEl) {
          fallbackEl.style.backgroundImage = 'url(' + cloth.toDataURL('image/jpeg', 0.86) + ')';
        }
      };
      kim.src = kalSrc;
    }

    if (!api.ok && fallbackEl) {
      fallbackEl.style.backgroundImage = 'url(' + cloth.toDataURL('image/jpeg', 0.86) + ')';
      fallbackEl.classList.add('on');
      canvas.style.display = 'none';
    }

    api.resize = function () {
      var pr = pin.getBoundingClientRect(), fr = frame.getBoundingClientRect();
      res = [pr.width, pr.height];
      rect = [fr.left - pr.left + fr.width * 0.06, fr.top - pr.top + fr.height * 0.035, fr.width * 0.88, fr.height * 0.8];
      if (api.ok) {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(res[0] * dpr); canvas.height = Math.round(res[1] * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      } else if (fallbackEl) {
        fallbackEl.style.left = rect[0] + 'px'; fallbackEl.style.top = rect[1] + 'px';
        fallbackEl.style.width = rect[2] + 'px'; fallbackEl.style.height = rect[3] + 'px';
      }
      api.draw(performance.now() / 1000);
    };

    api.draw = function (t) {
      if (!api.ok) {
        if (fallbackEl) fallbackEl.style.transform = 'translate3d(0,' + (api.p * (rect[3] + res[1] * 0.3)).toFixed(1) + 'px,0)';
        return;
      }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (api.p >= 0.999) return;
      gl.uniform2f(loc.uRes, res[0], res[1]);
      gl.uniform4f(loc.uRect, rect[0], rect[1], rect[2], rect[3]);
      gl.uniform1f(loc.uP, api.p); gl.uniform1f(loc.uT, t); gl.uniform1f(loc.uV, api.v);
      gl.uniform1f(loc.uShadow, 1); gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
      gl.uniform1f(loc.uShadow, 0); gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    };

    return api;
  }

  window.Tera = { create: create, paintCloth: paintCloth };
})();
