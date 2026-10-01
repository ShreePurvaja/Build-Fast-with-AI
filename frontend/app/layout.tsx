import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workforce Platform - Indic Multi-Agent Builder & Visual Studio',
  description: 'Convert plain-language business needs into a generated team of narrow AI workers speaking Indian languages with MongoDB integration and n8n visual workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const cleanExtAttrs = (root) => {
                  const attrs = ['bis_skin_checked', 'cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
                  attrs.forEach(attr => {
                    const els = (root || document).querySelectorAll('[' + attr + ']');
                    for (let i = 0; i < els.length; i++) els[i].removeAttribute(attr);
                  });
                };
                cleanExtAttrs();
                if (typeof MutationObserver !== 'undefined') {
                  new MutationObserver((mutations) => {
                    for (let m of mutations) {
                      if (m.type === 'attributes' && ['bis_skin_checked', 'cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'].includes(m.attributeName)) {
                        m.target.removeAttribute(m.attributeName);
                      }
                    }
                  }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked', 'cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'] });
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#FAF8F5] text-[#2B2826] antialiased min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
