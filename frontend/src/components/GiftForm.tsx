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
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  price: z.coerce.number().min(1, 'O preço deve ser maior que zero'),
  imageUrl: z.string().url('Insira uma URL de imagem válida'),
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
      title: gift?.title || '',
      description: gift?.description || '',
      price: gift?.price || 0,
      imageUrl: gift?.imageUrl || '',
    },
  });

  const handleSubmit = async (data: CreateGiftInput) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Título do Presente</FormLabel>
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
          name="imageUrl"
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

        {form.watch('imageUrl') && (
          <div className="rounded-lg border p-2 sm:p-3">
            <p className="mb-2 text-xs text-muted-foreground">Pré-visualização:</p>
            <img
              src={form.watch('imageUrl')}
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