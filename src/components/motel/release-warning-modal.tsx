'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react";

interface ReleaseWarningModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ReleaseWarningModal({ isOpen, onOpenChange }: ReleaseWarningModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-headline text-xl">
             <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Controles Pendientes
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-base text-foreground">
            No se puede liberar la habitación porque aún hay controles de TV o A/A registrados. 
            <br/><br/>
            Por favor, recupera los controles y pon los contadores en cero antes de continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
