import { Heart, Share2, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  title: string;
  coupleName: string;
}

export function Header({ title, coupleName }: HeaderProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Confira a lista de presentes de ${coupleName}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copiado!',
          description: 'Compartilhe o link com seus amigos e familiares.',
        });
      }
    } catch (err) {
      // User cancelled share or error occurred
    }
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <span className="hidden font-display text-lg font-semibold text-foreground sm:inline">
            {coupleName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}