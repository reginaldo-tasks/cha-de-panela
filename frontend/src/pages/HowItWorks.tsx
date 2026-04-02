import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Gift,
    Users,
    Share2,
    MapPin,
    Heart,
    CheckCircle,
    ArrowRight,
    Lock,
    Zap,
    MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<'couple' | 'guest'>('couple');

    const coupleTutorial = [
        {
            step: 1,
            title: 'Crie sua Conta',
            description: 'Registre-se com email e senha',
            icon: Users,
            details: [
                'Acesse /admin/register',
                'Preencha email e senha (mín. 8 caracteres)',
                'Escolha um nome para o casal (ex: Iara & Ramon)',
                'Clique em "Criar Conta"'
            ],
            action: 'Registrar'
        },
        {
            step: 2,
            title: 'Configure sua Loja',
            description: 'Personalize as informações do seu casal',
            icon: MapPin,
            details: [
                'Acesse /admin/settings',
                'Configure nome, data do casamento',
                'Adicione biografia do casal',
                'Insira chave PIX para receber presentes',
                'Defina WhatsApp da loja'
            ],
            action: 'Configurar'
        },
        {
            step: 3,
            title: 'Adicione Presentes',
            description: 'Monte sua lista de presentes',
            icon: Gift,
            details: [
                'Acesse /admin/gifts',
                'Clique em "Adicionar Presente"',
                'Preencha: nome, descrição, preço, imagem',
                'Adicione quantos presentes desejar',
                'Mínimo recomendado: 10-20 itens'
            ],
            action: 'Adicionar'
        },
        {
            step: 4,
            title: 'Compartilhe seu Link',
            description: 'Invite amigos e família',
            icon: Share2,
            details: [
                'URL da sua loja: http://localhost:8080/seu-nome-slug',
                'Exemplo: http://localhost:8080/iara-ramon',
                'Copie o link das Configurações',
                'Compartilhe via WhatsApp, email, redes sociais',
                'Cada amigo acessa sua loja pessoal'
            ],
            action: 'Compartilhar'
        },
        {
            step: 5,
            title: 'Gerencie Presentes',
            description: 'Acompanhe o que foi presenteado',
            icon: CheckCircle,
            details: [
                'Dashboard mostra estatísticas em tempo real',
                'Veja presentes comprados vs disponíveis',
                'Marque presentes como recebidos',
                'Acompanhe valor total recebido',
                'Gerencie lista conforme necessário'
            ],
            action: 'Gerenciar'
        }
    ];

    const guestTutorial = [
        {
            step: 1,
            title: 'Acesse a Loja',
            description: 'Entre no link fornecido pelo casal',
            icon: MapPin,
            details: [
                'Clique no link recebido via WhatsApp/email',
                'Exemplo: http://localhost:8080/iara-ramon',
                'Veja toda a lista de presentes de forma visual',
                'Consulte dados do casal (fotos, data do casamento)',
                'Sem necessidade de criar conta'
            ],
            action: 'Acessar'
        },
        {
            step: 2,
            title: 'Escolha um Presente',
            description: 'Navegue entre as opções',
            icon: Gift,
            details: [
                'Veja nome, descrição, preço e imagem',
                'Presentes marcados com ✅ já foram presenteados',
                'Presentes com 💝 estão reservados',
                'Presentes em branco estão disponíveis',
                'Clique no que deseja comprar'
            ],
            action: 'Escolher'
        },
        {
            step: 3,
            title: 'Presentear',
            description: 'Informe seus dados e receba o PIX',
            icon: Heart,
            details: [
                'Clique em "Presentear" no presente escolhido',
                'Preenchja seu nome completo',
                'Visualize a chave PIX do casal',
                'Clique em "Copiar PIX" para copiar a chave',
                'Modal mostra instruções de pagamento'
            ],
            action: 'Presentear'
        },
        {
            step: 4,
            title: 'Faça a Transferência',
            description: 'Realize o pagamento via PIX',
            icon: Zap,
            details: [
                'Abra seu app de banco',
                'Escolha "Pagar com PIX"',
                'Cole a chave PIX copiada',
                'Confirme valor e dados do casal',
                'Finalize a transferência'
            ],
            action: 'Transferir'
        },
        {
            step: 5,
            title: 'Presente Registrado!',
            description: 'Seu presente foi reservado',
            icon: CheckCircle,
            details: [
                'Presente agora mostra seu nome',
                'Status muda para "Reservado"',
                'Casal notificado do pagamento',
                'Você recebe mensagem de confirmação',
                'Presente será marcado como "Presenteado" ao ser entregue'
            ],
            action: 'Sucesso'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="mb-4 font-display text-3xl sm:text-5xl font-bold text-foreground">
                            Como Funciona
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Veja o passo a passo para criar sua lista e presentear amigos
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="flex justify-center gap-4 mb-12">
                        <Button
                            size="lg"
                            variant={selectedRole === 'couple' ? 'default' : 'outline'}
                            onClick={() => {
                                setSelectedRole('couple');
                                setActiveStep(1);
                            }}
                            className="gap-2"
                        >
                            <Lock className="h-5 w-5" />
                            Sou um Casal
                        </Button>
                        <Button
                            size="lg"
                            variant={selectedRole === 'guest' ? 'default' : 'outline'}
                            onClick={() => {
                                setSelectedRole('guest');
                                setActiveStep(1);
                            }}
                            className="gap-2"
                        >
                            <Gift className="h-5 w-5" />
                            Sou um Convidado
                        </Button>
                    </div>
                </div>
            </section>

            {/* Interactive Tutorial */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Steps Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-3">
                            {(selectedRole === 'couple' ? coupleTutorial : guestTutorial).map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.step}
                                        onClick={() => setActiveStep(item.step)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${activeStep === item.step
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${activeStep === item.step
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {item.step}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-2">
                        {(selectedRole === 'couple' ? coupleTutorial : guestTutorial).map((item) => {
                            if (item.step !== activeStep) return null;

                            const IconComponent = item.icon;
                            return (
                                <div key={item.step} className="space-y-6">
                                    {/* Main Card */}
                                    <Card className="border-2">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <IconComponent className="h-8 w-8 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                                                    <CardDescription className="text-base">{item.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    {/* Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Passo a Passo</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ol className="space-y-4">
                                                {item.details.map((detail, idx) => (
                                                    <li key={idx} className="flex gap-4">
                                                        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary/10">
                                                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                                        </div>
                                                        <p className="pt-1 text-sm text-muted-foreground">{detail}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                        </CardContent>
                                    </Card>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-4">
                                        {activeStep > 1 && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveStep(activeStep - 1)}
                                                className="flex-1"
                                            >
                                                ← Anterior
                                            </Button>
                                        )}
                                        {activeStep < (selectedRole === 'couple' ? 5 : 5) && (
                                            <Button
                                                onClick={() => setActiveStep(activeStep + 1)}
                                                className="flex-1 gap-2"
                                            >
                                                Próximo <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {activeStep === (selectedRole === 'couple' ? 5 : 5) && (
                                            <Button
                                                onClick={() => navigate(selectedRole === 'couple' ? '/admin/register' : '/')}
                                                className="flex-1 gap-2"
                                            >
                                                {selectedRole === 'couple' ? 'Começar Agora' : 'Voltar à Home'}
                                                <Zap className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: 'URLs Amigáveis',
                            description: 'Link simples e bonito: seu-nome-casal.com.br',
                            icon: MapPin,
                        },
                        {
                            title: 'Pagamento PIX',
                            description: 'Receba presentes via PIX de forma rápida e segura',
                            icon: Zap,
                        },
                        {
                            title: 'Sem Cadastro para Convidados',
                            description: 'Amigos acessam a loja sem precisar criar conta',
                            icon: Heart,
                        },
                        {
                            title: 'Dashboard em Tempo Real',
                            description: 'Acompanhe presentes comprados e valor recebido',
                            icon: CheckCircle,
                        },
                        {
                            title: 'Imagens nos Presentes',
                            description: 'Adicione fotos para cada presente da sua lista',
                            icon: Gift,
                        },
                        {
                            title: 'Integração WhatsApp',
                            description: 'Links diretos do WhatsApp direto na sua loja',
                            icon: MessageCircle,
                        },
                    ].map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={idx} className="hover:shadow-lg transition-all">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
                <div className="max-w-2xl mx-auto space-y-4">
                    {[
                        {
                            q: 'Quantos presentes posso adicionar?',
                            a: 'Sem limite! Adicione quantos desejar. Recomendamos entre 10-30 para melhor variedade.'
                        },
                        {
                            q: 'Quanto custa criar uma loja?',
                            a: 'Totalmente gratuito! Você paga apenas o PIX quando receber os presentes.'
                        },
                        {
                            q: 'Os convidados precisam criar conta?',
                            a: 'Não! Eles acessam sua loja direto pelo link sem cadastro.'
                        },
                        {
                            q: 'Como funciona o pagamento?',
                            a: 'Tudo via PIX. Os convidados copiam sua chave PIX e fazem a transferência pelo app do banco.'
                        },
                        {
                            q: 'Posso atualizar a lista depois?',
                            a: 'Claro! Você pode adicionar, remover ou editar presentes a qualquer momento.'
                        },
                        {
                            q: 'O sistema é seguro?',
                            a: 'Sim! Usamos autenticação JWT e sua chave PIX nunca é compartilhada publicamente.'
                        },
                    ].map((faq, idx) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-sm text-muted-foreground">{faq.a}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16">
                <Card className="border-2 border-primary bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
                    <CardContent className="pt-12 pb-12 text-center space-y-6">
                        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Crie sua lista de presentes em minutos e comece a receber PIX dos seus convidados
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button size="lg" className="gap-2" onClick={() => navigate('/admin/register')}>
                                <Heart className="h-5 w-5" />
                                Criar Conta Grátis
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => navigate('/iara-ramon')}>
                                Ver Exemplo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
