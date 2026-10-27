# Telugu watercolor lettering

`bride.svg` (వధువు) and `groom.svg` (వరుడు) contain correctly shaped Suranna
outlines and hand-traced brush masks for each akshara, including vowel marks.
Suranna is copyright The Suranna Project Authors, under the SIL Open Font
License included here. Outlines are embedded in both invitation HTML files so
the letters appear without a font download or a second image request.

`js/app.js` advances each `ink-stroke` using its `data-start` and `data-end`
interval on the existing scene timeline. The static SVGs show finished ink;
reduced-motion and JavaScript-free visitors get the complete lettering.
The paper filter is static; only the small brush masks are animated. Captions
have their own layout row/column and never sit over the portrait image.
