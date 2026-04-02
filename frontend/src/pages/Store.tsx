import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { GiftCard } from '@/components/GiftCard';
import { PaymentModal } from '@/components/PaymentModal';
import { useGifts } from '@/contexts/GiftsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Couple } from '@/types';
import { api } from '@/services/api';
import { Loader2, Heart, Gift as GiftIcon } from 'lucide-react';

export default function Store() {
  const { gifts, isLoading: isGiftsLoading, markAsSelected } = useGifts();
  const { couple } = useAuth();
  const [coupleData, setCoupleData] = useState<Couple | null>(null);
  const [isCoupleLoading, setIsCoupleLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    const loadCoupleData = async () => {
      setIsCoupleLoading(true);
      try {
        const data = await api.couple.getPublic();
        setCoupleData(data);
      } catch (error) {
        console.error('Erro ao carregar dados do casal:', error);
        setCoupleData(null);
      } finally {
        setIsCoupleLoading(false);
      }
    };
    loadCoupleData();
  }, []);

  const handleSelectGift = (gift: Gift) => {
    setSelectedGift(gift);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async (giftId: string) => {
    try {
      await markAsSelected(giftId);
    } catch (error) {
      console.error('Erro ao marcar presente como selecionado:', error);
    }
  };

  const availableGifts = gifts.filter((g) => !g.isSelected);
  const selectedGifts = gifts.filter((g) => g.isSelected);

  const isLoading = isCoupleLoading || isGiftsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando lista de presentes...</p>
        </div>
      </div>
    );
  }

  if (!coupleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum casal encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={coupleData.listTitle || 'Lista de Presentes'} coupleName={coupleData.coupleName || 'Casal'} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-16 text-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        </div>
        
        <div className="container relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            {coupleData?.listTitle || 'Lista de Presentes'}
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Escolha um presente especial para celebrar nosso amor.
            Sua presença é o maior presente, mas se quiser nos ajudar a construir
            nosso lar, ficaremos muito felizes!
          </p>
        </div>
      </section>

      {/* Gifts Grid */}
      <main className="container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Available Gifts */}
            {availableGifts.length > 0 && (
              <section className="mb-12">
                <div className="mb-6 flex items-center gap-2">
                  <GiftIcon className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Presentes Disponíveis
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm text-primary">
                    {availableGifts.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {availableGifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
                  ))}
                </div>
              </section>
            )}

            {/* Selected Gifts */}
            {selectedGifts.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-display text-2xl font-semibold text-muted-foreground">
                    Já Presenteados
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                    {selectedGifts.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {selectedGifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
                  ))}
                </div>
              </section>
            )}

            {gifts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <GiftIcon className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  Nenhum presente cadastrado
                </h3>
                <p className="text-muted-foreground">
                  Em breve teremos presentes disponíveis para você escolher!
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Feito com <Heart className="inline-block h-4 w-4 text-primary" /> para {coupleData.coupleName}
        </p>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        gift={selectedGift}
        couple={coupleData}
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedGift(null);
        }}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}