import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, StandardFonts, rgb } from 'https://cdn.skypack.dev/pdf-lib@1.17.1?dts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Generate PDF Function Initialized")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { llcName, docType, memberName, date } = await req.json()

    // 1. Create a new PDFDocument
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    // 2. Add a page
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const fontSize = 12

    // 3. Draw text based on Doc Type
    if (docType === 'oa') {
        page.drawText(`OPERATING AGREEMENT`, {
            x: 50,
            y: height - 50,
            size: 24,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })
        page.drawText(`OF`, {
            x: 50,
            y: height - 80,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })
        page.drawText(`${llcName.toUpperCase()}`, {
            x: 50,
            y: height - 110,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })
        
        const effectiveDate = date || new Date().toLocaleDateString();
        page.drawText(`Effective Date: ${effectiveDate}`, {
            x: 50,
            y: height - 150,
            size: 12,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })

        // Simple Content Body
        const bodyText = `
        This Operating Agreement (the "Agreement") contains the entire
        understanding of the Members regarding the Company.
        
        ARTICLE I: FORMATION
        The Members hereby form a Limited Liability Company ("Company")
        subject to the laws of the State of Florida.
        
        ARTICLE II: NAME
        The name of the Company shall be: ${llcName}
        
        ARTICLE III: MANAGEMENT
        The Company shall be managed by: ${memberName || "The Members"}
        
        IN WITNESS WHEREOF, the undersigned have executed this Agreement.
        `
        
        page.drawText(bodyText, {
            x: 50,
            y: height - 200,
            size: 12,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
            lineHeight: 18,
        })
    } 
    else if (docType === 'banking') {
        page.drawText(`BANKING RESOLUTION`, {
            x: 50,
            y: height - 50,
            size: 24,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })
        page.drawText(`AUTHORIZATION TO OPEN ACCOUNTS`, {
            x: 50,
            y: height - 80,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })

        const resolutionText = `
        IT IS HEREBY RESOLVED by the Members of ${llcName} (the "Company"):

        1. DESIGNATED BANK. The Company is authorized to open bank accounts
           with any federally insured financial institution.

        2. AUTHORIZED SIGNERS. The following person(s) are authorized to sign
           checks, drafts, and withdrawal orders:
           
           Name: ${memberName || "______________________"}
           Title: Authorized Member / Manager

        3. EFFECTIVE DATE. This resolution is effective immediately.
        `

        page.drawText(resolutionText, {
            x: 50,
            y: height - 150,
            size: 12,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
            lineHeight: 18,
        })
    }

    // 4. Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save()

    // 5. Return the PDF
    return new Response(
      pdfBytes,
      { 
        headers: { 
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${llcName.replace(/\s+/g, '_')}_${docType}.pdf"`
        } 
      }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
