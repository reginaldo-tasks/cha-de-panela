import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

export default function Store() {
  const navigate = useNavigate();
  const [couplesLinks, setCouplesLinks] = useState<Array<{ name: string; slug: string }>>([]);

  useEffect(() => {
    // Load a few couple examples from API
    const loadCouples = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/gifts/');
        const data = await response.json();

        // Extract unique couples from gifts
        const couples = new Map();
        const results = data.results || data;

        if (Array.isArray(results)) {
          results.forEach((gift: any) => {
            if (gift.couple_name && !couples.has(gift.couple_name)) {
              couples.set(gift.couple_name, {
                name: gift.couple_name,
                slug: gift.couple_name.toLowerCase().replace(/&/g, '').trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
              });
            }
          });
        }

        setCouplesLinks(Array.from(couples.values()).slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar casais:', error);
      }
    };

    loadCouples();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-6 inline-block rounded-full background-secondary p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mb-4 font-display text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            Lista de Presentes
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Celebre os momentos especiais compartilhando amor e presentes.
            Encontre a lista perfeita para surpreender quem você ama.
          </p>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              ✨ Crie sua lista • 🎁 Organize presentes • 💝 Compartilhe com amigos
            </p>
          </div>
        </div>
      </section>

      {/* Couples Section */}
      {couplesLinks.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Listas Recentes
            </h2>
            <p className="text-muted-foreground">
              Confira algumas listas de presentes já criadas
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {couplesLinks.map((couple) => (
              <button
                key={couple.slug}
                onClick={() => navigate(`/${couple.slug}`)}
                className="group relative p-6 rounded-lg border border-secondary bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 truncate">
                  {couple.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ver lista de presentes →
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground">
            Crie Sua Lista
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Organize os presentes para seu casamento, aniversário ou qualquer ocasião especial.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/admin/register')}>
              Comece Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/como-funciona')}>
              Como Funciona
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Made with <Heart className="inline-block h-4 w-4 text-primary" /> para quem ama compartilhar</p>
      </footer>
    </div>
  );
}