import { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { GiftForm } from '@/components/GiftForm';
import { useGifts } from '@/contexts/GiftsContext';
import { Gift, CreateGiftInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Gift as GiftIcon, Loader2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Gifts() {
  const { gifts, isLoading, addGift, updateGift, deleteGift } = useGifts();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [deletingGift, setDeletingGift] = useState<Gift | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleSubmit = async (data: CreateGiftInput) => {
    setIsSaving(true);
    try {
      if (editingGift) {
        await updateGift(editingGift.id, data);
        toast({
          title: 'Presente atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await addGift(data);
        toast({
          title: 'Presente adicionado!',
          description: 'O presente foi adicionado à sua lista.',
        });
      }
      setIsFormOpen(false);
      setEditingGift(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o presente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGift) return;

    try {
      await deleteGift(deletingGift.id);
      toast({
        title: 'Presente removido',
        description: 'O presente foi removido da sua lista.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o presente.',
        variant: 'destructive',
      });
    } finally {
      setDeletingGift(null);
    }
  };

  const openEditForm = (gift: Gift) => {
    setEditingGift(gift);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingGift(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Presentes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie os presentes da sua lista
            </p>
          </div>
          <Button onClick={openNewForm} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Presente</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gifts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <GiftIcon className="mb-4 h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
              <h3 className="mb-2 font-display text-lg sm:text-xl font-semibold text-center">
                Nenhum presente cadastrado
              </h3>
              <p className="mb-6 text-sm sm:text-base text-muted-foreground text-center">
                Adicione presentes para compartilhar com seus convidados
              </p>
              <Button onClick={openNewForm} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Presente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {gifts.map((gift) => (
              <Card key={gift.id}>
                <CardContent className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center p-3 sm:p-4">
                  <img
                    src={gift.image_url || gift.imageUrl || ''}
                    alt={gift.name || gift.title || 'Gift'}
                    className="h-24 w-24 sm:h-20 sm:w-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{gift.name || gift.title}</h3>
                      {gift.status === 'purchased' && (
                        <Badge className="text-xs sm:text-sm bg-green-100 text-green-800 hover:bg-green-100">
                          ✓ Comprado
                        </Badge>
                      )}
                      {gift.status === 'reserved' && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          Reservado por {gift.reserved_by}
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-1 text-xs sm:text-sm text-muted-foreground">
                      {gift.description}
                    </p>
                    <p className="font-display text-base sm:text-lg font-bold text-primary mt-1">
                      {formatPrice(Number(gift.price) || 0)}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto gap-2"
                      onClick={() => openEditForm(gift)}
                      variant="outline"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Presentear</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none sm:size-icon text-destructive hover:text-destructive"
                      onClick={() => setDeletingGift(gift)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sm:hidden ml-2">Deletar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-md w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingGift ? 'Editar Presente' : 'Adicionar Presente'}
              </DialogTitle>
            </DialogHeader>
            <GiftForm
              gift={editingGift}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGift(null);
              }}
              isLoading={isSaving}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingGift} onOpenChange={() => setDeletingGift(null)}>
          <AlertDialogContent className="w-[95vw] sm:w-full">
            <AlertDialogHeader>
              <AlertDialogTitle>Remover presente?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover "{deletingGift?.title}" da sua lista?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}