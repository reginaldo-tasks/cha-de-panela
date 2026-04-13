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
import { Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

const giftSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  title: z.string().optional(),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  price: z.coerce.number().min(1, 'O preço deve ser maior que zero'),
  image_file: z
    .instanceof(File)
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      'Apenas imagens JPEG e PNG são permitidas'
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      'A imagem deve ter no máximo 1MB'
    )
    .optional()
    .or(z.undefined()),
});

interface GiftFormProps {
  gift?: Gift | null;
  onSubmit: (data: CreateGiftInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GiftForm({ gift, onSubmit, onCancel, isLoading }: GiftFormProps) {
  const [preview, setPreview] = useState<string | null>(gift?.image_url || null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<CreateGiftInput>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: gift?.name || gift?.title || '',
      title: gift?.title || '',
      description: gift?.description || '',
      price: gift?.price ? Number(gift.price) : 0,
      image_file: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        form.setError('image_file', {
          message: 'Apenas imagens JPEG e PNG são permitidas',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        form.setError('image_file', {
          message: `Arquivo muito grande. Máximo 1MB, seu arquivo tem ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        });
        return;
      }

      // Set file
      form.setValue('image_file', file);
      setFileName(file.name);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue('image_file', undefined);
    setPreview(null);
    setFileName(null);
  };

  const handleSubmit = async (data: CreateGiftInput) => {
    // Ensure all fields are properly set for backend
    const backendData: CreateGiftInput = {
      name: data.name || data.title || '',
      description: data.description,
      price: data.price,
      image_file: data.image_file,
    };
    await onSubmit(backendData);
    form.reset();
    setPreview(null);
    setFileName(null);
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
          name="image_file"
          render={() => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Imagem do Presente</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {fileName ? `Arquivo: ${fileName}` : 'Clique ou arraste uma imagem aqui'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG ou PNG • Máximo 1MB
                      </p>
                    </div>
                  </div>

                  {preview && (
                    <div className="rounded-lg border p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs text-muted-foreground">Pré-visualização:</p>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 sm:h-32 sm:w-32 rounded object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-3 sm:pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 text-sm sm:text-base">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 text-sm sm:text-base">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {gift ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}