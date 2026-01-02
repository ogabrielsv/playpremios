'use client';

import { useEffect, useState } from 'react';
import { Gift, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';


interface Campaign {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    drawDate: string;
    status: string;
}

export default function ParticiparPage({ params }: { params: Promise<{ id: string }> }) {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        state: '',
    });

    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    useEffect(() => {
        if (!resolvedParams) return;

        async function fetchCampaign() {
            try {
                if (!resolvedParams) return;
                const response = await fetch(`/api/campaigns/${resolvedParams.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setCampaign(data);
                }
            } catch (error) {
                console.error('Failed to fetch campaign:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCampaign();
    }, [resolvedParams]);

    useEffect(() => {
        if (!campaign) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const drawDate = new Date(campaign.drawDate).getTime();
            const distance = drawDate - now;

            if (distance < 0) {
                setTimeLeft('Sorteio encerrado');
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaign) return;

        setSubmitting(true);

        try {
            const response = await fetch('/api/participate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    ...formData,
                }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                alert('Erro ao registrar participação');
            }
        } catch (error) {
            console.error('Failed to participate:', error);
            alert('Erro ao registrar participação');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Campanha não encontrada</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card rounded-2xl p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Participação Confirmada!</h2>
                    <p className="text-muted-foreground mb-6">
                        Você está participando do sorteio <strong className="text-primary">{campaign.title}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                        Boa sorte! O sorteio será realizado em {new Date(campaign.drawDate).toLocaleDateString('pt-BR')}
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Participar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card rounded-2xl overflow-hidden shadow-2xl">
                {/* Hero Section */}
                <div className="relative h-48 bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Gift className="w-20 h-20 text-white relative z-10" />
                </div>

                <div className="p-8">
                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center mb-2">{campaign.title}</h1>
                    <p className="text-center text-muted-foreground mb-6">{campaign.description}</p>

                    {/* Countdown */}
                    <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Tempo restante</p>
                        <p className="text-xl font-bold text-primary">{timeLeft}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Digite seu nome completo
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nome completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Digite seu melhor e-mail
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                (11) 99999-9999
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Selecione seu estado
                            </label>
                            <select
                                required
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Selecione...</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option>
                                <option value="BA">Bahia</option>
                                <option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option>
                                <option value="ES">Espírito Santo</option>
                                <option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option>
                                <option value="MT">Mato Grosso</option>
                                <option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="PA">Pará</option>
                                <option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option>
                                <option value="PE">Pernambuco</option>
                                <option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RN">Rio Grande do Norte</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option>
                                <option value="RR">Roraima</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option>
                                <option value="SE">Sergipe</option>
                                <option value="TO">Tocantins</option>
                            </select>
                        </div>

                        {/* Terms */}
                        <div className="space-y-2 text-sm">
                            <label className="flex items-start gap-2">
                                <input type="checkbox" required className="mt-1" />
                                <span className="text-muted-foreground">
                                    Aceito os <a href="#" className="text-primary hover:underline">termos de Uso</a> *
                                </span>
                            </label>
                            <label className="flex items-start gap-2">
                                <input type="checkbox" required className="mt-1" />
                                <span className="text-muted-foreground">
                                    Aceito a <a href="#" className="text-primary hover:underline">Política de Privacidade</a> *
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {submitting ? 'Processando...' : 'Participar do Sorteio!'}
                        </button>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Preencha seus dados com Google
                        </button>
                    </form>

                    {/* Rules */}
                    <div className="mt-6 text-center">
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 mx-auto">
                            <Gift className="w-4 h-4" />
                            Regras Oficiais do Sorteio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
