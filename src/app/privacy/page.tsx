import { ShieldCheck, Eye, Server, Cookie, Mail } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "May 24, 2026";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          {/* TL;DR */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="mb-3 text-lg font-semibold text-emerald-400">
              TL;DR
            </h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                Your files and data never leave your browser
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                We don&apos;t have servers that process your content
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                We use Google AdSense for ads (they set cookies)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                We use basic analytics to understand traffic (no personal data)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                No sign-ups, no accounts, no personal data collection
              </li>
            </ul>
          </div>

          {/* Section 1 */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-slate-100">
                1. How DevToolBox Works
              </h2>
            </div>
            <p>
              DevToolBox is a collection of browser-based developer tools. All
              processing happens entirely on your device using JavaScript. When
              you format JSON, compare text, compress images, or manipulate
              PDFs, that work is done in your browser. We do not send your data
              to any server.
            </p>
            <p className="mt-3">
              We do not have backend servers that process user content. There
              are no APIs that receive your files or text. Your data stays on
              your machine.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-slate-100">
                2. Information We Collect
              </h2>
            </div>
            <p className="font-medium text-slate-200">
              We do NOT collect:
            </p>
            <ul className="mt-2 space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Personal information (name, email, phone)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Files you process (PDFs, images, text)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Content you paste or type into tools
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Account credentials (we have no accounts)
              </li>
            </ul>
            <p className="mt-4 font-medium text-slate-200">
              We may collect (via third-party services):
            </p>
            <ul className="mt-2 space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Anonymous page view analytics (which tools are popular, general
                traffic patterns)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                General geographic region (country-level, via analytics)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                Device type and browser (for compatibility purposes)
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-slate-100">
                3. Cookies &amp; Advertising
              </h2>
            </div>
            <p>
              DevToolBox itself does not set cookies. However, we use{" "}
              <strong className="text-slate-200">Google AdSense</strong> to
              display advertisements. Google may use cookies to serve ads based
              on your prior visits to this or other websites. These cookies
              allow Google to display relevant ads to you.
            </p>
            <p className="mt-3">
              You can opt out of personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline decoration-blue-400/30 hover:decoration-blue-400"
              >
                Google Ads Settings
              </a>
              . You can also visit{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline decoration-blue-400/30 hover:decoration-blue-400"
              >
                aboutads.info
              </a>{" "}
              to opt out of third-party cookies for advertising purposes.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">
              4. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-800/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-800/20">
                    <th className="px-4 py-3 text-left font-medium text-slate-400">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-3 text-slate-200">Google AdSense</td>
                    <td className="px-4 py-3">Display ads</td>
                    <td className="px-4 py-3">Cookies for ad personalization</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-200">
                      Vercel Analytics
                    </td>
                    <td className="px-4 py-3">Traffic analytics</td>
                    <td className="px-4 py-3">
                      Anonymous page views, no personal data
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-200">Vercel</td>
                    <td className="px-4 py-3">Hosting</td>
                    <td className="px-4 py-3">
                      Standard web server logs (IP, user agent)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">
              5. Data Retention
            </h2>
            <p>
              Since we don&apos;t collect personal data, there is nothing to
              retain or delete. Any data you enter into our tools exists only
              in your browser&apos;s memory and is gone when you close or
              refresh the tab.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">
              6. Children&apos;s Privacy
            </h2>
            <p>
              DevToolBox is a general-purpose developer tool and does not
              knowingly collect any personal information from children under 13.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Changes will
              be posted on this page with an updated revision date.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-100">
                8. Contact
              </h2>
            </div>
            <p>
              If you have questions about this privacy policy, you can reach us
              by opening an issue on our{" "}
              <a
                href="https://github.com/YOUR_USERNAME/devtoolbox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline decoration-blue-400/30 hover:decoration-blue-400"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
