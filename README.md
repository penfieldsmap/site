# Penfield’s Map

An open reference to what electrical stimulation of the brain made patients hear, see, remember and feel.

Live at **https://penfieldsmap.com**

Wilder Penfield operated on patients who were awake, stimulated the exposed brain with an electrode and recorded what they reported. This site sets out those reports record by record, with case and page references, what later work found, and the sources.

- **Experience map**: 16 records. Voices, music, scenes, memories and fear from stimulation of the temporal lobe, as Penfield and Perot summarised them in 1963, with later work on feeling from other parts of the brain.
- **Body map**: 58 records. Every label on the sensory and motor figures of Penfield and Rasmussen 1950, with later stimulation, imaging and clinical evidence, and measured coordinates.

Every record has a page of its own with a fixed address, for example `https://penfieldsmap.com/experience/voices/`. The pages can be read without scripts. The full list is at https://penfieldsmap.com/records/.

The site is not peer reviewed. Check a finding against its source before citing it. What was checked, and what is still missing, is on the [Methods page](https://penfieldsmap.com/methods/).

## Use the data

The folder [`data/`](data/) holds everything on the two maps as plain files:

| File | What it holds |
|---|---|
| `experience.json` | The 16 experience records, their 31 case reports, 31 later findings, method codes and the 1963 series figures |
| `body.json` | The 58 body map labels, 95 findings, 48 measured coordinates (MNI) and the differences between the two 1950 figures |
| `references.json` | All 91 references, each with a note on how much of the source was read |
| `cases.csv`, `findings.csv`, `coordinates.csv`, `references.csv` | The same content as tables |

Field by field descriptions are in [`data/README.md`](data/README.md).

## Report an error or suggest a finding

- [Report an error](../../issues/new?template=report-an-error.yml)
- [Suggest a finding](../../issues/new?template=suggest-a-finding.yml)
- Or write to suggestions@penfieldsmap.com

Every correction and every new finding needs a source. The rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

## What is in this repository

| Folder | What it holds |
|---|---|
| `src/` | The sources. `experience-data.js` holds the experience records, case reports, later findings and references. `body.html` holds the body map: its labels, findings, coordinates and references sit in one data block near the top of its script. `experience.html`, `experience-text.js` and `experience-app.js` are the page, the About and Methods text, and the drawing code of the experience map. `static/` holds the fonts, the icon and the share image. |
| `build/` | The build. `build.py` writes the map pages, a page for every record, the index, the sitemap and the data files. `share-image.js` sets the title beside the picture in `share-brain.png` and writes the image shown when a link to the site is shared; it is run by hand and is not part of the build. |
| `checks/` | `check-site.js` tests the built site. |
| `data/` | The data files. Generated: edit the sources, not these. |
| `public/` | The built site, exactly as served at penfieldsmap.com. Generated. |

## Build it

You need Python 3.9 or later and Node 18 or later.

```
cd build
npm install
npx playwright install chromium
cd ..
python3 build/build.py
node checks/check-site.js
```

`build.py` writes `public/` (what the web host serves) and `preview/` (the same pages with relative links, which open straight from disk). It renders the maps in a headless browser to write the record pages, so it needs the Chromium that Playwright installs. To use another Chrome or Chromium, set `CHROME` to its path. In a container that runs as root, set `NO_SANDBOX=1`.

The check script loads every page on a wide and a narrow screen, compares each record page with the same record on the map, follows every internal link and reads the record pages with scripts turned off.

The addresses of the record pages are permanent. They are printed elsewhere. Never change a value in the `SLUG` table of `src/experience-data.js` or in `recPath` and `GSLUG` in `src/body.html`.

## Cite

Dargentic Intelligence. *Penfield’s Map*. 2026. https://penfieldsmap.com

Each record page carries its own citation line. Machine-readable details are in [`CITATION.cff`](CITATION.cff).

## Licence

- Code: [MIT](LICENSE).
- Text, data and drawings: [Creative Commons Attribution 4.0](LICENSE-CONTENT). Credit “Dargentic Intelligence, Penfield’s Map, https://penfieldsmap.com”.
- Fonts: Libre Baskerville, [SIL Open Font License 1.1](src/static/fonts/LICENSE.txt).

Case reports on the site are paraphrases of the published case reports and carry their case and page numbers. The plates are original schematics and are not to scale. No figure from Penfield’s publications is reproduced.

## About

Published and maintained by [Dargentic Intelligence](https://www.dargentic.com). The site is a research companion to *NEURAL*, a book on brain-computer interfaces forthcoming from Fast Company Press in 2027.

© 2026 Dargentic Pty Ltd
