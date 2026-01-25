'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tv, Wind, Plus, Minus } from 'lucide-react';
import type { Room } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ControlsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  room: Room;
  onSave: (roomId: number, tvControls: number, acControls: number) => void;
}

const ControlInput = ({ label, icon: Icon, value, onValueChange }: { label: string, icon: React.ElementType, value: number, onValueChange: (newValue: number) => void }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <Label className="text-lg font-medium">{label}</Label>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={() => onValueChange(Math.max(0, value - 1))}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-2xl font-bold w-8 text-center">{value}</span>
        <Button size="icon" variant="outline" onClick={() => onValueChange(Math.min(2, value + 1))}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function ControlsModal({ isOpen, onOpenChange, room, onSave }: ControlsModalProps) {
  const { toast } = useToast();
  const [tvControls, setTvControls] = useState(room.tv_controls);
  const [acControls, setAcControls] = useState(room.ac_controls);

  useEffect(() => {
    if (isOpen) {
      setTvControls(room.tv_controls);
      setAcControls(room.ac_controls);
    }
  }, [isOpen, room]);

  const handleSave = () => {
    onSave(room.id, tvControls, acControls);
    toast({
      title: 'Controles Actualizados',
      description: `Se han guardado los controles para la habitación ${room.name}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Gestionar Controles - Hab. {room.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <ControlInput
            label="Controles de TV"
            icon={Tv}
            value={tvControls}
            onValueChange={setTvControls}
          />
          <ControlInput
            label="Controles de A/A"
            icon={Wind}
            value={acControls}
            onValueChange={setAcControls}
          />
           <div className="text-sm text-muted-foreground text-center">
            Puede seleccionar un máximo de 2 controles de cada tipo.
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
