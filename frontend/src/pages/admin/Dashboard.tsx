import { AdminSidebar } from '@/components/AdminSidebar';
import { useGifts } from '@/contexts/GiftsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Heart, DollarSign, Clock } from 'lucide-react';

export default function Dashboard() {
  const { gifts } = useGifts();
  const { couple } = useAuth();

  console.log('[Dashboard] Rendering with couple:', couple?.couple_name, 'gifts:', gifts.length);

  // Helper to convert price to number
  const toNumber = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'string') return parseFloat(price) || 0;
    return price || 0;
  };

  const totalGifts = gifts.length;
  const selectedGifts = gifts.filter((g) => g.status === 'purchased' || g.is_selected || g.isSelected).length;
  const availableGifts = totalGifts - selectedGifts;
  const totalValue = gifts.reduce((sum, g) => sum + toNumber(g.price), 0);
  const receivedValue = gifts
    .filter((g) => g.status === 'purchased' || g.is_selected || g.isSelected)
    .reduce((sum, g) => sum + toNumber(g.price), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const stats = [
    {
      title: 'Total de Presentes',
      value: totalGifts.toString(),
      description: 'Cadastrados na lista',
      icon: Gift,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Já Presenteados',
      value: selectedGifts.toString(),
      description: `${availableGifts} ainda disponíveis`,
      icon: Heart,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Valor Total da Lista',
      value: formatPrice(totalValue),
      description: 'Soma de todos os presentes',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Valor Recebido',
      value: formatPrice(receivedValue),
      description: `${((receivedValue / totalValue) * 100 || 0).toFixed(0)}% do total`,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Olá, {couple?.couple_name || 'Casal'}! 💕
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Aqui está um resumo da sua lista de presentes
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <CardDescription className="text-xs sm:text-sm">{stat.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 sm:mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Próximos passos</CardTitle>
                <CardDescription>
                  Complete sua lista para receber mais presentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm sm:text-lg">1</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Adicione mais presentes</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Quanto mais opções, mais fácil para os convidados escolherem
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm sm:text-lg">2</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Configure o PIX</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Adicione sua chave PIX e QR Code nas configurações
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm sm:text-lg">3</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Compartilhe o link</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Envie o link da sua lista para amigos e familiares
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}