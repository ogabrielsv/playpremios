import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/campaigns/[id]/draw-manual - Manual draw
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { winnerNumber } = body;

        if (!winnerNumber) {
            return NextResponse.json({ error: 'Winner number is required' }, { status: 400 });
        }

        // Verify that the ticket exists
        const ticket = await prisma.ticket.findFirst({
            where: {
                campaignId: id,
                number: winnerNumber,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket number not found' }, { status: 404 });
        }

        // Update campaign with winner number
        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                winnerNumber,
                status: 'COMPLETED',
            },
        });

        return NextResponse.json({
            success: true,
            winnerNumber,
            campaign,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to set winner' }, { status: 500 });
    }
}
