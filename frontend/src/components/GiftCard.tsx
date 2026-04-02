import { Gift } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Gift as GiftIcon, Check, Heart } from 'lucide-react';

interface GiftCardProps {
  gift: Gift;
  onSelect?: (gift: Gift) => void;
  onReserve?: (gift: Gift) => void;
  isPublic?: boolean;
}

export function GiftCard({ gift, onSelect, onReserve, isPublic = false }: GiftCardProps) {
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice);
  };

  const getStatusBadge = () => {
    if (gift.status === 'purchased') {
      return (
        <Badge variant="secondary" className="gap-1 text-sm">
          <Check className="h-4 w-4" />
          Presenteado
        </Badge>
      );
    }
    if (gift.status === 'reserved') {
      return (
        <Badge variant="outline" className="gap-1 text-sm">
          <Heart className="h-4 w-4 fill-current" />
          Reservado
        </Badge>
      );
    }
    return null;
  };

  const statusBadge = getStatusBadge();

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {gift.image_url || gift.imageUrl ? (
          <img
            src={gift.image_url || gift.imageUrl}
            alt={gift.name || gift.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-muted">
            <GiftIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {statusBadge && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            {statusBadge}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 font-display text-lg font-semibold text-foreground">
          {gift.name || gift.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {gift.description}
        </p>
        {gift.price && (
          <p className="font-display text-xl font-bold text-primary">
            {formatPrice(gift.price)}
          </p>
        )}
        {gift.reserved_by && isPublic && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reservado por: <span className="font-semibold">{gift.reserved_by}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isPublic ? (
          <Button
            onClick={() => onReserve?.(gift)}
            disabled={gift.status !== 'available'}
            className="w-full gap-2"
            variant={gift.status !== 'available' ? 'secondary' : 'default'}
          >
            {gift.status === 'purchased' ? (
              <>
                <Check className="h-4 w-4" />
                Presenteado
              </>
            ) : gift.status === 'reserved' ? (
              <>
                <Heart className="h-4 w-4 fill-current" />
                Reservado
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                Presentear
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => onSelect?.(gift)}
            disabled={gift.is_selected || gift.isSelected}
            className="w-full gap-2"
            variant={gift.is_selected || gift.isSelected ? 'secondary' : 'default'}
          >
            {gift.is_selected || gift.isSelected ? (
              <>
                <Check className="h-4 w-4" />
                Já presenteado
              </>
            ) : (
              <>
                <GiftIcon className="h-4 w-4" />
                Presentear
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}