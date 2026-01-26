'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react";

interface DeleteRoomTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  roomTypeName: string;
}

export default function DeleteRoomTypeDialog({ isOpen, onOpenChange, onConfirm, roomTypeName }: DeleteRoomTypeDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-headline text-xl">
             <AlertTriangle className="h-6 w-6 text-destructive" />
            Confirmar Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-base text-foreground">
            ¿Está seguro que desea eliminar el tipo de habitación <span className="font-bold">{roomTypeName}</span>? 
            <br/><br/>
            Esta acción no se puede deshacer y solo es posible si no hay habitaciones de este tipo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">Confirmar Eliminación</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
