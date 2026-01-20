export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <div className="prose prose-rose max-w-none text-gray-600">
          <p className="mb-4">Last updated: January 19, 2026</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h2>
          <p className="mb-4">
            This Cookie Policy explains how <strong>ZEXOR DIGITAL, LLC</strong> ("Company," "we," "us," or "our"), uses cookies and similar tracking technologies when you visit our websites, use our web applications, or interact with our digital services (collectively, the "Services").
          </p>
          <p className="mb-4">
            This policy should be read alongside our <a href="/privacy-policy" className="text-rose-600 hover:underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-rose-600 hover:underline">Terms of Service</a>, which provide additional details about how we collect, use, and protect your information.
          </p>
          <p className="mb-4">
            By continuing to use our Services, you consent to our use of cookies as described in this policy. You can control and manage cookies through your browser settings or by using our cookie preference center.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies?</h2>
          <p className="mb-4">
            <strong>Cookies</strong> are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They contain information that is transferred to your device's hard drive and allow a website to remember information about your visit.
          </p>
          <p className="mb-4"><strong>Similar Technologies</strong> we use include:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Local Storage:</strong> Data stored locally in your browser that persists between sessions</li>
            <li><strong>Session Storage:</strong> Temporary data storage that is cleared when you close your browser</li>
            <li><strong>Web Beacons/Pixels:</strong> Small transparent images that track user activity</li>
            <li><strong>Server Logs:</strong> Files that record requests made to our servers</li>
            <li><strong>Fingerprinting:</strong> Techniques that collect information about your device configuration</li>
          </ul>
          <p className="mb-4">
            These technologies help us provide you with a better user experience, understand how our Services are used, and improve our platform's functionality and security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
          <p className="mb-4">We categorize our cookies based on their purpose and duration:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">By Purpose:</h3>
          
          <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">1. Strictly Necessary Cookies (Cannot be disabled)</h4>
          <p className="mb-2">These cookies are essential for our Services to function properly and cannot be switched off. They enable core functionality such as:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>User authentication and session management</li>
            <li>Security and fraud prevention</li>
            <li>Load balancing and system stability</li>
            <li>Remembering your privacy preferences</li>
            <li>CSRF (Cross-Site Request Forgery) protection</li>
          </ul>

          <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2. Functional Cookies (Optional)</h4>
          <p className="mb-2">These cookies enhance your user experience by:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Remembering your preferences (language, timezone, display settings)</li>
            <li>Storing form data temporarily</li>
            <li>Enabling personalized features</li>
            <li>Remembering your dashboard customizations</li>
            <li>Maintaining your theme preferences (dark/light mode)</li>
          </ul>

          <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">3. Analytics and Performance Cookies (Optional)</h4>
          <p className="mb-2">These cookies help us understand how visitors use our Services:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Collecting usage statistics and performance metrics</li>
            <li>Identifying popular features and content</li>
            <li>Tracking user journey and navigation patterns</li>
            <li>Measuring page load times and error rates</li>
            <li>Generating reports for service improvement</li>
          </ul>

          <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">4. Marketing and Advertising Cookies (Optional)</h4>
          <p className="mb-2">We use limited marketing cookies to:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Measure the effectiveness of our marketing campaigns</li>
            <li>Provide relevant content recommendations</li>
            <li>Track conversion rates from promotional activities</li>
            <li>Enable social media integration features</li>
          </ul>
          <p className="mb-4 italic">Note: We do not use cookies for behavioral advertising or share data with third-party advertisers.</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">By Duration:</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Specific Cookies We Use</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">First-Party Cookies (Set by ZEXOR DIGITAL):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-session</td>
                  <td className="px-6 py-4 text-sm text-gray-500">User authentication and session management</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Strictly Necessary</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Session</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-csrf</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Security protection against cross-site request forgery</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Strictly Necessary</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Session</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-preferences</td>
                  <td className="px-6 py-4 text-sm text-gray-500">User interface preferences and settings</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Functional</td>
                  <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-timezone</td>
                  <td className="px-6 py-4 text-sm text-gray-500">User's timezone setting for accurate time displays</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Functional</td>
                  <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-theme</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Dark/light mode preference</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Functional</td>
                  <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-analytics</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Usage analytics and performance monitoring</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Analytics</td>
                  <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">zd-consent</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Cookie consent preferences</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Strictly Necessary</td>
                  <td className="px-6 py-4 text-sm text-gray-500">12 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Third-Party Cookies:</h3>
          <p className="mb-2"><strong>Google Analytics (Optional)</strong></p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Purpose: Website analytics and user behavior tracking</li>
            <li>Data collected: Page views, session duration, user interactions</li>
            <li>Privacy Policy: Google Analytics Privacy</li>
          </ul>

          <p className="mb-2"><strong>Vercel Analytics (Optional)</strong></p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Purpose: Performance monitoring and error tracking</li>
            <li>Data collected: Page performance, error logs, basic usage metrics</li>
            <li>Privacy Policy: Vercel Privacy Policy</li>
          </ul>
          <p className="mb-4 italic">Note: Third-party cookies are subject to the respective third party's privacy policy and cookie practices.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cookie Consent and Management</h2>
          <p className="mb-4"><strong>Your Consent Choices:</strong></p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Granular Control:</strong> We provide you with granular control over cookie categories through our cookie preference center, which you can access at any time.</li>
            <li><strong>Consent Withdrawal:</strong> You can withdraw your consent for optional cookies at any time without affecting the lawfulness of processing based on consent before its withdrawal.</li>
            <li><strong>Implied Consent:</strong> By continuing to use our Services after being informed about cookies, you provide implied consent for strictly necessary cookies.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Impact of Disabling Cookies</h2>
          <p className="mb-4">Disabling certain cookies may affect your experience with our Services:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Strictly Necessary Cookies:</strong> Cannot be disabled as they are essential. Disabling would prevent you from logging in.</li>
            <li><strong>Functional Cookies:</strong> You may lose personalized settings and preferences.</li>
            <li><strong>Analytics Cookies:</strong> Your usage won't contribute to our service improvement efforts.</li>
            <li><strong>Marketing Cookies:</strong> You may see less relevant content recommendations.</li>
          </ul>
          <p className="mb-4">
            <strong>Recommendation:</strong> We recommend keeping functional and analytics cookies enabled for the best user experience while respecting your privacy preferences.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our Services are not directed to children under 16 years of age. We comply with COPPA and do not knowingly use cookies to collect information from children under 13.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Updates to This Cookie Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. The "Last Updated" date at the top indicates when this policy was last revised. Continued use of our Services after changes become effective constitutes acceptance of the updated Cookie Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us About Cookies</h2>
          <p className="mb-4">If you have questions about this Cookie Policy, please contact us:</p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="mb-2"><strong>Email:</strong> contact@zexordigital.com</p>
            <p className="mb-2"><strong>Address:</strong> ZEXOR DIGITAL, LLC, 1111B S Governors Ave STE 39570, Dover, DE 19904, United States</p>
            <p className="mb-0"><strong>Phone:</strong> +1 (302) 621-8335</p>
          </div>

          <p className="mt-8">
            <a href="/" className="text-rose-600 font-medium hover:underline">&larr; Back to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}