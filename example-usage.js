const fs = require("fs");
const { generateAtsCV } = require("./generateAtsCV");

const cvData = {
  name: "Haider Saad AbdulHassan",
  contactLine: "Baghdad, Al-Karrada  |  07712261601  |  haidersaad1616@gmail.com  |  linkedin.com/in/haider-saad",
  sections: [
    {
      heading: "PROFESSIONAL SUMMARY",
      items: [
        { type: "paragraph", text: "Cybersecurity professional with hands-on experience in penetration testing..." },
      ],
    },
    {
      heading: "EDUCATION",
      items: [
        { type: "paragraph", text: "Artificial Intelligence Engineering Technical College — Cyber Security Technology Engineering, 2023" },
      ],
    },
    {
      heading: "CERTIFICATIONS",
      items: [
        { type: "bullet", text: "Network Mastery for Ethical Hacker - Udemy (May 2024)" },
        { type: "bullet", text: "eJPT v2 - INE (2026)" },
      ],
    },
    {
      heading: "PROJECTS",
      items: [
        { type: "subheader", text: "Cybersecurity Lab & Home Network Penetration Testing" },
        { type: "bullet", text: "Utilized Git and GitHub for version control and collaboration..." },
      ],
    },
  ],
};

(async () => {
  const buffer = await generateAtsCV(cvData);
  fs.writeFileSync("output.docx", buffer);
  console.log("Wrote output.docx");
})();
