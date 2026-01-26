import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  borderColor?: string;
}

export default function KPICard({ title, amount, description, icon: Icon, color, borderColor }: KPICardProps) {
  return (
    <Card className={cn("rounded-2xl shadow-lg border-l-4", borderColor || 'border-primary')}>
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
