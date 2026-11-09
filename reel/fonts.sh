#!/usr/bin/env bash
# Fetch the invitation's Google Fonts (OFL) into reel/fonts/ as local woff2 files.
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
for fam in "Ramabhadra" "Gurajada" "Jost:wght@300;400;500;600"; do
  name=$(echo "$fam" | cut -d: -f1)
  css=$(curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=${fam// /+}&display=block")
  # keep the last (latin) and Telugu subsets; save each src with its weight + unicode-range
  echo "$css" | python3 -c '
import sys,re,subprocess,hashlib
css=sys.stdin.read(); name=sys.argv[1]; out=[]
for blk in re.findall(r"@font-face\s*{[^}]*}",css):
  url=re.search(r"url\((.*?)\)",blk).group(1); w=re.search(r"font-weight:\s*(\d+)",blk).group(1)
  fn="fonts/%s-%s-%s.woff2"%(name,w,hashlib.md5(url.encode()).hexdigest()[:6])
  subprocess.run(["curl","-sS","-o",fn,url],check=True)
  out.append(blk.replace(url,fn.split("/",1)[1]))
open("fonts/%s.css"%name,"w").write("\n".join(out))
' "$name"
done
cat fonts/Ramabhadra.css fonts/Gurajada.css fonts/Jost.css > fonts/fonts.css
echo "fonts ready: $(ls fonts/*.woff2 | wc -l) files"
