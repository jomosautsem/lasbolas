import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  borderColor?: string;
  isGradient?: boolean;
}

export default function KPICard({ title, amount, description, icon: Icon, color, borderColor, isGradient = false }: KPICardProps) {
  if (isGradient) {
    return (
      <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden relative h-full">
        <div className="p-6 flex flex-col justify-between h-full z-10">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
             <p className="text-xs opacity-80 pt-1">
              {description}
            </p>
          </div>
          <div className="text-3xl font-bold font-headline mt-4">{amount}</div>
        </div>
        <Icon strokeWidth={1.5} className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10 z-0" />
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-2xl shadow-lg border-l-4 h-full", borderColor || 'border-primary')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">{amount}</div>
        <p className="text-xs text-muted-foreground pt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
