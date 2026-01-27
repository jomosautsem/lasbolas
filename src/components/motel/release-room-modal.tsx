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
import { LogOut } from "lucide-react";

interface ReleaseRoomModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  roomName: string;
}

export default function ReleaseRoomModal({ isOpen, onOpenChange, onConfirm, roomName }: ReleaseRoomModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-headline text-xl">
             <LogOut className="h-6 w-6 text-primary" />
            Confirmar Liberación
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-base text-foreground">
            ¿Está seguro que desea liberar la habitación <span className="font-bold">{roomName}</span> y pasarla a limpieza? 
            <br/><br/>
            Asegúrese de que el cliente haya pagado la cuenta y entregado los controles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar y Liberar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
