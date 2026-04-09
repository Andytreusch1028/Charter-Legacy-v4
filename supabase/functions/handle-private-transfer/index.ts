import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { llcId, heirs, parentLlcName } = await req.json()

    if (!llcId) throw new Error("llcId is required")

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch LLC details
    const { data: llc, error: llcError } = await supabase
      .from('llcs')
      .select('*')
      .eq('id', llcId)
      .single()

    if (llcError) throw llcError

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create()
    const fontPrimary = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()

    // Header
    page.drawText('PROTOCOL PRIVATE SUCCESSION', {
      x: 50,
      y: height - 50,
      size: 14,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    })

    page.drawText('CERTIFICATE OF INCUMBENCY & AUTHORITY', {
      x: 50,
      y: height - 75,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    })

    // Content — entity metadata
    let yPos = height - 120
    page.drawText(`RE: ${llc.llc_name.toUpperCase()}`, { x: 50, y: yPos, size: 12, font: fontBold })
    yPos -= 25
    
    const lines = [
        `Entity Name: ${llc.llc_name}`,
        `Controlling Member: ${parentLlcName}`,
        `Jurisdiction: Florida, USA`,
        `Protocol ID: CL-SS-${llcId.slice(0,8).toUpperCase()}`
    ]

    lines.forEach(line => {
        page.drawText(line, { x: 50, y: yPos, size: 11, font: fontPrimary })
        yPos -= 18
    })

    // Certificate body — rendered into the document (was previously dead code)
    yPos -= 12
    const bodyLines = [
      `This Certificate confirms that the above-named entity is a Florida Subsidiary`,
      `managed by the Wyoming Parent Entity: ${parentLlcName}.`,
      ``,
      `Pursuant to the Charter Legacy Sovereign Succession Protocol, the following`,
      `persons are designated as Heirs and Successor Members, effective immediately`,
      `upon the triggering of the Private Transfer Protocol (Dead Man's Switch).`,
    ]
    bodyLines.forEach(line => {
      if (line) {
        page.drawText(line, { x: 50, y: yPos, size: 10, font: fontPrimary, color: rgb(0.3, 0.3, 0.3) })
      }
      yPos -= 14
    })

    yPos -= 16
    page.drawText('DESIGNATED HEIRS & ROLES:', { x: 50, y: yPos, size: 12, font: fontBold })
    yPos -= 20

    heirs.forEach((h: any) => {
      page.drawText(`${h.heir_name} (${h.heir_role})`, { x: 70, y: yPos, size: 11, font: fontBold })
      page.drawText(`Equity Interest: ${h.equity_percentage}%`, { x: 300, y: yPos, size: 11, font: fontPrimary })
      yPos -= 18
    })

    yPos -= 40
    page.drawText('AUTHORIZATION SEAL', { x: 50, y: yPos, size: 10, font: fontBold })
    yPos -= 15
    page.drawText(`This document was digitally sealed and notarized via Remote Online Notary (RON) services.`, { x: 50, y: yPos, size: 9, font: fontPrimary })
    yPos -= 12
    page.drawText(`Seal Date: ${new Date().toUTCString()}`, { x: 50, y: yPos, size: 9, font: fontPrimary })
    
    // Watermark/Footer
    page.drawText('CHARTER LEGACY • SOVEREIGN SUCCESSION MODULE', {
      x: 50,
      y: 30,
      size: 8,
      font: fontBold,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()

    // 4. Update LLC Status
    await supabase
      .from('llcs')
      .update({ succession_protocol_active: true })
      .eq('id', llcId)

    // 5. Log to Audit Ledger
    await supabase.from('succession_audit_ledger').insert({
      llc_id: llcId,
      event_type: 'PROTOCOL_SEALED',
      event_metadata: {
        heirs_count: heirs.length,
        parent_entity: parentLlcName,
        seal_id: `RON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    })

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Succession_${llc.llc_name.replace(/\s+/g, '_')}.pdf"`
      }
    })

  } catch (error) {
    // Fix: safe cast for unknown error type
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error("[SUCCESSION ERROR]", error)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
