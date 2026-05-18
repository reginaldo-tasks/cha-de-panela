import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { applyTheme } from '@/lib/themeUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
import { generateSlug } from '@/lib/utils';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Copy, Check, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const settingsSchema = z.object({
  couple_name: z.string().min(1, 'Nome do casal é obrigatório'),
  list_title: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  pix_key: z.string().optional().default(''),
  wedding_date: z.string().optional().default(''),
  biography: z.string().optional().default(''),
  image_url: z.string().optional().default(''),
  theme: z.enum(['rose', 'purple', 'blue', 'emerald', 'amber', 'orange']).optional().default('rose'),
});

// Theme color configurations
const themeOptions = [
  { value: 'rose', label: 'Rosa', primaryColor: '#f43f5e', secondaryColor: '#fbf1f5' },
  { value: 'purple', label: 'Roxo', primaryColor: '#a855f7', secondaryColor: '#faf5ff' },
  { value: 'blue', label: 'Azul', primaryColor: '#3b82f6', secondaryColor: '#eff6ff' },
  { value: 'emerald', label: 'Esmeralda', primaryColor: '#10b981', secondaryColor: '#f0fdf4' },
  { value: 'amber', label: 'Âmbar', primaryColor: '#f59e0b', secondaryColor: '#fffbeb' },
  { value: 'orange', label: 'Laranja', primaryColor: '#f97316', secondaryColor: '#fff7ed' },
];

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { couple } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      couple_name: '',
      list_title: '',
      whatsapp: '',
      pix_key: '',
      wedding_date: '',
      biography: '',
      image_url: '',
      theme: 'rose',
    },
  });

  // Fetch existing couple data
  useEffect(() => {
    const fetchCouple = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/couple/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          form.reset({
            couple_name: data.couple_name || '',
            list_title: data.list_title || '',
            whatsapp: data.whatsapp || '',
            pix_key: data.pix_key || '',
            wedding_date: data.wedding_date || '',
            biography: data.biography || '',
            image_url: data.image_url || '',
            theme: data.theme || 'rose',
          });
          if (data.image_url) {
            setPreview(data.image_url);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar informações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as informações do casal',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    if (couple) {
      fetchCouple();
    }
  }, [couple, form, toast]);

  // Watch theme changes and apply them in real-time
  const theme = form.watch('theme');

  useEffect(() => {
    if (theme) {
      console.log('[Settings] Theme changed to:', theme);
      applyTheme(theme);
    }
  }, [theme]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(file.type)) {
        toast({
          title: 'Erro',
          description: 'Apenas imagens JPEG e PNG são permitidas',
          variant: 'destructive',
        });
        return;
      }

      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast({
          title: 'Erro',
          description: `Arquivo muito grande. Máximo 1MB, seu arquivo tem ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          variant: 'destructive',
        });
        return;
      }

      setIsUploadingImage(true);
      try {
        // Upload the file and get the URL
        const result = await api.upload.image(file);
        form.setValue('image_url', result.url);
        setFileName(file.name);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        toast({
          title: 'Sucesso!',
          description: 'Imagem enviada com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao fazer upload da imagem',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const clearImage = () => {
    form.setValue('image_url', '');
    setPreview(null);
    setFileName(null);
  };

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/couple/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Informações do casal atualizadas com sucesso.',
        });
      } else {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao salvar as informações',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie os dados da sua lista de presentes</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Casal</CardTitle>
                <CardDescription>
                  Estas informações aparecem na sua loja pública
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="couple_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Casal</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Ex: João & Maria"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="list_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Lista</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Ex: Nossa Lista de Casamento"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wedding_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Casamento</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="biography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografia / Sobre nós</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte um pouco sobre vocês..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Contato e Pagamento</h3>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+55 11 99999-9999"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pix_key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chave PIX</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="CPF, Email, Telefone ou Chave Aleatória"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagem do Casal</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 hover:border-primary/50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={handleFileChange}
                                  disabled={isUploadingImage}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                                  {isUploadingImage ? (
                                    <>
                                      <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Enviando imagem...
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                      <p className="text-sm font-medium text-muted-foreground">
                                        {fileName ? `Arquivo: ${fileName}` : 'Clique ou arraste uma imagem aqui'}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        JPEG ou PNG • Máximo 1MB
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>

                              {preview && (
                                <div className="rounded-lg border p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-xs text-muted-foreground">Pré-visualização:</p>
                                    <button
                                      type="button"
                                      onClick={clearImage}
                                      disabled={isUploadingImage}
                                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Tema de Cores</h3>
                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selecione um tema para sua loja</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                {themeOptions.map((theme) => (
                                  <button
                                    key={theme.value}
                                    type="button"
                                    onClick={() => field.onChange(theme.value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${field.value === theme.value
                                      ? 'border-foreground bg-gray-100'
                                      : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <div className="flex gap-2">
                                      <div
                                        className="w-6 h-6 rounded-full border"
                                        style={{ backgroundColor: theme.primaryColor }}
                                      />
                                      <div
                                        className="w-6 h-6 rounded-full border"
                                        style={{ backgroundColor: theme.secondaryColor }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-center">{theme.label}</span>
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base">URL Pública da Loja</CardTitle>
              </CardHeader>
              <CardContent>
                {form.watch('couple_name') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-white p-3 rounded border border-blue-200">
                      <code className="flex-1 text-sm font-mono text-blue-900">
                        {`${window.location.origin}/store/${generateSlug(form.watch('couple_name'))}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/store/${generateSlug(form.watch('couple_name'))}`
                          );
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="Copiar URL"
                      >
                        {copiedUrl ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-blue-700">
                      Compartilhe este link com seus convidados para que vejam sua lista de presentes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div >
      </main >
    </div >
  );
}