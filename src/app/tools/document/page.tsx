'use client';

import Link from 'next/link';

const ComingSoonPage = ({ title, description, tools }: { title: string; description: string; tools: string[] }) => (
  <div className="min-h-screen bg-bg-primary">
    <div className="bg-bg-secondary border-b border-border relative">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      <div className="container py-12 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 transition-all duration-150 hover:text-primary hover:-translate-x-1">
          ← Back to Home
        </Link>
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-gradient">{title}</span>
        </h1>
        <p className="text-xl text-text-secondary m-0">{description}</p>
      </div>
    </div>

    <main className="py-16">
      <div className="container">
        <div className="text-center p-16 bg-bg-secondary border-2 border-border rounded-2xl max-w-2xl mx-auto">
          <div className="text-8xl mb-6">🚧</div>
          <h2 className="text-4xl font-bold mb-4 text-text-primary">Coming Soon!</h2>
          <p className="text-text-secondary mb-6 text-lg">These tools are currently under development:</p>
          <ul className="list-none p-0 text-text-secondary space-y-2">
            {tools.map((tool, idx) => (
              <li key={idx} className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  </div>
);

export default function DocumentToolsPage() {
  return <ComingSoonPage
    title="Document Tools"
    description="Convert documents between different formats"
    tools={[
      'DOCX ↔ PDF',
      'DOCX ↔ TXT',
      'PPTX ↔ PDF',
      'XLSX ↔ PDF',
      'Markdown ↔ HTML/PDF'
    ]}
  />;
}
