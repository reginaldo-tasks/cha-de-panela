import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GiftCard } from '@/components/GiftCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Heart, MapPin, MessageCircle, Copy, Check, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Couple {
    id: string;
    couple_name: string;
    list_title: string | null;
    whatsapp: string | null;
    pix_key: string | null;
    wedding_date: string | null;
    biography: string | null;
    image_url: string | null;
}

interface Gift {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    category?: string | null;
    price?: number | string;
    priority?: number;
    status?: 'available' | 'reserved' | 'purchased';
    reserved_by?: string | null;
    url?: string | null;
    is_selected?: boolean;
    donations?: Array<{
        id: string;
        gift: string;
        donor_name: string;
        amount: string | number;
        created_at?: string;
    }>;
    total_donated?: number;
    remaining_amount?: number;
    donation_percentage?: number;
}

interface StoreData {
    couple: Couple;
    gifts: Gift[];
}

export default function StoreDetail() {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const { toast } = useToast();
    const isAdmin = location.pathname.includes('/admin');
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [donorName, setDonorName] = useState('');
    const [donationAmount, setDonationAmount] = useState('');
    const [isDonating, setIsDonating] = useState(false);
    const [copiedPix, setCopiedPix] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            if (!slug) return;

            try {
                setIsLoading(true);
                console.log(`[StoreDetail] Fetching store data for slug: ${slug}`);
                const response = await fetch(`${API_BASE_URL}/store/${encodeURIComponent(slug)}/`);

                if (!response.ok) {
                    throw new Error('Casal não encontrado');
                }

                const data = await response.json();
                console.log(`[StoreDetail] ✓ Store loaded:`, { couple: data.couple_name, giftCount: data.gifts?.length || 0 });
                setStoreData({
                    couple: {
                        id: data.id,
                        couple_name: data.couple_name,
                        list_title: data.list_title,
                        whatsapp: data.whatsapp,
                        pix_key: data.pix_key,
                        wedding_date: data.wedding_date,
                        biography: data.biography,
                        image_url: data.image_url,
                    },
                    gifts: data.gifts || [],
                });
            } catch (error) {
                console.error('[StoreDetail] ✗ Error loading store:', error);
                toast({
                    title: 'Erro',
                    description: error instanceof Error ? error.message : 'Não foi possível carregar a loja',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStore();
    }, [slug, toast]);

    const handleDonateGift = async (giftId: string) => {
        if (!donorName.trim()) {
            toast({
                title: 'Erro',
                description: 'Por favor, digite seu nome',
                variant: 'destructive',
            });
            return;
        }

        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            toast({
                title: 'Erro',
                description: 'Por favor, insira um valor válido',
                variant: 'destructive',
            });
            return;
        }

        setIsDonating(true);
        try {
            console.log(`[StoreDetail] Attempting to donate R$ ${donationAmount} to gift ${giftId} by ${donorName}`);
            const updatedGift = await api.gifts.donate(giftId, donorName, parseFloat(donationAmount));

            console.log(`[StoreDetail] ✓ Donation successful:`, updatedGift);
            toast({
                title: 'Sucesso!',
                description: 'Doação registrada com sucesso!',
            });
            setDonorName('');
            setDonationAmount('');
            setSelectedGift(null);

            // Refresh store data
            if (storeData) {
                const updatedGifts: Gift[] = storeData.gifts.map((gift) =>
                    gift.id === giftId ? updatedGift : gift
                );
                setStoreData({ ...storeData, gifts: updatedGifts });
                console.log(`[StoreDetail] ✓ Updated local state with donation data`);
            }
        } catch (error) {
            console.error('[StoreDetail] ✗ Error donating:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao processar doação',
                variant: 'destructive',
            });
        } finally {
            setIsDonating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Heart className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                        <p className="text-lg font-semibold">Loja não encontrada</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Verifique se o nome do casal está correto
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { couple, gifts } = storeData;
    const availableGifts = gifts.filter((g) => g.status === 'available');
    const purchasedCount = gifts.filter((g) => g.status === 'purchased').length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
            <Header />

            {/* Couple Header */}
            <div className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                        {couple.image_url && (
                            <img
                                src={couple.image_url}
                                alt={couple.couple_name}
                                className="h-32 w-32 rounded-lg object-cover shadow-lg"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                                {couple.couple_name}
                            </h1>
                            {couple.list_title && (
                                <p className="text-lg text-muted-foreground mt-2">{couple.list_title}</p>
                            )}

                            {couple.biography && (
                                <p className="mt-4 text-muted-foreground max-w-2xl">{couple.biography}</p>
                            )}

                            {couple.wedding_date && (
                                <div className="flex items-center gap-2 mt-4 text-sm">
                                    <MapPin className="h-4 w-4" />
                                    <span>{new Date(couple.wedding_date).toLocaleDateString('pt-BR')}</span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 mt-6">
                                {couple.whatsapp && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.open(`https://wa.me/${couple.whatsapp.replace(/\D/g, '')}`)}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">{gifts.length}</p>
                            <p className="text-sm text-muted-foreground">Presentes</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{purchasedCount}</p>
                            <p className="text-sm text-muted-foreground">Comprados</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">{availableGifts.length}</p>
                            <p className="text-sm text-muted-foreground">Disponíveis</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gifts Grid */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {gifts.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">Nenhum presente ainda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gifts.map((gift) => (
                            <GiftCard
                                key={gift.id}
                                gift={gift}
                                onReserve={() => setSelectedGift(gift)}
                                isPublic={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Donation Modal */}
            {selectedGift && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl">Presentear {selectedGift.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Complete os dados para contribuir com este presente
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Gift Name Display */}
                            <div className="p-3 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Presente</p>
                                <p className="font-semibold text-foreground">{selectedGift.name}</p>
                                {selectedGift.price && (
                                    <p className="text-sm text-primary mt-1">
                                        Valor: R$ {parseFloat(selectedGift.price as string).toFixed(2).replace('.', ',')}
                                    </p>
                                )}
                            </div>

                            {/* Donation Progress */}
                            {selectedGift.donation_percentage !== undefined && (
                                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-foreground">Progresso da Doação</p>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {Math.round(selectedGift.donation_percentage)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(selectedGift.donation_percentage, 100)}%` }}
                                        />
                                    </div>
                                    {selectedGift.remaining_amount !== undefined && selectedGift.remaining_amount > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            R$ {selectedGift.remaining_amount.toFixed(2).replace('.', ',')} ainda faltam
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Present Complete Alert */}
                            {selectedGift.donation_percentage !== undefined && selectedGift.donation_percentage >= 100 && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-semibold text-green-700">✓ Presente Completo!</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Este presente já recebeu todas as doações necessárias. Obrigado pelos doadores!
                                    </p>
                                </div>
                            )}

                            {/* Donors List - Only show in admin */}
                            {isAdmin && selectedGift.donations && selectedGift.donations.length > 0 && (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-sm font-semibold text-foreground mb-2">Quem já doou:</p>
                                    <div className="space-y-2">
                                        {selectedGift.donations.map((donation) => (
                                            <div
                                                key={donation.id}
                                                className="flex items-center justify-between p-2 bg-white rounded border border-purple-100"
                                            >
                                                <span className="text-sm font-medium text-foreground">
                                                    {donation.donor_name}
                                                </span>
                                                <span className="text-sm font-semibold text-purple-600">
                                                    R$ {parseFloat(donation.amount as string).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Donor Name Input */}
                            {!(selectedGift.donation_percentage !== undefined && selectedGift.donation_percentage >= 100) && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium">Seu Nome *</label>
                                        <Input
                                            type="text"
                                            placeholder="Digite seu nome"
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            className="mt-2"
                                            onKeyPress={(e) => e.key === 'Enter' && donationAmount && handleDonateGift(selectedGift.id)}
                                        />
                                    </div>

                                    {/* Donation Amount Input */}
                                    <div>
                                        <label className="text-sm font-medium">Valor da Doação (R$) *</label>
                                        <Input
                                            type="number"
                                            placeholder="0,00"
                                            min="0.01"
                                            step="0.01"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(e.target.value)}
                                            className="mt-2"
                                            onKeyPress={(e) => e.key === 'Enter' && donorName && handleDonateGift(selectedGift.id)}
                                        />
                                    </div>

                                    {/* PIX Key Display */}
                                    {storeData?.couple.pix_key && (
                                        <div className="space-y-2 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Chave PIX do Casal
                                            </p>
                                            <div className="flex items-center gap-2 bg-white p-3 rounded border border-primary/30">
                                                <code className="flex-1 text-sm font-mono text-primary break-all overflow-hidden">
                                                    {storeData.couple.pix_key}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(storeData.couple.pix_key || '');
                                                        setCopiedPix(true);
                                                        setTimeout(() => setCopiedPix(false), 2000);
                                                        toast({
                                                            title: 'Copiado!',
                                                            description: 'Chave PIX copiada para área de transferência',
                                                        });
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded transition flex-shrink-0"
                                                    title="Copiar chave PIX"
                                                >
                                                    {copiedPix ? (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-5 w-5 text-primary" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Copie a chave PIX e realize a transferência no seu banco
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedGift(null);
                                        setDonorName('');
                                        setDonationAmount('');
                                        setCopiedPix(false);
                                    }}
                                >
                                    Fechar
                                </Button>
                                {selectedGift.donation_percentage !== undefined && selectedGift.donation_percentage >= 100 ? (
                                    <Button
                                        className="flex-1"
                                        disabled
                                    >
                                        Presente Completo
                                    </Button>
                                ) : (
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleDonateGift(selectedGift.id)}
                                        disabled={isDonating || !donorName.trim() || !donationAmount || parseFloat(donationAmount) <= 0}
                                    >
                                        {isDonating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirmar Doação
                                    </Button>
                                )}
                            </div>

                            {selectedGift.donation_percentage !== undefined && selectedGift.donation_percentage >= 100 ? (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    Obrigado pelo apoio! Este presente já foi totalmente presenteado.
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    Ao confirmar, seu nome aparecerá como quem contribuiu para este presente
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
