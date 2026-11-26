# Data files

Everything on the two maps as plain files. They are written by `build/export-data.js` from the sources in `src/`. Do not edit them by hand: change the sources and run the build.

Licence: Creative Commons Attribution 4.0. Credit “Dargentic Intelligence, Penfield’s Map, https://penfieldsmap.com”.

The site is not peer reviewed. Check a finding against its source before citing it.

## experience.json

| Field | Meaning |
|---|---|
| `layers` | The three layers of the experience map: memory-like experiences, the present altered, later work on feeling |
| `records[]` | One entry for each of the 16 records |
| `records[].address` | The permanent address of the record’s page |
| `records[].term_in_1963_paper` | The term Penfield and Perot use for this kind of response. Empty for the later-work records |
| `records[].count`, `.site`, `.side` | How often it was reported, where on the brain, and on which side, each as a sentence that says what the source says |
| `records[].plate_zones` | The regions shaded on the plate for this record. A drawing aid, not a measurement |
| `records[].cases[]` | Case reports from Penfield and Perot 1963: `case` is the case number in that paper, `pages` its pages, `report` a paraphrase of the case report. `opens_the_record` marks the case shown first on the site |
| `later_findings[]` | Later evidence: the records it belongs to, a method code, the finding in one or two sentences, and reference keys |
| `method_codes` | What each method code means |
| `responses_by_hemisphere` | Counts of memory-like responses by hemisphere, from Table V of the 1963 paper: stimulation points and patients |
| `the_1963_series` | The size of the 1963 series |
| `methods_and_known_gaps` | The notes on method from the Methods page, including what was not read |

## body.json

| Field | Meaning |
|---|---|
| `labels[]` | One entry for each of the 58 records: 29 labels of the sensory figure of 1950, 22 of the motor figure, its three function words as one record, and the six regions of the 2023 fMRI scheme |
| `labels[].position_in_figure` | Order along the gyrus, counted from the midline outward |
| `labels[].reading_grade` | How the lettering was read, A or B. See `reading_grades` |
| `labels[].block_line_mm` | Length of the label’s block line on the printed figure, as measured by Wright in 1956. Empty where the figure draws no line |
| `labels[].coordinate_ids` | The entries of `coordinates[]` shown in this record |
| `findings[]` | 95 findings: section, method code, the labels the finding applies to, the finding, and reference keys |
| `coordinates[]` | 48 measured positions in MNI space, in millimetres. `x_mm` is an absolute value. `sd_*` is the standard deviation where the source gives one. `n` is the number of sites or subjects as the source counts them |
| `differences_between_the_two_1950_figures` | Where the sensory figure (A) and the motor figure (B) differ |
| `topics` | Subjects treated at length, and the record that holds each |

## references.json

Every source cited, by map. `key` is the key used in the findings. `how_read` says how much of the source was read: in full, as an abstract only, or not reached and cited as another source reports it.

## The CSV files

`cases.csv`, `findings.csv`, `coordinates.csv` and `references.csv` hold the same content as tables, in UTF-8. Where a cell lists several records or references they are separated by semicolons.
