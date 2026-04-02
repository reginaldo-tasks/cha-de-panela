import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Gift, CreateGiftInput } from '@/types';
import { Loader2 } from 'lucide-react';

const giftSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  title: z.string().optional(),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  price: z.coerce.number().min(1, 'O preço deve ser maior que zero'),
  image_url: z.string().url('Insira uma URL de imagem válida').optional().or(z.literal('')),
  imageUrl: z.string().optional(),
});

interface GiftFormProps {
  gift?: Gift | null;
  onSubmit: (data: CreateGiftInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GiftForm({ gift, onSubmit, onCancel, isLoading }: GiftFormProps) {
  const form = useForm<CreateGiftInput>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: gift?.name || gift?.title || '',
      title: gift?.title || '',
      description: gift?.description || '',
      price: gift?.price ? Number(gift.price) : 0,
      image_url: gift?.image_url || gift?.imageUrl || '',
      imageUrl: gift?.imageUrl || '',
    },
  });

  const handleSubmit = async (data: CreateGiftInput) => {
    // Ensure all fields are properly set for backend
    const backendData: CreateGiftInput = {
      name: data.name || data.title || '',
      description: data.description,
      price: data.price,
      image_url: data.image_url || data.imageUrl || undefined,
    };
    await onSubmit(backendData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Nome do Presente</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Jogo de Panelas" {...field} className="text-sm" />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o presente..."
                  rows={3}
                  {...field}
                  className="text-sm resize-none"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Preço (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  {...field}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        {form.watch('image_url') && (
          <div className="rounded-lg border p-2 sm:p-3">
            <p className="mb-2 text-xs text-muted-foreground">Pré-visualização:</p>
            <img
              src={form.watch('image_url')}
              alt="Preview"
              className="h-24 w-24 sm:h-32 sm:w-32 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Erro';
              }}
            />
          </div>
        )}

        <div className="flex gap-2 pt-3 sm:pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 text-sm sm:text-base">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 text-sm sm:text-base">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {gift ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}