import { jsPDF } from 'jspdf';
import fs from 'fs';

function sanitizeTextForPdf(input) {
  if (!input) return input;
  let s = input.replace(/\u00AD|\u200B|\u200C|\u200D|\uFEFF/g, '');
  const lines = s.split(/\r?\n/);
  const out = [];
  let i = 0;
  let lastWasBlank = false;
  while (i < lines.length) {
    const line = lines[i];
    if (!/\S/.test(line)) {
      if (!lastWasBlank) out.push('');
      lastWasBlank = true;
      i++;
      continue;
    }
    const hyphenMatch = line.match(/^(.*?)-\s*$/);
    if (hyphenMatch && i + 1 < lines.length) {
      const next = lines[i + 1] || '';
      const combined = (hyphenMatch[1] + next.trim()).replace(/[^\p{L}\p{N}]/gu, '');
      if (combined.length > 3 && !hyphenMatch[1].includes('-') && !next.includes('-')) {
        out.push(hyphenMatch[1] + next.trim());
        i += 2;
        lastWasBlank = false;
        continue;
      }
    }
    const shortExceptions = new Set(['a', 'A', 'I']);
    const isShortToken = (str) => {
      const core = str.replace(/[^\p{L}\p{N}]/gu, '');
      return core.length <= 2 && core.length > 0 && !shortExceptions.has(str.trim());
    };
    let runLen = 0;
    for (let j = i; j < lines.length; j++) {
      if (isShortToken(lines[j])) runLen++; else break;
    }
    if (runLen >= 2) {
      let word = '';
      for (let k = 0; k < runLen; k++) {
        word += lines[i + k].replace(/[^\p{L}\p{N}]/gu, '');
      }
      out.push(word);
      i += runLen;
      lastWasBlank = false;
      continue;
    }
    let fixedLine = line.replace(/\r/g, '');
    const tokens = fixedLine.split(/\s+/);
    const merged = [];
    for (let t = 0; t < tokens.length; t++) {
      const cur = tokens[t];
      const next = tokens[t + 1];
      if (next && /\p{L}{2,}/u.test(cur) && /^[\p{L}]$/u.test(next) && (cur + next).length > 3) {
        merged.push(cur + next);
        t++;
        continue;
      }
      merged.push(cur);
    }
    fixedLine = merged.join(' ');
    const parts = fixedLine.split(/\s+/);
    const shortSeq = parts.filter(p => p.replace(/[^\p{L}\p{N}]/gu, '').length <= 2);
    if (shortSeq.length >= Math.floor(parts.length / 2) && parts.length > 1) {
      fixedLine = parts.join('');
    }
    out.push(fixedLine);
    lastWasBlank = false;
    i++;
  }
  return out.join('\n');
}

