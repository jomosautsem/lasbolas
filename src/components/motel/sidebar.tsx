'use client';
import Link from 'next/link';
import {
  Home,
  BedDouble,
  Car,
  TrendingUp,
  Settings,
  Receipt,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';

export function AppSidebar({ onAddExpenseClick, activeView, setActiveView }: { onAddExpenseClick: () => void; activeView: string; setActiveView: (view: string) => void; }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Motel las Bolas</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveView('dashboard')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  activeView === 'dashboard' && 'bg-accent text-accent-foreground'
                )}
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                 onClick={() => setActiveView('dashboard')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <BedDouble className="h-5 w-5" />
                <span className="sr-only">Habitaciones</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Habitaciones</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveView('consumption')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  activeView === 'consumption' && 'bg-accent text-accent-foreground'
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Consumo y Productos</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Consumo y Productos</TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAddExpenseClick}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Receipt className="h-5 w-5" />
                <span className="sr-only">Gastos</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Gastos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveView('vehicles')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  activeView === 'vehicles' && 'bg-accent text-accent-foreground'
                )}
              >
                <Car className="h-5 w-5" />
                <span className="sr-only">Vehículos</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Vehículos</TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveView('employees')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  activeView === 'employees' && 'bg-accent text-accent-foreground'
                )}
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Empleados</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Empleados</TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {}}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="sr-only">Reportes</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Reportes</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configuración</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Configuración</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
