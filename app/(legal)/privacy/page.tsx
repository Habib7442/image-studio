import Image from 'next/image'
import { Shield, Eye, Lock, Database, Clock, User } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="ImageStudioLab Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold font-display">Privacy Policy</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Privacy Principles */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Secure Processing</h3>
              <p className="text-sm text-muted-foreground">
                Your images are processed securely and never stored permanently on our servers.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Eye className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Transparent</h3>
              <p className="text-sm text-muted-foreground">
                We clearly explain what data we collect and how we use it.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Lock className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Minimal Data</h3>
              <p className="text-sm text-muted-foreground">
                We only collect the minimum data necessary to provide our services.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">1. Information We Collect</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Account Information</h3>
                  <p className="text-sm text-muted-foreground">
                    When you sign up, we collect your email address and basic profile information through Clerk authentication.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Usage Data</h3>
                  <p className="text-sm text-muted-foreground">
                    We track your credit usage, generation history, and feature usage to provide our services.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Images you upload are processed by our AI services but are not permanently stored on our servers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">2. How We Use Your Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Service Provision</h3>
                    <p className="text-sm text-muted-foreground">
                      To generate AI images, manage your credits, and provide customer support.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Service Improvement</h3>
                    <p className="text-sm text-muted-foreground">
                      To analyze usage patterns and improve our AI models and user experience.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      To send important updates about our service and respond to your inquiries.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">3. Data Security</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted in transit and at rest using industry-standard encryption protocols.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Access Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to your data is restricted to authorized personnel only and is logged for security purposes.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Regular Audits</h3>
                  <p className="text-sm text-muted-foreground">
                    We regularly audit our security practices and update them as needed.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">4. Third-Party Services</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Clerk Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Clerk for user authentication. Their privacy policy applies to authentication data.
                  </p>
                </div>
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Google Gemini AI</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Google&apos;s Gemini AI for image generation. Images are processed by Google&apos;s servers but not stored.
                  </p>
                </div>
                <div className="p-4 border-2 rounded-lg">
                  <h3 className="font-semibold mb-2">Supabase Database</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Supabase for data storage. They provide enterprise-grade security and compliance.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">5. Your Rights</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Access Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      You can request a copy of all data we have about you.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Update Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      You can update your profile information at any time through your account settings.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Delete Your Account</h3>
                    <p className="text-sm text-muted-foreground">
                      You can delete your account and all associated data at any time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Data Portability</h3>
                    <p className="text-sm text-muted-foreground">
                      You can export your data in a machine-readable format.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">6. Cookies and Tracking</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We use essential cookies to provide our service functionality. We do not use tracking cookies or third-party analytics that collect personal information.
                </p>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function and cannot be switched off. They include authentication cookies and session management.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">7. Children&apos;s Privacy</h2>
              <p className="text-sm text-muted-foreground">
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">8. Changes to This Policy</h2>
              <p className="text-sm text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">9. Contact Us</h2>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about this privacy policy or our data practices, please contact us:
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
