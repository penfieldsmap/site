# Contributing

Corrections and new findings are welcome. So are fixes to the code, the drawings and the wording.

The site is a reference. A reader should be able to trace every statement to a page of a published source. That one rule decides what is accepted.

## The accuracy rule

1. **Every statement has a source that says it.** Give the reference and the place in it: page, table, figure or section.
2. **Read the source itself.** Say how much of it you read: the full text, the abstract only, or an account of it in another paper. The note beside each reference on the site records this, and a finding taken from an abstract says so.
3. **Do not go beyond the source.** If the paper gives no side, no count or no site, the record says that it gives none. Do not infer one.
4. **Copy numbers exactly** and say what is counted: stimulation points, responses or patients.
5. **Paraphrase what patients said**, and give the case number and page. Quote sparingly and mark quotations as quotations.
6. **Where sources disagree, record both** and say which says what. Do not pick one silently.
7. **Say what kind of evidence it is.** Each finding carries a method code, listed on the [Methods page](https://penfieldsmap.com/methods/). A single case is described as a single case.
8. **Published sources only.** Journal papers, books and conference papers. A preprint is accepted if it is labelled as one. No press releases, news reports or unpublished claims.

A maintainer checks each claim against its source before it is merged, and may ask you for the passage.

## Report an error

Use the [error form](../../issues/new?template=report-an-error.yml), or write to suggestions@penfieldsmap.com. Say which record, what is wrong, and what the source says, with the page.

## Suggest a finding

Use the [finding form](../../issues/new?template=suggest-a-finding.yml). Give the full reference with a DOI or link, the place in the source, and one or two sentences in plain words on what was found, in how many patients, by what method.

## Change the files yourself

- Experience map records, case reports, later findings and references: `src/experience-data.js`.
- Body map labels, findings, coordinates and references: the data block in `src/body.html`, between the comment `body divisions` and the line that begins `var STRIPNAME`.
- About and Methods text of the experience map: `src/experience-text.js`.

Then build and check, as the [README](README.md#build-it) describes:

```
python3 build/build.py
node checks/check-site.js
```

Commit the sources together with the regenerated `public/` and `data/`. If you cannot run the build, send the change to the sources alone and say so; a maintainer will rebuild.

In the pull request, list each statement you added or changed with its source and page.

### Rules for the files

- The addresses of record pages are permanent. Do not change a value in `SLUG`, `GSLUG` or `recPath`.
- New references follow the form of the existing ones: a short name, the full citation, a link, and a note on how much was read.
- Plain words. Short sentences. Say what happened to the patient before giving the term for it.
- The site names its publisher and no individual contributors. Contributors are credited in the change log if they wish.

## Licence of contributions

By contributing you agree that your contribution is licensed under the licences of this repository: MIT for code, Creative Commons Attribution 4.0 for text, data and drawings.

## Conduct

Be exact, be civil, and argue from the source.
