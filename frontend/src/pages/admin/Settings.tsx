import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
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
import { Loader2, Save, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  couple_name: z.string().min(1, 'Nome do casal é obrigatório'),
  list_title: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  pix_key: z.string().optional().default(''),
  wedding_date: z.string().optional().default(''),
  biography: z.string().optional().default(''),
  image_url: z.string().optional().default(''),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { couple } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

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
    },
  });

  // Fetch existing couple data
  useEffect(() => {
    const fetchCouple = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/couple/', {
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
          });
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

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/couple/', {
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
                          <FormLabel>URL da Imagem do Casal</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://exemplo.com/foto.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                        http://localhost:8080/{generateSlug(form.watch('couple_name'))}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `http://localhost:8080/${generateSlug(form.watch('couple_name'))}`
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
        </div>
      </main>
    </div>
  );
}