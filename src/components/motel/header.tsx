'use client';

import Link from 'next/link';
import {
  Home,
  BedDouble,
  Package,
  Car,
  TrendingUp,
  Settings,
  PanelLeft,
  Search,
  User,
  Clock,
  Sun,
  Moon,
  Sunset,
  Receipt,
  BotMessageSquare,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getCurrentShiftInfo, formatToMexicanDate, type ShiftInfo } from '@/lib/datetime';
import { Logo } from '../icons';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ShiftIcon = ({ shift }: { shift: 'Matutino' | 'Vespertino' | 'Nocturno' }) => {
  switch (shift) {
    case 'Matutino':
      return <Sun className="h-4 w-4" />;
    case 'Vespertino':
      return <Sunset className="h-4 w-4" />;
    case 'Nocturno':
      return <Moon className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function AppHeader({ onAddExpenseClick, setActiveView }: { onAddExpenseClick: () => void; setActiveView: (view: string) => void; }) {
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setShiftInfo(getCurrentShiftInfo());
    const timer = setInterval(() => {
      setShiftInfo(getCurrentShiftInfo());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleMenuClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };
  
  const handleGastosClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    onAddExpenseClick();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Motel las Bolas</span>
            </Link>
            <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              Dashboard
            </button>
            <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <BedDouble className="h-5 w-5" />
              Habitaciones
            </button>
            <button onClick={() => {}} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Package className="h-5 w-5" />
              Inventario
            </button>
             <a href="#" onClick={handleGastosClick} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Receipt className="h-5 w-5" />
              Gastos
            </a>
            <button onClick={() => handleMenuClick('vehicles')} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Car className="h-5 w-5" />
              Vehículos
            </button>
            <button onClick={() => {}} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <TrendingUp className="h-5 w-5" />
              Reportes
            </button>
            <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
         <h1 className="text-xl font-semibold md:text-2xl font-headline">Dashboard</h1>
         {shiftInfo ? (
           <Badge variant="outline" className="flex items-center gap-2">
              <ShiftIcon shift={shiftInfo.shift} />
              Turno {shiftInfo.shift} - {formatToMexicanDate(shiftInfo.operationalDate)}
           </Badge>
         ) : (
            <Skeleton className="h-7 w-56 rounded-md" />
         )}
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar habitación, placa..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <User/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
