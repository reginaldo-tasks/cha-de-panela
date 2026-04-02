import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Gift, Couple } from '../types';
import { Copy, Check, MessageCircle, QrCode, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  gift: Gift | null;
  couple: Couple;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (giftId: string) => void;
}

export function PaymentModal({ gift, couple, isOpen, onClose, onConfirmPayment }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [showSendButton, setShowSendButton] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Show send button after 5 seconds or after copying
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowSendButton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSendButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleCopyPix = useCallback(async () => {
    if (!couple?.pixKey) {
      toast({
        title: 'Chave PIX não configurada',
        description: 'O casal não configurou a chave PIX ainda.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(couple.pixKey);
      setCopied(true);
      setShowSendButton(true);
      toast({
        title: 'Chave PIX copiada!',
        description: 'Cole no seu aplicativo de banco para realizar o pagamento.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente copiar manualmente a chave PIX.',
        variant: 'destructive',
      });
    }
  }, [couple?.pixKey, toast]);

  const handleSendWhatsApp = () => {
    if (!gift) return;
    
    if (!couple?.whatsapp) {
      toast({
        title: 'WhatsApp não configurado',
        description: 'O casal não configurou o WhatsApp ainda.',
        variant: 'destructive',
      });
      return;
    }
    
    const message = encodeURIComponent(
      `Olá, aqui está meu presente: *${gift.title}* 🎁\n\nValor: ${formatPrice(gift.price)}`
    );
    const whatsappNumber = couple.whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    if (gift) {
      onConfirmPayment(gift.id);
    }
    onClose();
  };

  const handleCloseModal = () => {
    if (gift) {
      onConfirmPayment(gift.id);
    }
    onClose();
  };

  if (!gift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl">
            Presentear com {gift.title}
          </DialogTitle>
          <DialogDescription>
            Faça o pagamento via PIX e envie o comprovante para o casal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor do presente</p>
            <p className="font-display text-3xl font-bold text-primary">
              {formatPrice(gift.price)}
            </p>
          </div>

          {/* QR Code */}
          {couple.qrCodeUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm font-medium text-foreground">QR Code PIX</p>
              <div className="rounded-lg border bg-card p-4">
                <img
                  src={couple.qrCodeUrl}
                  alt="QR Code PIX"
                  className="h-48 w-48 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-muted/50 p-6">
              <QrCode className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">QR Code não disponível</p>
            </div>
          )}

          {/* PIX Key */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Chave PIX (copia e cola)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm break-all">
                {couple.pixKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPix}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Send Receipt Button */}
          {showSendButton && (
            <div className="animate-fade-in space-y-2">
              <Button
                onClick={handleSendWhatsApp}
                className="w-full gap-2"
                size="lg"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar comprovante do PIX
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Será aberto o WhatsApp com uma mensagem pré-formatada
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}