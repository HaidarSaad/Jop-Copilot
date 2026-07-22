/**
 * generateAtsCV.js
 * -----------------
 * Reusable library for turning structured CV data into an ATS-friendly
 * .docx file: single column, one font, no tables/images/columns,
 * clear section headings, simple "-" bullet lists.
 *
 * Dependency:
 *   npm install docx
 *
 * Usage:
 *   const { generateAtsCV } = require("./generateAtsCV");
 *   const buffer = await generateAtsCV(cvData);
 *   fs.writeFileSync("output.docx", buffer);
 *
 * See example-usage.js for a full example of the `cvData` shape.
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, LevelFormat,
} = require("docx");

const DEFAULT_FONT = "Calibri";

function buildStyledHelpers(font) {
  const heading = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "444444", space: 2 } },
    children: [new TextRun({ text, bold: true, size: 24, font, color: "1F1F1F" })],
  });

  const bullet = (text) => new Paragraph({
    numbering: { reference: "cv-bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 21, font })],
  });

  const subHeader = (text) => new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [new TextRun({ text, bold: true, size: 22, font })],
  });

  const para = (text, opts = {}) => new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 21, font, ...opts })],
  });

  return { heading, bullet, subHeader, para };
}

/**
 * @typedef {Object} CvSection
 * @property {string} heading           - Section title, e.g. "CERTIFICATIONS"
 * @property {Array<SectionItem>} items  - Ordered content blocks for this section
 *
 * @typedef {Object} SectionItem
 * @property {"paragraph"|"subheader"|"bullet"} type
 * @property {string} text
 * @property {boolean} [italics]
 *
 * @typedef {Object} CvData
 * @property {string} name
 * @property {string} contactLine        - e.g. "Baghdad | phone | email | linkedin"
 * @property {CvSection[]} sections
 */

/**
 * Build a .docx buffer from structured CV data.
 * @param {CvData} cvData
 * @param {Object} [options]
 * @param {string} [options.font="Calibri"]
 * @returns {Promise<Buffer>}
 */
async function generateAtsCV(cvData, options = {}) {
  const font = options.font || DEFAULT_FONT;
  const { heading, bullet, subHeader, para } = buildStyledHelpers(font);

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: cvData.name, bold: true, size: 32, font })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: cvData.contactLine, size: 20, font })],
    }),
  ];

  for (const section of cvData.sections) {
    children.push(heading(section.heading));
    for (const item of section.items) {
      if (item.type === "bullet") children.push(bullet(item.text));
      else if (item.type === "subheader") children.push(subHeader(item.text));
      else children.push(para(item.text, item.italics ? { italics: true, size: 20 } : {}));
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "cv-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "-",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // US Letter
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateAtsCV };
