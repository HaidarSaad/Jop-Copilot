# ATS CV Generator

Turns structured CV data into an ATS-friendly `.docx` file:
single column, one font (Calibri), no tables/text-boxes/images/columns,
clear bordered section headings, simple `-` bullet lists.

## Install

```bash
npm install docx
```

## Files

- `generateAtsCV.js` — the library. Exports `generateAtsCV(cvData, options)` → returns a `Buffer`.
- `example-usage.js` — minimal example of building a CV and writing it to disk.
- `package.json` — dependency manifest (just `docx`).

## Data shape (`cvData`)

```js
{
  name: "Full Name",
  contactLine: "City | Phone | Email | LinkedIn",
  sections: [
    {
      heading: "SECTION TITLE",       // rendered as a bold, underlined H2
      items: [
        { type: "paragraph", text: "..." },   // plain paragraph
        { type: "subheader",  text: "..." },  // bold sub-heading (e.g. job title)
        { type: "bullet",     text: "..." },  // "-" bullet point
        { type: "paragraph", text: "date range", italics: true }, // optional italics
      ],
    },
    // ...more sections
  ],
}
```

Feed it sections in whatever order you want them to appear
(Professional Summary, Education, Certifications, Projects, Skills, Keywords, etc.)
— the generator doesn't assume a fixed CV structure.

## Generate + verify (recommended pipeline)

An agent editing/generating CVs should not just emit the .docx — it should
render it and visually check the layout before handing it back. That's the
part that most commonly gets skipped and causes messy output:

```bash
# 1. Generate the docx
node example-usage.js

# 2. Convert to PDF (requires LibreOffice / soffice on PATH)
soffice --headless --convert-to pdf output.docx

# 3. Rasterize pages to images for a visual check (requires poppler-utils)
pdftoppm -jpeg -r 100 output.pdf page
# -> page-1.jpg, page-2.jpg, ...
```

Then look at `page-1.jpg` (etc.) to confirm: no overflowing text, no broken
words, headings/bullets rendering correctly, contact line on one line, no
orphaned single lines at page breaks.

## Design rules this generator follows (for ATS-safety)

- Single column layout — never use tables or text boxes for layout.
- One font family throughout (default Calibri; swap via `options.font`).
- No images, icons, or graphics.
- Standard section headings as real paragraph/heading text (not embedded in
  images or SmartArt) so ATS parsers can read them.
- Bullets are plain `-` characters via Word's native numbering, not Unicode
  bullet glyphs pasted into text.
- Dates/locations kept as plain text, not in headers/footers (some ATS
  parsers drop header/footer content).

## Extending

- To change fonts/sizes/margins, edit the constants at the top of
  `generateAtsCV.js` (`DEFAULT_FONT`, `size:` values in `buildStyledHelpers`,
  and the `page.margin` block).
- To support multi-column skills tables or a two-page limit warning, that
  logic can be added as a wrapper around `generateAtsCV()` without touching
  the core rendering.
