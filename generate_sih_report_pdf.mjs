import fs from 'fs';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument({ margin: 45, size: 'A4' });
const stream = fs.createWriteStream('Swasthya_Setu_SIH_Report.pdf');
doc.pipe(stream);

const artifactPath = 'C:/Users/DELL/.gemini/antigravity-ide/brain/1e3c7268-5aab-48b6-a6c5-60699cf3d90e/SIH_Project_Report_Swasthya_Setu.md';
const content = fs.readFileSync(artifactPath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trimEnd();

  if (line.startsWith('# ')) {
    doc.moveDown(0.4);
    doc.fontSize(20).fillColor('#0f172a').font('Helvetica-Bold').text(line.replace(/^# /, ''), { underline: false });
    doc.moveDown(0.2);
  } else if (line.startsWith('## ')) {
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#1e40af').font('Helvetica-Bold').text(line.replace(/^## /, ''));
    doc.moveDown(0.15);
  } else if (line.startsWith('### ')) {
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#2563eb').font('Helvetica-Bold').text(line.replace(/^### /, ''));
    doc.moveDown(0.1);
  } else if (line.startsWith('```')) {
    let codeLines = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('```')) {
      codeLines.push(lines[i]);
      i++;
    }
    doc.moveDown(0.2);
    doc.fontSize(7).font('Courier').fillColor('#334155').text(codeLines.join('\n'), { width: 505 });
    doc.moveDown(0.2);
  } else if (line.startsWith('| ')) {
    const cleanLine = line.replace(/\*\*/g, '').replace(/`/g, '');
    doc.fontSize(8).font('Helvetica').fillColor('#1e293b').text(cleanLine, { width: 505 });
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    const cleanText = line.substring(2).replace(/\*\*/g, '').replace(/`/g, '');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(`• ${cleanText}`, { indent: 12, width: 490 });
  } else if (line.match(/^\d+\. /)) {
    const cleanText = line.replace(/\*\*/g, '').replace(/`/g, '');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(cleanText, { indent: 12, width: 490 });
  } else if (line === '---') {
    doc.moveDown(0.3);
    doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.moveDown(0.3);
  } else if (line.trim() === '') {
    doc.moveDown(0.15);
  } else {
    const cleanText = line.replace(/\*\*/g, '').replace(/`/g, '').replace(/\*/g, '');
    doc.fontSize(9.5).font('Helvetica').fillColor('#1e293b').text(cleanText, { width: 505 });
  }
}

doc.end();
stream.on('finish', () => console.log('Successfully generated Swasthya_Setu_SIH_Report.pdf'));
