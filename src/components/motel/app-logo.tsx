'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Logo as SvgLogo } from '@/components/icons';
import { supabase } from '@/lib/supabaseClient';
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
const LOGO_PATH = 'logo.png';
const BUCKET_NAME = 'motel-assets';
export function AppLogo(props: SVGProps<SVGSVGElement> & { className?: string }) {
  const [url, setUrl] = useState('');
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(LOGO_PATH);
    if (data.publicUrl) {
      setUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
    } else {
      setFallback(true);
    }
  }, []);
  if (fallback || !url) {
    return <SvgLogo {...props} />;
  }
  return (
    <Image
      src={url}
      alt="Motel Logo"
      width={Number(props.width) || 40}
      height={Number(props.height) || 40}
      className={cn('rounded-sm object-contain', props.className)}
      onError={() => setFallback(true)}
      unoptimized
    />
  );
}
