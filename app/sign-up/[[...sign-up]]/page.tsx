import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="ImageStudioLab Logo" 
                width={48} 
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold">ImageStudioLab</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered content creation for all platforms
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
                 <SignUp
                   appearance={{
                     elements: {
                       rootBox: "mx-auto backdrop-blur-xl bg-black/20 border border-white/20 rounded-2xl",
                       card: "backdrop-blur-xl bg-black/30 border border-white/20 shadow-2xl rounded-2xl",
                       headerTitle: "text-2xl font-bold text-center text-white",
                       headerSubtitle: "text-center text-gray-300",
                       socialButtonsBlockButton: "backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 text-white rounded-xl [&>span]:text-white [&>span]:font-medium",
                       footerActionLink: "text-primary hover:text-primary/80",
                       formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm rounded-xl",
                       formFieldInput: "backdrop-blur-sm bg-white/10 border border-white/20 focus:border-primary text-white placeholder:text-gray-300 rounded-xl",
                       identityPreviewText: "text-sm text-white",
                       formHeaderTitle: "text-xl font-semibold text-white",
                       formHeaderSubtitle: "text-sm text-gray-300",
                       captchaWidget: "mx-auto my-4",
                       captchaWidgetContainer: "flex justify-center",
                       formFieldLabel: "text-white",
                       formFieldErrorText: "text-red-400"
                     }
                   }}
            fallbackRedirectUrl="/dashboard"
            signInFallbackRedirectUrl="/dashboard"
          />
        </div>

        {/* Additional info */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Privacy-first • Fast generation • No storage</p>
        </div>
      </div>
    </div>
  )
}
