import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const generateDocumentPDF = async (docType, companyName) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Watermark removed per user request (Live Form)

        
        let filename = `${companyName.replace(/\s+/g, '_')}_Document.pdf`;

        if (docType === 'oa') {
            filename = `${companyName.replace(/\s+/g, '_')}_Operating_Agreement.pdf`;
            page.drawText(`OPERATING AGREEMENT TEMPLATE`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
            page.drawText(`OF`, { x: 50, y: height - 80, size: 14, font: timesRomanFont });
            page.drawText(companyName.toUpperCase(), { x: 50, y: height - 110, size: 18, font: timesRomanFont });
            
            const bodyText = `
            This Operating Agreement (the "Agreement") contains the entire
            understanding of the Members regarding the Company.
            
            ARTICLE I: FORMATION
            The Members hereby form a Limited Liability Company ("Company")
            subject to the laws of the State of Florida.
            
            ARTICLE II: NAME
            The name of the Company shall be: ${companyName}
            
            ARTICLE III: MANAGEMENT
            The Company shall be managed by its Members.
            
            IN WITNESS WHEREOF, the undersigned have executed this Agreement.
            `;
            
            page.drawText(bodyText, { x: 50, y: height - 200, size: 12, font: timesRomanFont, lineHeight: 18 });
        } else if (docType === 'banking') {
            filename = `${companyName.replace(/\s+/g, '_')}_Banking_Resolution.pdf`;
            page.drawText(`BANKING RESOLUTION FORM`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
            page.drawText(`AUTHORIZATION TO OPEN ACCOUNTS`, { x: 50, y: height - 80, size: 14, font: timesRomanFont });

            const bodyText = `
            IT IS HEREBY RESOLVED by the Members of ${companyName}:

            1. DESIGNATED BANK. The Company is authorized to open bank accounts.

            2. AUTHORIZED SIGNERS. The Members are authorized to sign checks.
            
            3. EFFECTIVE DATE. This resolution is effective immediately.
            `;
            
            page.drawText(bodyText, { x: 50, y: height - 150, size: 12, font: timesRomanFont, lineHeight: 18 });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        return { success: true, filename };

    } catch (err) {
        console.error("PDF Gen Error:", err);
        throw err;
    }
};
