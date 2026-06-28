import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    // Delete all users. Prisma cascade delete will remove associated submissions and certificates.
    await prisma.user.deleteMany({});
    
    return NextResponse.json({ success: true, message: 'All user data cleared.' });
  } catch (error) {
    console.error('Clear all users error:', error);
    return NextResponse.json({ error: 'Failed to clear user data' }, { status: 500 });
  }
}
