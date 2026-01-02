'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Clock, Users, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Stats {
    totalCampaigns: number;
    endingSoon: number;
    totalParticipants: number;
}

interface Campaign {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    drawDate: string;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, campaignsRes] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/campaigns'),
                ]);

                const statsData = await statsRes.ok ? await statsRes.json() : null;
                const campaignsData = await campaignsRes.ok ? await campaignsRes.json() : [];

                if (statsData) setStats(statsData);
                if (Array.isArray(campaignsData)) setCampaigns(campaignsData);

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
                <p className="text-muted-foreground">Visão geral das campanhas</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats?.totalCampaigns || 0}</h3>
                    <p className="text-sm text-muted-foreground">Campanhas ativas</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats?.endingSoon || 0}</h3>
                    <p className="text-sm text-muted-foreground">Vencem hoje</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats?.totalParticipants || 0}</h3>
                    <p className="text-sm text-muted-foreground">Aguardando número</p>
                    <p className="text-xs text-muted-foreground mt-1">Campanhas encerradas sem número de sorteio definido</p>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Campanhas que Vencem nos Próximos 7 dias</h2>
                    <Link
                        href="/admin/campanhas/nova"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Nova Campanha
                    </Link>
                </div>

                {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">Nenhuma campanha ativa</p>
                        <Link
                            href="/admin/campanhas/nova"
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Criar primeira campanha
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {campaign.imageUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                                        </>
                                    ) : (
                                        <Trophy className="w-8 h-8 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 text-primary">{campaign.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Vence em</p>
                                    <p className="text-sm font-medium text-green-500">{formatDateTime(campaign.drawDate)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Valor</p>
                                    <p className="text-sm font-bold">{formatCurrency(campaign.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">21:00h</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
