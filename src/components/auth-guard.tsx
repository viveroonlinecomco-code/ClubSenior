'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const protectedRoutes = ['/familia', '/dashboard', '/admin'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if current route is protected
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtected) {
      // Check if token exists in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        // No token = redirect to signin
        router.push('/signin');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
