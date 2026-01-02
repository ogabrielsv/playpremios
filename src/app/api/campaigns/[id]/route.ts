import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                tickets: {
                    include: {
                        participant: true,
                    },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json(campaign);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete all tickets first (cascade)
        await prisma.ticket.deleteMany({
            where: { campaignId: id },
        });

        // Delete the campaign
        await prisma.campaign.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, imageUrl, price, drawDate } = body;

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                price: parseFloat(price),
                drawDate: new Date(drawDate),
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}
