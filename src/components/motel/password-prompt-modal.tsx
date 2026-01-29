'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (password: string) => void;
  title: string;
  description: string;
}

export default function PasswordPromptModal({ isOpen, onOpenChange, onConfirm, title, description }: PasswordPromptModalProps) {
  const [password, setPassword] = useState('');

  const handleConfirmClick = () => {
    onConfirm(password);
    setPassword(''); // Reset password after confirm
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword(''); // Reset on close
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <Label htmlFor="password-prompt">Contraseña de Administrador</Label>
          <Input
            id="password-prompt"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmClick()}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
