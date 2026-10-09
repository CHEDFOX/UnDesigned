# Creative brief: Every language has an um.

> **Rendered by the guide.** `npm run design -- tailzu every-um --png`. This campaign uses Bauhaus with its own palette and pairing (`campaign.json`); Tailzu's everyday style stays Humanist Minimal.

- **Core (identity.json):** people think in speech but are made to perform in type; Tailzu keeps your words and drops only the noise. It is for everyone: India's 22 languages, Hinglish, English and dozens more.
- **Pillar:** Said → Written, told for the whole world.
- **One message (W1):** whatever language you speak, Tailzu keeps your words and takes out the ums.
- **Big idea (O2):** every language has its own "um". A wall of the world's fillers, each struck out by a bar, ends in one full stop. The fillers are Tailzu's own: each is the one the site shows it dropping in that language (tailzu-web/index.html said → written examples): um so like, えっと, eh o sea, يعني, euh ben, 음, ähm also, 那个, é tipo assim, ну короче, cioè tipo, คือว่า, yaani, ε λοιπόν, eh gimana ya, אה, no więc, ờ thì, ano eto, उम. Nothing is machine-translated.
- **Why Bauhaus:** a universal product needs a universal grammar. Bauhaus and the New Typography became the International Typographic Style: type as structure (BH7), bars that build the page (BH6), one focal form (BH2, BH4). Its motion (slide on an axis, wipe a bar, stamp a form) is exactly the product's act: strike the filler, end the sentence.
- **Colour:** Wada 313 light (Bauhaus-recommended): Yellow ground, Black type and bars at 15.93:1, Carmine on the one focal form, the full stop. Echoes Tailzu's own amber and rose.
- **Type:** pairing `schibsted` (core for Bauhaus), weight 800 for the wall, three sizes. **Exception, for approval:** the guide's pairings have no Japanese, Korean, Chinese, Arabic, Hebrew, Thai, Greek, Cyrillic, Vietnamese or Devanagari, so those fillers use the matching Noto Sans at the same weight (Google Fonts, loaded only for these characters). The scripts should be checked by fluent readers before print.
- **Layout:** poster-single-focal. The wall flows left-aligned on the grid in two alternating sizes; the circle bleeds off the right edge (BH4); a medium bar sits over the headline; subhead and the black CTA block below. More than 40% of the sheet stays ground.
- **Motion (motion.json: mechanical, critically damped):** over a 12 s cycle, one mover at a time: a bar wipes through each filler in reading order (left to right, right to left for Arabic and Hebrew), 0.27 s apart; then the full stop stamps in; then about 5 s still. No flashes. Reduced motion, and the PNG, show the end frame.
- **Copy:** headline "Every language has an um." Subhead names only languages on the site; "dozens more" is the site's own wording. CTA "Download Tailzu free at tailzu.space". No logo on this piece (the user removed it from the last poster); the name is in the subhead and the CTA.
- **Copy check:** 0 errors, 0 warnings.
- **Files:** `campaign.json`, `poster.copy.json`; art `products/tailzu/art.mjs` → `um-wall`; output `designs/poster-every-um.svg` (animated) and `.png`.
