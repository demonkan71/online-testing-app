import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, phone, hospital, district, occupation, attendanceType } = await req.json();

    if (!name || !phone || !district || !occupation || !attendanceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, phone, hospital, district, occupation, attendanceType },
      });
    } else {
      // Update info if changed
      user = await prisma.user.update({
        where: { phone },
        data: { name, hospital, district, occupation, attendanceType },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
