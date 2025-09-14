import Image from 'next/image'
import { Cookie, Settings, Shield, Eye, Database, Clock } from 'lucide-react'

export default function CookiePolicyPage() {
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
              <h1 className="text-4xl font-bold font-display">Cookie Policy</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about how we use cookies and similar technologies to provide our service.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Cookie Overview */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Cookie className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Essential Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Required for basic website functionality and cannot be disabled.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Settings className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Functional Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Remember your preferences and improve your experience.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">No Tracking</h3>
              <p className="text-sm text-muted-foreground">
                We don't use tracking cookies or third-party analytics.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">What Are Cookies?</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings.
                </p>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    ImageStudioLab uses cookies to provide essential functionality and improve your user experience. We do not use cookies for tracking or advertising purposes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">Essential Cookies</h3>
                      <p className="text-sm text-green-700">Required for basic website functionality</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2">Authentication Cookies</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies are necessary for user authentication and session management.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Purpose:</strong> Keep you logged in and maintain your session<br/>
                        <strong>Duration:</strong> Session-based (deleted when you close your browser)<br/>
                        <strong>Can be disabled:</strong> No (required for service functionality)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2">Security Cookies</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies help protect against security threats and ensure safe browsing.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Purpose:</strong> CSRF protection and security validation<br/>
                        <strong>Duration:</strong> Session-based<br/>
                        <strong>Can be disabled:</strong> No (required for security)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">Functional Cookies</h3>
                      <p className="text-sm text-blue-700">Improve your experience and remember preferences</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2">Preference Cookies</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Remember your settings and preferences for a better user experience.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Purpose:</strong> Remember theme preferences, language settings<br/>
                        <strong>Duration:</strong> 30 days<br/>
                        <strong>Can be disabled:</strong> Yes (but may affect functionality)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2">Credit Tracking</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Track your daily credit usage and reset times.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Purpose:</strong> Manage daily credit limits and reset times<br/>
                        <strong>Duration:</strong> 24 hours<br/>
                        <strong>Can be disabled:</strong> No (required for credit system)
                      </div>
                    </div>
                  </div>
                </div>

                {/* No Tracking Cookies */}
                <div className="p-6 border-2 border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-800">What We DON'T Use</h3>
                      <p className="text-sm text-purple-700">We respect your privacy and don't track you</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">✗</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Analytics cookies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">✗</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Advertising cookies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">✗</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Social media cookies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">✗</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Third-party tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">How We Use Cookies</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 border-2 rounded-lg">
                    <Database className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Service Functionality</h3>
                    <p className="text-sm text-muted-foreground">
                      Essential cookies enable core features like user authentication, credit management, and image generation.
                    </p>
                  </div>
                  <div className="p-4 border-2 rounded-lg">
                    <Clock className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">User Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Functional cookies remember your preferences and settings to provide a personalized experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Managing Cookies</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You can control cookies through your browser settings. However, disabling essential cookies may affect the functionality of our service.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</p>
                    <p><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</p>
                    <p><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</p>
                    <p><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                  <h3 className="font-semibold mb-2">Important Note</h3>
                  <p className="text-sm text-yellow-700">
                    Disabling essential cookies will prevent you from using ImageStudioLab. We only use cookies that are necessary for our service to function properly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Third-Party Services</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ImageStudioLab uses the following third-party services that may set their own cookies:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Clerk Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We use Clerk for user authentication. Clerk may set cookies for authentication purposes.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Policy:</strong> <a href="https://clerk.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://clerk.com/privacy</a>
                    </p>
                  </div>
                  
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Supabase</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We use Supabase for data storage and management. Supabase may set cookies for session management.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a>
                    </p>
                  </div>
                  
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Google Gemini AI</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We use Google's Gemini AI for image generation. Google may set cookies for API functionality.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Updates to This Policy</h2>
              <p className="text-sm text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Contact Us</h2>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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
