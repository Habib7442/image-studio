import Image from 'next/image'
import { Shield, Download, Trash2, Eye, Lock, User, Mail, Phone, Globe } from 'lucide-react'

export default function GDPRCompliancePage() {
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
              <h1 className="text-4xl font-bold font-display">GDPR Compliance</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your data protection rights under the General Data Protection Regulation (GDPR).
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* GDPR Overview */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Data Protection</h3>
              <p className="text-sm text-muted-foreground">
                We protect your personal data with industry-standard security measures.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <User className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Your Rights</h3>
              <p className="text-sm text-muted-foreground">
                You have full control over your personal data and can exercise your rights at any time.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 border-2 rounded-lg">
              <Lock className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold">Transparency</h3>
              <p className="text-sm text-muted-foreground">
                We are transparent about how we collect, use, and protect your data.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">What is GDPR?</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The General Data Protection Regulation (GDPR) is a comprehensive data protection law that gives you control over your personal data. It applies to all organizations that process personal data of EU residents, regardless of where the organization is located.
                </p>
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    ImageStudioLab is committed to GDPR compliance and protecting your privacy rights. This page explains your rights and how we handle your personal data.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Your GDPR Rights</h2>
              
              <div className="space-y-6">
                {/* Right to Access */}
                <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">Right to Access</h3>
                      <p className="text-sm text-blue-700">You have the right to know what personal data we have about you</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You can request a copy of all personal data we hold about you, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Account information (email, profile details)</li>
                      <li>Usage data (generation history, credit usage)</li>
                      <li>Images you've uploaded (if still stored)</li>
                      <li>Communication records</li>
                    </ul>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>How to request:</strong> Contact us at business@imagestudiolab.com with &quot;Data Access Request&quot; in the subject line. We will respond within 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right to Rectification */}
                <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">Right to Rectification</h3>
                      <p className="text-sm text-green-700">You can correct inaccurate or incomplete personal data</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You can update your personal information at any time through your account settings or by contacting us.
                    </p>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>How to update:</strong> Log into your account and go to Settings, or email us at business@imagestudiolab.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right to Erasure */}
                <div className="p-6 border-2 border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800">Right to Erasure (Right to be Forgotten)</h3>
                      <p className="text-sm text-red-700">You can request deletion of your personal data</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You can request deletion of your personal data in certain circumstances, such as when:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>The data is no longer necessary for the original purpose</li>
                      <li>You withdraw your consent</li>
                      <li>The data has been unlawfully processed</li>
                      <li>You object to processing and there are no overriding legitimate grounds</li>
                    </ul>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>How to request:</strong> Contact us at business@imagestudiolab.com with "Data Deletion Request" in the subject line. We will respond within 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right to Data Portability */}
                <div className="p-6 border-2 border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Download className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-800">Right to Data Portability</h3>
                      <p className="text-sm text-purple-700">You can receive your data in a machine-readable format</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.
                    </p>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Format:</strong> We will provide your data in JSON format. Contact us at business@imagestudiolab.com to request your data export.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right to Object */}
                <div className="p-6 border-2 border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-800">Right to Object</h3>
                      <p className="text-sm text-orange-700">You can object to certain types of data processing</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You have the right to object to processing of your personal data for direct marketing purposes or for processing based on legitimate interests.
                    </p>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>How to object:</strong> Contact us at business@imagestudiolab.com with &quot;Processing Objection&quot; in the subject line.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Lawful Basis for Processing</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Under GDPR, we must have a lawful basis for processing your personal data. Here are the bases we rely on:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Consent</h3>
                    <p className="text-sm text-muted-foreground">
                      You have given clear consent for us to process your personal data for specific purposes, such as providing our AI image generation service.
                    </p>
                  </div>
                  
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Contract</h3>
                    <p className="text-sm text-muted-foreground">
                      Processing is necessary for the performance of a contract with you, such as providing the services you have requested.
                    </p>
                  </div>
                  
                  <div className="p-4 border-2 rounded-lg">
                    <h3 className="font-semibold mb-2">Legitimate Interests</h3>
                    <p className="text-sm text-muted-foreground">
                      Processing is necessary for our legitimate interests, such as improving our service, preventing fraud, and ensuring security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Data Retention</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We retain your personal data only for as long as necessary to fulfill the purposes outlined in our Privacy Policy:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Account Data</h3>
                      <p className="text-sm text-muted-foreground">Retained until you delete your account or request deletion</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Usage Data</h3>
                      <p className="text-sm text-muted-foreground">Retained for up to 2 years for service improvement purposes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Generated Images</h3>
                      <p className="text-sm text-muted-foreground">Temporarily stored for up to 1 hour, then automatically deleted. You can delete them manually at any time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Data Protection Officer</h2>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about our GDPR compliance or wish to exercise your rights, you can contact our Data Protection Officer:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">business@imagestudiolab.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm">https://imagestudiolab.com</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Supervisory Authority</h2>
              <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Right to Lodge a Complaint</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  If you believe we have not handled your personal data in accordance with GDPR, you have the right to lodge a complaint with your local supervisory authority.
                </p>
                <p className="text-xs text-yellow-600">
                  <strong>EU Residents:</strong> Find your local supervisory authority at <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="underline" target="_blank" rel="noopener noreferrer">https://edpb.europa.eu</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-display">Updates to This Information</h2>
              <p className="text-sm text-muted-foreground">
                We may update this GDPR compliance information from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated information on this page and updating the "Last updated" date.
              </p>
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
