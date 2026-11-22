# Bar Al Hikman Dream Camp

Website for **Dream Camp**, a beach camp of A-frame bungalows on the white sands of Bar Al Hikman, Oman.
Guests book directly on WhatsApp (+968 9113 2705).

**Live site:** https://chido0o.github.io/bar-al-hikman-dream-camp/

It's a static site with no build step: plain HTML, CSS and JavaScript.

## What's on the page

- **Hero**: morning photo of the camp with a slow zoom, a rising sun glow and birds flying over. "Book on WhatsApp" is the first button.
- **A day at Dream Camp**: a scroll scene that moves from sunrise to daytime, sunset and starlight. The sky colour, the sun, the moon and the stars change as you scroll.
- **Bungalows**: a swipeable photo carousel and the bungalow features.
- **Prices + stay planner**: adult and child prices, what's included, and a calculator. It adds up nights, guests and an optional trip, then opens WhatsApp with the booking request already written.
- **Activities, Gallery** (with a full-screen photo viewer), **Location**, **FAQ**, and a final booking section.
- A floating WhatsApp button on desktop and a sticky "Book on WhatsApp" bar on phones.

## Editing

| What | Where |
| --- | --- |
| WhatsApp number, prices, pre-filled messages | top of `assets/js/main.js` (`WA_NUMBER`, `PRICES`, `MESSAGES`) |
| Prices shown in the text | `index.html` (search for `OMR`) |
| Colours and fonts | `:root` at the top of `assets/css/styles.css` |
| Photos | `assets/img/` (WebP, several sizes each) |

If you change the phone number, update it in `main.js` **and** in the visible text and `tel:` link in `index.html`.

## Preview locally

From this folder, start any static server, for example:

```bash
npx serve .
```

Then open the address it prints.

## Publish

The site is published with GitHub Pages from the `main` branch (root folder).
Every push to `main` updates the live site within a minute or two.
It also works on any other static host (Netlify, Vercel, Cloudflare Pages).
