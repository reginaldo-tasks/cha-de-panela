import { Gift } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Gift as GiftIcon, Check } from 'lucide-react';

interface GiftCardProps {
  gift: Gift;
  onSelect: (gift: Gift) => void;
}

export function GiftCard({ gift, onSelect }: GiftCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {gift.isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <Badge variant="secondary" className="gap-1 text-sm">
              <Check className="h-4 w-4" />
              Presenteado
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 font-display text-lg font-semibold text-foreground">
          {gift.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {gift.description}
        </p>
        <p className="font-display text-xl font-bold text-primary">
          {formatPrice(gift.price)}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onSelect(gift)}
          disabled={gift.isSelected}
          className="w-full gap-2"
          variant={gift.isSelected ? 'secondary' : 'default'}
        >
          {gift.isSelected ? (
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
      </CardFooter>
    </Card>
  );
}