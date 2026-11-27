# Change log

Dates are the dates shown on the site.

## 2026-11-28

Corrections after an outside reading of the site against its sources. Each was checked again against the paper before it was changed.

- Laughter: in the cingulum report (Bijanki et al. 2019) the first patient was stimulated on the left and the other two on the right. The record said left for the report as a whole.
- Mood: the 2005 trial (Mayberg et al.) implanted both sides; the record's line on side now says so. The About page now says where the stimulation went in the single case of 2021, as the Mood record already did.
- About, memory (Ezzyat et al. 2018): the gain of about 15% in recall was at the 18 sites in the lateral temporal cortex. At the 11 sites elsewhere stimulation did not help. The page had read as if all the stimulation went to the lateral temporal cortex.
- Resolve (Parvizi et al. 2013): the side is now given, right in both patients, read from the coordinates printed with the paper's Fig. 1. The paper does not state it in words.
- Laughter: a larger series from the group that published the ten patients (Caruana et al. 2018) is added. Read in part.
- Body records list what is specific to the label first. What applies to every label follows, folded on the map and shown in full on the record's own page.
- Body map, motor labels (Roux et al. 2020): 608 sites were stimulated in the precentral gyrus and 1,937 nearby; 248 gave a movement, 245 of them in the precentral gyrus. The entry had set two of these counts against each other as if they disagreed.

## 2026-11-27

- The body map opens the way the experience map does: opening lines and a row of labels to start with, above the tool bar, with the whole plate on the first screen. The figure pages carry the same opening.
- About, Methods, References and the index of records share one layout: a title and a line on what the page holds, then each section in a box of its own, in larger type. About shows the two maps as small pictures side by side. The references are set in two columns on a wide screen and one on a phone, with the authors in bold and the note on how much was read on a line of its own.
- On phones the menu is easier to tap, and the body map's controls take one row less.
- A title plate at the top of the home page: the title, a line naming the book the site accompanies, and a picture of a brain with numbered tickets, with the map directly under it. A link that points at a record starts at the map.
- Headings are set in the medium weight of Libre Baskerville.
- A new picture for links shared to the site. The script that composes it and the picture it starts from are in `build/`.
- On the experience map every region that can be chosen shows from the start, as a light wash of the layer's colour, and the names on the plate read as links.
- Choosing a record no longer makes the page jump: it moves only when the map is out of view, and then rests with the opening lines, the map and the record on screen. The title at the top left of every page leads to the home page. The body map says what to click.
- The title plate shows every time the home page is opened. An address that points at a record starts at the map, and so does "Experience map" in the menu, as "Body map" does. The title at the top left opens the home page with its plate.
- The note under the chart of responses by hemisphere is shorter. Its facts are unchanged.
- The line at the top right of every page gives the date of the last update and nothing else. The footer still says the site is not peer reviewed.
- The three figures of the body map each have a page: Fig. 1 at `/body/`, Fig. 2 at `/body/fig-2/`, Fig. 3 at `/body/fig-3/`. A toggle at the left of the tool bar switches between them and sits in the same place on all three. The old address `/body/figures/` leads to Fig. 2, or to Fig. 3 when it carried that figure's anchor.
- The footer of every page names the book the site accompanies and links to the book's site.
- Every page ends with a link back to its top, in a dark bar above the footer. It leaves the address alone, so a record or a section chosen through the address stays chosen.
- The About page names the author of the book the site accompanies. Labels in the About text and in the records no longer run into the words after them when a page is read as plain text.

## 2026-11-26

First release of the sources.

- Experience map: 16 records in three layers, 31 case reports from Penfield and Perot 1963, 31 later findings, 36 references.
- Body map: 58 records for the labels of the two 1950 figures and the 2023 fMRI scheme, 95 findings, 48 measured coordinates, 55 references.
- A page for every record with a fixed address, an index of records, a sitemap and a plain index for programs.
- The data as JSON and CSV files in `data/`.
