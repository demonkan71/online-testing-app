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

    // Fetch Settings
    const settingsList = await prisma.systemSetting.findMany({
      where: { key: { in: ['CERTIFICATE_BG', 'CERTIFICATE_Y_POS', 'CERTIFICATE_FONT_SIZE'] } }
    });
    
    const settings = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    let customBgLoaded = false;

    if (settings.CERTIFICATE_BG) {
      try {
        const dataUrl = settings.CERTIFICATE_BG;
        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.split(';')[0].split(':')[1];
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        let bgImage;
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
          bgImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          bgImage = await pdfDoc.embedPng(imageBytes);
        }
        
        page.drawImage(bgImage, {
          x: 0, 
          y: 0, 
          width: width, 
          height: height
        });
        customBgLoaded = true;
      } catch (err) {
        console.error('Failed to load custom background:', err);
      }
    }

    // Fallback to default
    if (!customBgLoaded) {
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
    }

    // Draw Name
    const name = submission.user.name;
    const fontSize = settings.CERTIFICATE_FONT_SIZE ? parseInt(settings.CERTIFICATE_FONT_SIZE) : 40;
    const nameWidth = customFont.widthOfTextAtSize(name, fontSize);
    const yPos = settings.CERTIFICATE_Y_POS ? parseInt(settings.CERTIFICATE_Y_POS) : (height - 236);
    
    page.drawText(name, {
      x: (width - nameWidth) / 2, 
      y: yPos, 
      size: fontSize, 
      font: customFont, 
      color: rgb(107/255, 112/255, 63/255)
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as any, {
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
