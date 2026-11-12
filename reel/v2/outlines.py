"""Shape Telugu and Latin strings with HarfBuzz and write their outlines, one clean
(overlap-free) path per syllable cluster, to v2/outlines.json for 3D extrusion.
python3 v2/outlines.py     (needs uharfbuzz, fonttools, brotli, skia-pathops; fonts from ./fonts.sh)"""
import glob, io, json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.basePen import decomposeQuadraticSegment
import pathops

STRINGS = {
    'ganesha': ('Ramabhadra', 'ఓం శ్రీ గణేశాయ నమః'),
    'family': ('Ramabhadra', 'చల్లపల్లి వారి'),
    'title': ('Ramabhadra', 'పెండ్లి పిలుపు'),
    'bride': ('Ramabhadra', 'నిఖిత'),
    'groom': ('Ramabhadra', 'సాయి కౌండిన్య'),
    'muhurtham': ('Ramabhadra', 'శుభ ముహూర్తం'),
    'time': ('Jost-400', '8:22'),
    'shubham': ('Ramabhadra', 'శుభం'),
    'gift1': ('Ramabhadra', 'కానుకలు స్వీకరించబడవు'),
    'amp': ('Jost-400', '&'),
    'gift2': ('Ramabhadra', 'మీ రాకే మాకు కానుక'),
}

def load(prefix, sample):
    for f in sorted(glob.glob(f'fonts/{prefix}*.woff2')):
        tt = TTFont(f)
        if all(ord(c) in tt.getBestCmap() for c in sample if c.strip()):
            tt.flavor = None; buf = io.BytesIO(); tt.save(buf)
            return tt, buf.getvalue()
    raise SystemExit(f'no {prefix} font covers {sample!r}; run ./fonts.sh')

out = {}
for key, (fam, text) in STRINGS.items():
    tt, data = load(fam, text)
    upem = tt['head'].unitsPerEm; gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
    font = hb.Font(hb.Face(data)); buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); hb.shape(font, buf)
    clusters, x = {}, 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        assert name != '.notdef', (key, text, info.cluster)
        c = clusters.setdefault(info.cluster, pathops.Path())
        gs[name].draw(TransformPen(c.getPen(glyphSet=gs), (1, 0, 0, 1, x + pos.x_offset, pos.y_offset)))
        x += pos.x_advance
    items = []
    for cl in sorted(clusters):
        p = clusters[cl]; p.simplify(fix_winding=True, keep_starting_points=False)
        cmds, cur = [], None
        for verb, pts in p.segments:
            if verb == 'moveTo': cmds.append(['M', *pts[0]]); cur = pts[0]
            elif verb == 'lineTo': cmds.append(['L', *pts[0]]); cur = pts[0]
            elif verb == 'qCurveTo':
                if pts[-1] is None:      # a closed contour made only of off-curve points
                    offs = pts[:-1]; start = ((offs[-1][0] + offs[0][0]) / 2, (offs[-1][1] + offs[0][1]) / 2)
                    cmds.append(['M', *start]); pts = tuple(offs) + (start,)
                for c1, e in decomposeQuadraticSegment(pts): cmds.append(['Q', *c1, *e]); cur = e
            elif verb == 'curveTo': cmds.append(['C', *pts[0], *pts[1], *pts[2]]); cur = pts[2]
            elif verb == 'closePath': cmds.append(['Z'])
        if not cmds: continue
        cmds = [[c[0]] + [round(v / upem, 5) for v in c[1:]] for c in cmds]
        xs = [v for c in cmds for v in c[1::2]]; ys = [v for c in cmds for v in c[2::2]]
        items.append({'x0': min(xs), 'x1': max(xs), 'y0': min(ys), 'y1': max(ys), 'd': cmds})
    out[key] = {'text': text, 'advance': round(x / upem, 5), 'x0': min(i['x0'] for i in items), 'x1': max(i['x1'] for i in items),
                'y0': min(i['y0'] for i in items), 'y1': max(i['y1'] for i in items), 'clusters': items}
    print(f"{key:10s} {text}  clusters={len(items)}  width={out[key]['x1'] - out[key]['x0']:.2f}em")
json.dump(out, open('v2/outlines.json', 'w'), ensure_ascii=False, separators=(',', ':'))
