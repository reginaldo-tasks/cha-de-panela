import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useState } from 'react';
import { 
  Heart, 
  Gift, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/gifts', label: 'Presentes', icon: Gift },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout, couple } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 flex h-16 items-center border-b bg-sidebar px-4 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 hover:bg-sidebar-accent"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-sidebar-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-sidebar-foreground" />
          )}
        </button>
        <div className="ml-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold text-sidebar-foreground">
            Admin
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-sidebar transition-transform duration-200 ease-in-out md:relative md:top-0 md:h-screen md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Desktop Logo */}
        <div className="hidden h-16 items-center gap-2 border-b px-6 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold text-sidebar-foreground">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          
          <Link to="/" target="_blank" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver loja</span>
            </Button>
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {couple?.coupleName || 'Casal'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {couple?.email || 'admin@casamento.com'}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}