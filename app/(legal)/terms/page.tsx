import Image from 'next/image'
import { FileText, AlertTriangle, Shield, Users, CreditCard, Ban } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="w-full px-2 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold font-display">ImageStudioLab</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 lg:max-w-4xl lg:mx-auto py-12">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="ImageStudioLab Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold font-display">Terms of Service</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using ImageStudioLab. By using our service, you agree to these terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Important Notice */}
          <div className="p-6 border-2 border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-bold text-orange-800 mb-2">Important Notice</h3>
                <p className="text-sm text-orange-700">
                  By using ImageStudioLab, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">1. Acceptance of Terms</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These Terms of Service (&quot;Terms&quot;) govern your use of ImageStudioLab ("Service") operated by ImageStudioLab ("us", "we", or "our"). By accessing or using our Service, you agree to be bound by these Terms.
                </p>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    If you disagree with any part of these terms, then you may not access the Service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">2. Description of Service</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ImageStudioLab is an AI-powered image generation platform that provides:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 rounded-lg text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">AI Photoshoot</h3>
                    <p className="text-xs text-muted-foreground">Personalized AI-generated photos</p>
                  </div>
                  <div className="p-4 border-2 rounded-lg text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">CineShot AI</h3>
                    <p className="text-xs text-muted-foreground">Cinematic world placement</p>
                  </div>
                  <div className="p-4 border-2 rounded-lg text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Gaming Photoshoot</h3>
                    <p className="text-xs text-muted-foreground">Gaming character transformation</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">3. User Accounts</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Account Creation</h3>
                  <p className="text-sm text-muted-foreground">
                    You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Account Security</h3>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Account Termination</h3>
                  <p className="text-sm text-muted-foreground">
                    We reserve the right to terminate accounts that violate these terms or engage in prohibited activities.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">4. Credit System</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Daily Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    Users receive daily credits that reset every 24 hours. Credits are consumed when generating images.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Credit Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Logged-in users: 5 credits daily. All users get the same credit allocation.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">No Refunds</h3>
                  <p className="text-sm text-muted-foreground">
                    Credits cannot be refunded or transferred. Unused credits expire at the end of each day.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">5. Acceptable Use & Content Guidelines</h2>
              
              {/* Critical Warning */}
              <div className="p-6 border-2 border-red-200 bg-red-50 rounded-lg mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">⚠️ CRITICAL: Responsible Use Required</h3>
                    <p className="text-sm text-red-700 mb-3">
                      ImageStudioLab is designed for creative, positive content generation. We have zero tolerance for misuse. 
                      Violation of these guidelines will result in immediate account termination.
                    </p>
                    <div className="bg-red-100 p-3 rounded border-l-4 border-red-400">
                      <p className="text-sm font-semibold text-red-800">
                        🚫 DO NOT USE THIS SERVICE FOR:
                      </p>
                      <ul className="text-xs text-red-700 mt-2 space-y-1">
                        <li>• Generating inappropriate, explicit, or adult content</li>
                        <li>• Creating misleading, deceptive, or fraudulent images</li>
                        <li>• Impersonating real people without consent</li>
                        <li>• Generating hate speech, violence, or harmful content</li>
                        <li>• Creating deepfakes or non-consensual intimate images</li>
                        <li>• Any illegal activities or content that violates laws</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">✅ Appropriate Uses:</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-green-600">✓</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Personal creative projects and artistic expression</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-green-600">✓</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Professional content for social media, marketing, and business</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-green-600">✓</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Educational and entertainment purposes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-green-600">✓</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Creating content with your own likeness or with proper consent</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6">🚫 Prohibited Activities:</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Generate illegal, harmful, inappropriate, or explicit content</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Create misleading, deceptive, or fraudulent images</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Impersonate real people without their explicit consent</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Generate hate speech, violence, or discriminatory content</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Create deepfakes or non-consensual intimate images</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Attempt to reverse engineer or hack our systems</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Use automated tools to abuse the service</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <Ban className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Generate content that violates intellectual property rights</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg mt-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚖️ Enforcement Policy</h3>
                  <p className="text-sm text-yellow-700">
                    We actively monitor usage and reserve the right to immediately terminate accounts that violate these guidelines. 
                    We may also report illegal activities to appropriate authorities. By using our service, you agree to use it responsibly and legally.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">6. Intellectual Property</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Your Content</h3>
                  <p className="text-sm text-muted-foreground">
                    You retain ownership of images you upload. You grant us a license to process these images for the purpose of providing our service.
                  </p>
                </div>
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Generated Images</h3>
                  <p className="text-sm text-muted-foreground">
                    You own the rights to images generated using our service. You may use them for personal and commercial purposes.
                  </p>
                </div>
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Our Service</h3>
                  <p className="text-sm text-muted-foreground">
                    ImageStudioLab and its technology are protected by intellectual property laws. You may not copy or distribute our service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">7. Privacy and Data</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                </p>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Data Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Images are processed by third-party AI services (Google Gemini) but are not permanently stored on our servers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">8. Service Availability</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                  <h3 className="font-semibold mb-2">No Guarantees</h3>
                  <p className="text-sm text-muted-foreground">
                    We strive to provide reliable service but cannot guarantee 100% uptime. The service is provided "as is" without warranties.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                  <h3 className="font-semibold mb-2">Maintenance</h3>
                  <p className="text-sm text-muted-foreground">
                    We may perform maintenance that temporarily interrupts service. We will provide notice when possible.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">9. Limitation of Liability</h2>
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Important Legal Notice</h3>
                <p className="text-sm text-red-700">
                  To the maximum extent permitted by law, ImageStudioLab shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">10. Termination</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">By You</h3>
                  <p className="text-sm text-muted-foreground">
                    You may stop using our service at any time. You can delete your account through your account settings.
                  </p>
                </div>
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">By Us</h3>
                  <p className="text-sm text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">11. Changes to Terms</h2>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">12. Governing Law</h2>
              <p className="text-sm text-muted-foreground">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which ImageStudioLab operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">13. Contact Information</h2>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Email:</strong> business@imagestudiolab.com
                  </p>
                  <p className="text-sm">
                    <strong>Website:</strong> https://imagestudiolab.com
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 lg:max-w-7xl lg:mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold font-display">ImageStudioLab</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2025 ImageStudioLab. All rights reserved. Powered by Gemini 2.5 Flash.
          </p>
        </div>
      </footer>
    </div>
  )
}
