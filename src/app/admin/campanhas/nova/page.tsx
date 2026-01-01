'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovaCampanha() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        price: '',
        drawDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/admin');
            } else {
                alert('Erro ao criar campanha');
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
            alert('Erro ao criar campanha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nova Campanha</h1>
                <p className="text-muted-foreground">Crie uma nova campanha de sorteio</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                            Título da Campanha *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ex: GANHE O IPHONE 16 COM CKJ"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Descrição *
                        </label>
                        <textarea
                            id="description"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Click, join, and be part of it. The next person holding an iPhone 16 could be you."
                        />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                            URL da Imagem *
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            required
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="https://exemplo.com/imagem.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium mb-2">
                                Valor do Bilhete (R$) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="drawDate" className="block text-sm font-medium mb-2">
                                Data do Sorteio *
                            </label>
                            <input
                                type="datetime-local"
                                id="drawDate"
                                required
                                value={formData.drawDate}
                                onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Criando...' : 'Criar Campanha'}
                        </button>
                        <Link
                            href="/admin"
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
