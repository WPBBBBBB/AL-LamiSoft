"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/forgot-password";

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <title>AL-LamiSoft | نظام إدارة متكامل</title>
        <meta name="description" content="نظام إدارة احترافي للمبيعات والمشتريات والمخازن" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <ThemeApplier>
              <AuthProvider>
                <ProtectedRoute>
                  {isLoginPage ? (
                    <main className="min-h-screen">
                      {children}
                    </main>
                  ) : (
                    <div className="relative flex min-h-screen">
                      <Sidebar />
                      <div className="flex-1" style={{ marginLeft: "var(--sidebar-width, 288px)" }}>
                        <Header />
                        <main className="container mx-auto p-6">
                          {children}
                        </main>
                      </div>
                    </div>
                  )}
                </ProtectedRoute>
              </AuthProvider>
            </ThemeApplier>
          </SettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
