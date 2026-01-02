import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        const totalCampaigns = await prisma.campaign.count({
            where: { status: 'ACTIVE' },
        });

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const endingSoon = await prisma.campaign.count({
            where: {
                status: 'ACTIVE',
                drawDate: {
                    lte: sevenDaysFromNow,
                    gte: now,
                },
            },
        });

        const totalParticipants = await prisma.participant.count();

        return NextResponse.json({
            totalCampaigns,
            endingSoon,
            totalParticipants,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

}
