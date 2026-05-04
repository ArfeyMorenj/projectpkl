'use client'

import React from 'react'
import { AuthProvider } from '@/lib/api/hooks/auth-context'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
