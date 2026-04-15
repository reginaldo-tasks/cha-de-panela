import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Gift } from '@/types';
import { Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gift: Gift;
    onUploadSuccess: (updatedGift: Gift) => void;
}

export function ImageUploadDialog({
    open,
    onOpenChange,
    gift,
    onUploadSuccess,
}: ImageUploadDialogProps) {
    const [preview, setPreview] = useState<string | null>(gift.image_url || null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validate file type
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                toast({
                    title: 'Tipo de arquivo inválido',
                    description: 'Apenas JPEG, PNG e WebP são permitidos',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: 'Arquivo muito grande',
                    description: `Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB, seu arquivo tem ${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    variant: 'destructive',
                });
                return;
            }

            setFileName(file.name);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast({
                title: 'Nenhuma imagem selecionada',
                description: 'Selecione uma imagem para fazer upload',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const { api } = await import('@/services/api');
            const updatedGift = await api.upload.uploadGiftImage(gift.id, file);

            toast({
                title: 'Imagem enviada com sucesso!',
                description: 'A imagem do presente foi atualizada.',
            });

            onUploadSuccess(updatedGift);
            onOpenChange(false);

            // Reset state
            setPreview(null);
            setFileName(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Erro ao fazer upload',
                description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const clearPreview = () => {
        setPreview(gift.image_url || null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full">
                <DialogHeader>
                    <DialogTitle>Enviar Imagem do Presente</DialogTitle>
                    <DialogDescription>
                        Escolha uma imagem para {gift.name || gift.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Input Area */}
                    <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_MIME_TYPES.join(',')}
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {fileName ? `Arquivo: ${fileName}` : 'Clique ou arraste uma imagem aqui'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPEG, PNG ou WebP • Máximo {MAX_FILE_SIZE / 1024 / 1024}MB
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="rounded-lg border p-3">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-xs text-muted-foreground">Visualização:</p>
                                <button
                                    type="button"
                                    onClick={clearPreview}
                                    disabled={isUploading}
                                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-48 rounded object-cover"
                            />
                        </div>
                    )}

                    {/* Current Image (if exists and no preview) */}
                    {gift.image_url && !preview && (
                        <div className="rounded-lg border p-3">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-xs text-muted-foreground">Imagem atual:</p>
                            </div>
                            <img
                                src={gift.image_url}
                                alt={gift.name || gift.title}
                                className="w-full h-48 rounded object-cover"
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading || !fileInputRef.current?.files?.[0]}
                            className="flex-1"
                        >
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
