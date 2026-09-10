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
    
    console.log('[AUTH-GUARD] Pathname:', pathname, 'Is protected:', isProtected);
    
    if (isProtected) {
      // Check if token exists in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const email = typeof window !== 'undefined' ? localStorage.getItem('auth_email') : null;
      
      console.log('[AUTH-GUARD] Token:', token ? 'EXISTS' : 'MISSING');
      console.log('[AUTH-GUARD] Email:', email || 'MISSING');
      
      if (!token) {
        console.log('[AUTH-GUARD] No token - redirecting to /signin');
        // No token = redirect to signin
        router.push('/signin');
      } else {
        console.log('[AUTH-GUARD] Token valid - allowing access');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
