import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/campaigns/[id]/draw-auto - Automatic draw
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get all tickets for this campaign
        const tickets = await prisma.ticket.findMany({
            where: { campaignId: id },
        });

        if (tickets.length === 0) {
            return NextResponse.json({ error: 'No tickets sold for this campaign' }, { status: 400 });
        }

        // Select a random ticket
        const randomIndex = Math.floor(Math.random() * tickets.length);
        const winningTicket = tickets[randomIndex];

        // Update campaign with winner number
        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                winnerNumber: winningTicket.number,
                status: 'COMPLETED',
            },
        });

        return NextResponse.json({
            success: true,
            winnerNumber: winningTicket.number,
            campaign,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to draw winner' }, { status: 500 });
    }
}
