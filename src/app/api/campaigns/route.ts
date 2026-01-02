import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns - List all active campaigns
export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'ACTIVE',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, imageUrl, price, drawDate } = body;

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                imageUrl,
                price: parseFloat(price),
                drawDate: new Date(drawDate),
                status: 'ACTIVE',
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
