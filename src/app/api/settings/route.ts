import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Convert array to object key-value pairs
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = body.settings; // expects { [key: string]: string }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Upsert all settings
    const promises = Object.entries(settings).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
