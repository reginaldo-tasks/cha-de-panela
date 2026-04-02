import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Upload, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  coupleName: z.string().min(3, 'O nome do casal deve ter no mínimo 3 caracteres'),
  listTitle: z.string().min(5, 'O título da lista deve ter no mínimo 5 caracteres'),
  whatsapp: z.string().min(10, 'Insira um número de WhatsApp válido'),
  pixKey: z.string().min(5, 'Insira uma chave PIX válida'),
  qrCodeUrl: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { couple, updateCouple } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      coupleName: couple?.coupleName || '',
      listTitle: couple?.listTitle || '',
      whatsapp: couple?.whatsapp || '',
      pixKey: couple?.pixKey || '',
      qrCodeUrl: couple?.qrCodeUrl || '',
    },
  });

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true);
    try {
      // Send to API
      await api.couple.update({
        coupleName: data.coupleName,
        listTitle: data.listTitle,
        whatsapp: data.whatsapp,
        pixKey: data.pixKey,
        qrCodeUrl: data.qrCodeUrl || null,
      });
      
      // Update local state
      updateCouple({
        coupleName: data.coupleName,
        listTitle: data.listTitle,
        whatsapp: data.whatsapp,
        pixKey: data.pixKey,
        qrCodeUrl: data.qrCodeUrl || null,
      });
      
      toast({
        title: 'Configurações salvas!',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const qrCodeUrl = form.watch('qrCodeUrl');

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Personalize sua lista de presentes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Informações do Casal</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure os dados que aparecerão na sua lista de presentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="coupleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Nome do Casal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Iara & Ramon" {...field} className="text-sm" />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Como vocês querem ser chamados
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="listTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Título da Lista</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Chá de Panela da Iara e do Ramon"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Título que aparece no topo da página
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Número do WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 5511999999999"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Com código do país (55) e DDD, sem espaços
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="gap-2 w-full">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Salvar Alterações</span>
                    <span className="sm:hidden">Salvar</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* PIX Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Configurações do PIX</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure como os convidados irão pagar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="pixKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Chave PIX</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: seu@email.com ou CPF"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Pode ser email, CPF, telefone ou chave aleatória
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qrCodeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">URL da Imagem do QR Code</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://exemplo.com/qrcode.png"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Cole a URL de uma imagem do seu QR Code PIX
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* QR Code Preview */}
                  <div className="rounded-lg border bg-muted/50 p-3 sm:p-4">
                    <p className="mb-3 text-xs sm:text-sm font-medium">Pré-visualização do QR Code</p>
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code PIX"
                        className="mx-auto h-32 w-32 sm:h-40 sm:w-40 rounded-lg object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-muted-foreground">
                        <QrCode className="mb-2 h-8 w-8 sm:h-12 sm:w-12" />
                        <p className="text-xs sm:text-sm">Nenhum QR Code configurado</p>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="gap-2 w-full">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Salvar PIX</span>
                    <span className="sm:hidden">Salvar</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Integração com Backend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informações para conectar ao seu próprio backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Para conectar este frontend ao seu backend, configure a variável de ambiente:
            </p>
            <code className="block rounded bg-muted p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
              VITE_API_URL=https://seu-backend.com/api
            </code>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Consulte a documentação dos endpoints esperados no arquivo{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">src/services/api.ts</code>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}