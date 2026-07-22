import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  LevelFormat,
} from "docx";

const DEFAULT_FONT = "Calibri";

function buildStyledHelpers(font: string) {
  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "444444", space: 2 } },
      children: [new TextRun({ text, bold: true, size: 24, font, color: "1F1F1F" })],
    });

  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: "cv-bullets", level: 0 },
      spacing: { after: 60 },
      children: [new TextRun({ text, size: 21, font })],
    });

  const subHeader = (text: string) =>
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text, bold: true, size: 22, font })],
    });

  const para = (text: string, opts: any = {}) =>
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text, size: 21, font, ...opts })],
    });

  return { heading, bullet, subHeader, para };
}

export type CvSection = {
  heading: string;
  items: { type: "paragraph" | "subheader" | "bullet"; text: string; italics?: boolean }[];
};

export type CvData = {
  name: string;
  contactLine: string;
  sections: CvSection[];
};

export async function generateAtsCV(cvData: CvData, options: { font?: string } = {}) {
  const font = options.font || DEFAULT_FONT;
  const { heading, bullet, subHeader, para } = buildStyledHelpers(font);

  const children: any[] = [
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

  for (const section of cvData.sections || []) {
    children.push(heading(section.heading));
    for (const item of section.items || []) {
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
            size: { width: 12240, height: 15840 },
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export default generateAtsCV;
