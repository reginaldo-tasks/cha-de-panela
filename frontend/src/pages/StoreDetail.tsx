import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GiftCard } from '@/components/GiftCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Heart, MapPin, MessageCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    description: string | null;
    image_url: string | null;
    category: string | null;
    price: number | string;
    priority: number;
    status: 'available' | 'reserved' | 'purchased';
    reserved_by: string | null;
    url: string | null;
    is_selected: boolean;
}

interface StoreData {
    couple: Couple;
    gifts: Gift[];
}

export default function StoreDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { toast } = useToast();
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [reserveName, setReserveName] = useState('');
    const [isReserving, setIsReserving] = useState(false);
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

    const handleReserveGift = async (giftId: string) => {
        if (!reserveName.trim()) {
            toast({
                title: 'Erro',
                description: 'Por favor, digite seu nome',
                variant: 'destructive',
            });
            return;
        }

        setIsReserving(true);
        try {
            console.log(`[StoreDetail] Attempting to reserve gift ${giftId} for ${reserveName}`);
            const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/reserve/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: reserveName }),
            });

            if (response.ok) {
                const reservedGift = await response.json();
                console.log(`[StoreDetail] ✓ Gift reserved successfully:`, reservedGift);
                toast({
                    title: 'Sucesso!',
                    description: 'Presente reservado com sucesso',
                });
                setReserveName('');
                setSelectedGift(null);

                // Refresh store data
                if (storeData) {
                    const updatedGifts = storeData.gifts.map((gift) =>
                        gift.id === giftId ? { ...gift, status: 'reserved', reserved_by: reserveName } : gift
                    );
                    setStoreData({ ...storeData, gifts: updatedGifts });
                    console.log(`[StoreDetail] ✓ Updated local state, gift now shows as reserved by ${reserveName}`);
                }
            } else {
                throw new Error('Não foi possível reservar o presente');
            }
        } catch (error) {
            console.error('[StoreDetail] ✗ Error reserving gift:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao reservar presente',
                variant: 'destructive',
            });
        } finally {
            setIsReserving(false);
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

            {/* Presentear Modal - Improved Payment Flow */}
            {selectedGift && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl">Presentear {selectedGift.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Complete os dados para confirmar seu presente
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Gift Name Display */}
                            <div className="p-3 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Presente</p>
                                <p className="font-semibold text-foreground">{selectedGift.name}</p>
                                {selectedGift.price && (
                                    <p className="text-sm text-primary mt-1">
                                        R$ {parseFloat(selectedGift.price as string).toFixed(2).replace('.', ',')}
                                    </p>
                                )}
                            </div>

                            {/* Donor Name Input */}
                            <div>
                                <label className="text-sm font-medium">Seu Nome *</label>
                                <Input
                                    type="text"
                                    placeholder="Digite seu nome"
                                    value={reserveName}
                                    onChange={(e) => setReserveName(e.target.value)}
                                    className="mt-2"
                                    onKeyPress={(e) => e.key === 'Enter' && handleReserveGift(selectedGift.id)}
                                />
                            </div>

                            {/* PIX Key Display */}
                            {storeData?.couple.pix_key && (
                                <div className="space-y-2 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                                    <p className="text-sm font-semibold text-foreground">Chave PIX do Casal</p>
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

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedGift(null);
                                        setReserveName('');
                                        setCopiedPix(false);
                                    }}
                                    disabled={isReserving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => handleReserveGift(selectedGift.id)}
                                    disabled={isReserving || !reserveName.trim()}
                                >
                                    {isReserving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirmar Presenteação
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center pt-2">
                                Ao confirmar, seu nome aparecerá como quem presenteou este item
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
