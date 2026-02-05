import PDFLib, { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function listFields() {
    const pdfBytes = fs.readFileSync('app/cr2e062.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const pages = pdfDoc.getPages();
    const page2 = pages[1];
    
    let output = '--- PAGE 2 ANNOTATIONS (WIDGETS) ---\n';
    const annots = page2.node.Annots();
    if (annots) {
        const annotsArray = pdfDoc.context.lookup(annots);
        annotsArray.asArray().forEach((annotRef, i) => {
            const annot = pdfDoc.context.lookup(annotRef);
            const rect = annot.get(PDFLib.PDFName.of('Rect'));
            const t = annot.get(PDFLib.PDFName.of('T'));
            const name = t ? t.decodeText() : 'NO_NAME';
            output += `WIDGET [${i}]: NM="${name}" RECT=${JSON.stringify(rect.asArray())}\n`;
        });
    }
    fs.writeFileSync('widget_list.txt', output);
    console.log('Saved widget_list.txt');
}

listFields().catch(console.error);
