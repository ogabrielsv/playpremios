import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/participate - Register participant and create ticket
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaignId, name, email, phone, state } = body;

        // Get IP address
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Check if campaign exists and is active
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign || campaign.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Campaign not found or inactive' }, { status: 404 });
        }

        // Anti-fraud: Check rate limiting for IP
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

        const ipLimiter = await prisma.rateLimiter.findUnique({
            where: {
                identifier_type_campaignId: {
                    identifier: ip,
                    type: 'IP',
                    campaignId,
                },
            },
        });

        if (ipLimiter) {
            // Check if last attempt was within 1 minute
            if (ipLimiter.lastAttempt > oneMinuteAgo) {
                // Check if attempts >= 3
                if (ipLimiter.attempts >= 3) {
                    const secondsLeft = Math.ceil((ipLimiter.lastAttempt.getTime() + 60000 - now.getTime()) / 1000);
                    return NextResponse.json({
                        error: `Muitas tentativas. Aguarde ${secondsLeft} segundos para tentar novamente.`,
                    }, { status: 429 });
                }
                // Increment attempts
                await prisma.rateLimiter.update({
                    where: { id: ipLimiter.id },
                    data: {
                        attempts: ipLimiter.attempts + 1,
                        lastAttempt: now,
                    },
                });
            } else {
                // Reset after 1 minute
                await prisma.rateLimiter.update({
                    where: { id: ipLimiter.id },
                    data: {
                        attempts: 1,
                        lastAttempt: now,
                    },
                });
            }
        } else {
            // Create new rate limiter entry
            await prisma.rateLimiter.create({
                data: {
                    identifier: ip,
                    type: 'IP',
                    campaignId,
                    attempts: 1,
                    lastAttempt: now,
                },
            });
        }

        // Anti-fraud: Check rate limiting for Email
        const emailLimiter = await prisma.rateLimiter.findUnique({
            where: {
                identifier_type_campaignId: {
                    identifier: email,
                    type: 'EMAIL',
                    campaignId,
                },
            },
        });

        if (emailLimiter) {
            if (emailLimiter.lastAttempt > oneMinuteAgo) {
                if (emailLimiter.attempts >= 3) {
                    const secondsLeft = Math.ceil((emailLimiter.lastAttempt.getTime() + 60000 - now.getTime()) / 1000);
                    return NextResponse.json({
                        error: `Este e-mail já foi usado 3 vezes. Aguarde ${secondsLeft} segundos.`,
                    }, { status: 429 });
                }
                await prisma.rateLimiter.update({
                    where: { id: emailLimiter.id },
                    data: {
                        attempts: emailLimiter.attempts + 1,
                        lastAttempt: now,
                    },
                });
            } else {
                await prisma.rateLimiter.update({
                    where: { id: emailLimiter.id },
                    data: {
                        attempts: 1,
                        lastAttempt: now,
                    },
                });
            }
        } else {
            await prisma.rateLimiter.create({
                data: {
                    identifier: email,
                    type: 'EMAIL',
                    campaignId,
                    attempts: 1,
                    lastAttempt: now,
                },
            });
        }

        // Find or create participant
        let participant = await prisma.participant.findUnique({
            where: { email },
        });

        if (!participant) {
            participant = await prisma.participant.create({
                data: {
                    name,
                    email,
                    phone,
                    state,
                },
            });
        }

        // Generate random ticket number (6 digits) with collision check
        let ticketNumber = '';
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 100; // Safety break

        while (!isUnique && attempts < maxAttempts) {
            // Generate random 6-digit number
            ticketNumber = Math.floor(100000 + Math.random() * 900000).toString();

            // Check if this number already exists for this campaign
            const existingTicket = await prisma.ticket.findFirst({
                where: {
                    campaignId,
                    number: ticketNumber,
                },
            });

            if (!existingTicket) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json({ error: 'Não foi possível gerar um bilhete único. Tente novamente.' }, { status: 500 });
        }

        // Create ticket
        const ticket = await prisma.ticket.create({
            data: {
                number: ticketNumber,
                campaignId,
                participantId: participant.id,
                status: 'SOLD',
            },
            include: {
                campaign: true,
                participant: true,
            },
        });

        return NextResponse.json({
            success: true,
            ticket,
            message: 'Participação registrada com sucesso!',
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to register participation' }, { status: 500 });
    }
}
