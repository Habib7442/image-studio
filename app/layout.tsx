import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkErrorBoundary } from '@/components/clerk-error-boundary';
import { ConditionalFooter } from '@/components/conditional-footer';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImageStudioLab - AI Photo Generation",
  description: "Generate stunning AI photos instantly for all platforms. Instagram, YouTube, LinkedIn, and more. No photos stored on servers.",
  keywords: ["AI", "photo generation", "image editing", "artificial intelligence", "social media"],
  authors: [{ name: "ImageStudioLab" }],
  openGraph: {
    title: "ImageStudioLab - AI Photo Generation",
    description: "Generate stunning AI photos instantly for all platforms",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkErrorBoundary>
                   <ClerkProvider
                     appearance={{
                       variables: {
                         colorPrimary: 'hsl(var(--primary))',
                         colorBackground: 'rgba(0, 0, 0, 0.8)',
                         colorText: 'hsl(var(--foreground))',
                         colorTextSecondary: 'hsl(var(--muted-foreground))',
                         colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                         colorInputText: 'hsl(var(--foreground))',
                         borderRadius: '1rem',
                         fontFamily: 'var(--font-inter)',
                       },
                       elements: {
                         rootBox: "backdrop-blur-xl bg-black/20 border border-white/20",
                         card: "backdrop-blur-xl bg-black/30 border border-white/20 shadow-2xl",
                         headerTitle: "text-2xl font-bold font-display text-white",
                         headerSubtitle: "text-muted-foreground",
                         socialButtonsBlockButton: "backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 text-white [&>span]:text-white [&>span]:font-medium",
                         formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm",
                         formFieldInput: "backdrop-blur-sm bg-white/10 border border-white/20 focus:border-primary text-white placeholder:text-gray-300",
                         footerActionLink: "text-primary hover:text-primary/80",
                         formFieldLabel: "text-white",
                         identityPreviewText: "text-white",
                         formHeaderTitle: "text-white",
                         formHeaderSubtitle: "text-gray-300",
                         userButtonPopoverCard: "backdrop-blur-xl bg-black/30 border border-white/20 shadow-2xl",
                         userButtonPopoverActionButton: "text-white hover:bg-white/10 transition-colors",
                         userButtonPopoverActionButtonText: "text-white !text-white font-medium",
                         userButtonPopoverFooter: "text-gray-300",
                         userButtonPopoverActionButtonIcon: "text-white",
                         userButtonPopoverActionButton__signOut: "text-white hover:bg-red-500/20 hover:text-red-400 transition-colors border-t border-white/10 flex items-center gap-2 px-3 py-2 [&>span]:text-white [&>span]:font-medium",
                         userButtonPopoverActionButtonText__signOut: "text-white font-medium !text-white",
                         userButtonPopoverActionButtonIcon__signOut: "text-red-400 w-4 h-4",
                         userButtonPopoverActionButton__manageAccount: "text-white hover:bg-white/10 transition-colors flex items-center gap-2 px-3 py-2 [&>span]:text-white [&>span]:font-medium",
                         userButtonPopoverActionButtonText__manageAccount: "text-white font-medium !text-white",
                         userButtonPopoverActionButtonIcon__manageAccount: "text-white w-4 h-4"
                       }
                     }}
            >
              {children}
              <ConditionalFooter />
            </ClerkProvider>
          </ClerkErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
