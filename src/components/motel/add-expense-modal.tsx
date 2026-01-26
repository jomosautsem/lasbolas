'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Receipt, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: { description: string; amount: number }) => void;
}

export default function AddExpenseModal({ isOpen, onOpenChange, onConfirm }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setDescription('');
    setAmount('');
    setIsConfirming(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  const handleReview = () => {
    if (!description.trim() || !amount || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Datos Incompletos',
        description: 'Por favor, ingrese una descripción y un monto válido.',
      });
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmExpense = () => {
    if (description && amount) {
      onConfirm({ description, amount: +amount });
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Registrar Gasto
          </DialogTitle>
          <DialogDescription>
            Ingrese los detalles del gasto para registrarlo en el turno actual.
          </DialogDescription>
        </DialogHeader>

        {!isConfirming ? (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Gasto</Label>
              <Textarea
                id="description"
                placeholder="Ej. Compra de productos de limpieza"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto del Gasto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="p-4 border bg-blue-50 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800 flex items-center gap-2"><Info className="h-5 w-5"/>Confirmar Gasto</h3>
                <div className="text-sm text-blue-700 space-y-2">
                    <p><span className="font-semibold">Descripción:</span> {description}</p>
                    <div className="flex justify-between items-center font-bold text-blue-800 text-lg border-t border-blue-300 mt-2 pt-2">
                        <span>Monto:</span> 
                        <span>${typeof amount === 'number' ? amount.toFixed(2) : '0.00'}</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {isConfirming ? (
            <>
              <Button type="button" variant="ghost" onClick={() => setIsConfirming(false)}>Atrás</Button>
              <Button type="button" onClick={handleConfirmExpense}>Confirmar Gasto</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="button" onClick={handleReview}>Revisar Gasto</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
