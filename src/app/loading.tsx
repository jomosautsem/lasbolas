import { AppLogo } from '@/components/motel/app-logo';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="animate-spin">
        <AppLogo className="h-16 w-16 text-primary" />
      </div>
    </div>
  );
}
