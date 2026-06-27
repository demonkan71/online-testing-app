import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        exam: true,
      }
    });

    if (!submission || !submission.isPassed) {
      return NextResponse.json({ error: 'Certificate not found or user did not pass' }, { status: 404 });
    }

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    
    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Fetch Thai Font (Kanit-Bold) for the name
    const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/kanit/Kanit-Bold.ttf';
    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    // Add a blank page (Landscape)
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Load and Draw Background Image Template
    const bgPath = path.join(process.cwd(), 'public', 'cert-bg.png');
    if (fs.existsSync(bgPath)) {
      const bgImageBytes = fs.readFileSync(bgPath);
      const bgImage = await pdfDoc.embedPng(bgImageBytes);
      page.drawImage(bgImage, {
        x: 0, 
        y: 0, 
        width: width, 
        height: height
      });
    }

    // Draw Name
    const name = submission.user.name;
    const fontSize = 40;
    const nameWidth = customFont.widthOfTextAtSize(name, fontSize);
    
    // The [NAME] placeholder in the template is roughly at y: height - 236
    page.drawText(name, {
      x: (width - nameWidth) / 2, 
      y: height - 236, 
      size: fontSize, 
      font: customFont, 
      // Use olive green matching the template: RGB(107, 112, 63)
      color: rgb(107/255, 112/255, 63/255)
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificate-${submission.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
