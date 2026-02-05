
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function mapFields() {
    const pdfBytes = fs.readFileSync('app/cr2e062.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach((field, index) => {
        try {
            if (field.constructor.name === 'PDFTextField') {
                field.setText(`[${index}]`);
            } else if (field.constructor.name === 'PDFCheckBox') {
                // Not checking checkboxes as we just want text labels
            }
        } catch (e) {}
    });

    const pdfOutputBytes = await pdfDoc.save();
    fs.writeFileSync('field_map.pdf', pdfOutputBytes);
    console.log('Saved field_map.pdf');
}

mapFields().catch(console.error);
