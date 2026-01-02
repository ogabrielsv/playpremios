'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Link as LinkIcon, Edit, Trash2, Trophy, Sparkles } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Campaign {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    drawDate: string;
    winnerNumber: string | null;
    status: string;
    createdAt: string;
    _count?: {
        tickets: number;
    };
}

export default function CampanhasPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [drawingCampaign, setDrawingCampaign] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    async function fetchCampaigns() {
        try {
            const response = await fetch('/api/campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;

        try {
            const response = await fetch(`/api/campaigns/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCampaigns(campaigns.filter((c) => c.id !== id));
            } else {
                alert('Erro ao excluir campanha');
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            alert('Erro ao excluir campanha');
        }
    }

    async function handleCopyUrl(id: string) {
        const url = `${window.location.origin}/participar/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            alert('URL copiada para a área de transferência!');
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    }

    async function handleAutoDraw(id: string) {
        setDrawingCampaign(id);
        try {
            const response = await fetch(`/api/campaigns/${id}/draw-auto`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Sorteio realizado! Número vencedor: ${data.winnerNumber}`);
                fetchCampaigns();
            } else {
                alert(data.error || 'Erro ao realizar sorteio');
            }
        } catch (error) {
            console.error('Failed to draw:', error);
            alert('Erro ao realizar sorteio');
        } finally {
            setDrawingCampaign(null);
        }
    }

    async function handleManualDraw(id: string) {
        const winnerNumber = prompt('Digite o número vencedor:');
        if (!winnerNumber) return;

        setDrawingCampaign(id);
        try {
            const response = await fetch(`/api/campaigns/${id}/draw-manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ winnerNumber }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Número vencedor definido: ${data.winnerNumber}`);
                fetchCampaigns();
            } else {
                alert(data.error || 'Erro ao definir vencedor');
            }
        } catch (error) {
            console.error('Failed to set winner:', error);
            alert('Erro ao definir vencedor');
        } finally {
            setDrawingCampaign(null);
        }
    }

    const filteredCampaigns = campaigns.filter((campaign) =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Campanhas</h1>
                    <p className="text-muted-foreground">Gerencie e visualize suas campanhas</p>
                </div>
                <Link
                    href="/admin/campanhas/nova"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nova Campanha
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar campanha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {filteredCampaigns.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">Nenhuma campanha encontrada</p>
                        <Link
                            href="/admin/campanhas/nova"
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Criar primeira campanha
                        </Link>
                    </div>
                ) : (
                    filteredCampaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {campaign.imageUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                                        </>
                                    ) : (
                                        <Trophy className="w-10 h-10 text-primary" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-xl text-primary mb-1">{campaign.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {campaign.status === 'ACTIVE' && (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                                                    Ativo
                                                </span>
                                            )}
                                            {campaign.status === 'COMPLETED' && (
                                                <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                                                    Encerrado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                                            <p className="text-sm font-medium">Admin</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Expira em</p>
                                            <p className="text-sm font-medium">{formatDateTime(campaign.drawDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Valor</p>
                                            <p className="text-sm font-medium">{formatCurrency(campaign.price)}</p>
                                        </div>
                                    </div>

                                    {/* Winner Number */}
                                    {campaign.winnerNumber && (
                                        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                            <p className="text-sm text-muted-foreground mb-1">Número Vencedor</p>
                                            <p className="text-2xl font-bold text-primary">{campaign.winnerNumber}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleCopyUrl(campaign.id)}
                                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium flex items-center gap-2 text-sm"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                            Copiar URL
                                        </button>
                                        <Link
                                            href={`/admin/campanhas/${campaign.id}/editar`}
                                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium flex items-center gap-2 text-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(campaign.id)}
                                            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-medium flex items-center gap-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>

                                        {/* Draw Buttons - Always show when no winner */}
                                        {!campaign.winnerNumber && (
                                            <>
                                                <button
                                                    onClick={() => handleAutoDraw(campaign.id)}
                                                    disabled={drawingCampaign === campaign.id}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    {drawingCampaign === campaign.id ? 'Sorteando...' : 'Sortear Automaticamente'}
                                                </button>
                                                <button
                                                    onClick={() => handleManualDraw(campaign.id)}
                                                    disabled={drawingCampaign === campaign.id}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trophy className="w-4 h-4" />
                                                    Definir número manualmente
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