const rawText = `Haider Saad AbdulHassan
Email: haidersaad1616@gmail.com
Phone: 07712261601
LinkedIn:linkedin.com/in/haider-saad
Baghdad-Al Karrada
Professional Summary
Cybersecurity professional with hands-on experience in penetration testing, developed through intensive self-study
and building complex virtual lab environments, skilled in utilizing various tools and technologies to ensure system
security and efficiency in Windows environments.
Education
- Artificial Intelligence Engineering Technical College - Cyber Security Technology Engineering 2023
Leadership & Community Involvement
- Freelance Tech Community Builder | Next-Gen Tech Leaders (Self-Branded Initiative) Sep 2025 - Present
- Managed 5 strategic partnerships, resulting in a 25% increase in community engagement, which involved
coordinating with various organizations to promote technical training and development, utilizing problem-solving
and communication skills .
- Strategic Partnerships: Collaborating with Titanium Center to promote the "FUTURE WAVE" IT program and
with Hackviser to build a dedicated cybersecurity student community, which required strong teamwork and
project management skills.
- Community Growth & Engagement: Grew a network of students interested in tech careers through online
campaigns, on-campus workshops, and peer-to-peer mentoring, demonstrating the ability to work with diverse
groups and facilitate knowledge sharing.
- Marketing & Outreach: Executed targeted online and offline marketing strategies to drive awareness and
enrollment in technical training courses, leveraging skills in problem-solving and attention to detail.
- Leadership & Event Management: Organized and led informational sessions and webinars, enhancing student
engagement and providing clear pathways into the tech industry, showcasing the ability to coordinate events and
manage projects.
Certifications
- Network Mastery for Ethical Hacker - Udemy (May 2024)
- Operating Systems - Cisco (May 2024)
- eJPTv2-INE (2026)
- Cyber Security Elements Workshop - Titanium (March 2024)
- Information Security Specialist - Let’s Defend (June 2025)
- Microsoft certificate : Security, Compliance, and Identity Fundamentals -(June 2025)
- CCNA Practical Course Certified.
- MCSA Certified
- Cysa+ Certified
- Achieved Docker Certification- KodeCloud (2026)
- Earned AWS Cloud Practitioner certification from Manara (2026)

Projects
- Cybersecurity Lab & Home Network Penetration Testing, which involved designing and deploying a virtual lab
environment to simulate real-world network scenarios and identify vulnerabilities using various tools, including Nmap, Wireshark, and Metasploit, in Windows environments.
- Utilized Git and GitHub for version control and collaboration, resulting in a 30% increase in project efficiency,
demonstrating the ability to work with version control systems and collaborate with team members.
- Designed and deployed a virtual lab environment using VMware Workstation and PNetLab to simulate
real-world network scenarios, which required knowledge of virtualization and network emulation.
- Installed and configured multiple virtual machines, including Parrot OS , Kali Linux , and vulnerable targets
(e.g., Metasploitable ), to practice penetration testing and vulnerability assessment.
- Conducted penetration tests on a simulated home Wi-Fi network, identifying vulnerabilities using tools like Aircrack-ng , Wireshark , and Nmap , and executed attack simulations to understand intrusion patterns and defense
evasion techniques.
- Developed coding skills with Vibe Coding , enhancing programming proficiency by 25%, which involved learning
and applying programming languages such as C++, Python, and HTML/CSS.
- Built a project with Vibe Coding , which required applying programming skills to real-world problems, utilizing problem-solving and communication skills .
Skills
Technical Skills
- Operating Systems: Linux (Parrot OS, Kali), Windows .
- Tools: Metasploit , Wireshark , Nmap , John the Ripper .
- Programming Languages: C++ With OOP+Python+html+css.
- Networking: TCP/IP, UDP, DNS Zone Transfers, SMB Enum, Passive Recon.
- Security Techniques: Crack Wi-Fi passwords, Identify wireless attacks, apply social engineering techniques, Scan
networks, Identify open ports and running services.
- Advanced Penetration Testing
- Virtualization & Network Emulation: VMware Workstation , VirtualBox , PNetLab , EVE-NG , GNS3 , Hyper
V .
- Mastered Docker , enhancing containerization skills and improving deployment efficiency by 40%.
- Proficient in Git and GitHub , streamlining version control and collaboration processes.
- Skilled in AWS Cloud Practitioner , demonstrating expertise in cloud computing and architecture.

Soft Skills
- Problem Solving
- Attention to Detail
- Teamwork
- Communication Skills
- AI Prompt Engineer
- Search Skills
- Self Learning
- Microsoft Office + Canva Ai
- Strategic Partnership Management

Keywords
- Penetration Testing, Vulnerability Assessment, Cybersecurity, Red Team, Blue Team, OWASP, Kali Linux, Nmap,
Burp Suite, Metasploit, John the Ripper, Bash, Network Security
- Containerization, Cloud Computing, Docker, Git, GitHub, AWS Cloud Practitioner
- Windows environments, Networking (TCP/IP, UDP, DNS), Problem-solving , Communication skills , Teamwork`;

const clean = sanitizeTextForPdf(rawText);
const doc = new jsPDF({ unit: 'mm', format: 'a4' });
const ml = 15;
const mw = 180;
let y = 20;
const lh = 5.5;

const lines = clean.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!/\S/.test(line)) { y += lh; continue; }
  const trimmed = line.trim();
  const headings = ['Professional Summary','Education','Leadership & Community Involvement','Certifications','Projects','Skills','Technical Skills','Soft Skills','Keywords'];
  if (headings.some(h => h.toLowerCase() === trimmed.toLowerCase())) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const wrapped = doc.splitTextToSize(trimmed, mw);
    doc.text(wrapped, ml, y);
    y += wrapped.length * lh;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    continue;
  }
  const wrapped = doc.splitTextToSize(line, mw);
  doc.text(wrapped, ml, y);
  y += wrapped.length * lh;
  if (y > 282) { doc.addPage(); y = 20; }
}

const arrayBuf = doc.output('arraybuffer');
fs.writeFileSync('exported-test.pdf', Buffer.from(arrayBuf));
console.log('exported-test.pdf written');
