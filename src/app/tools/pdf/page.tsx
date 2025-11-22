'use client';

import Link from 'next/link';

export default function PDFToolsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary border-b border-border relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div className="container py-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 transition-all duration-150 hover:text-primary hover:-translate-x-1">
            ← Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">PDF Tools</span>
          </h1>
          <p className="text-xl text-text-secondary m-0">
            Merge, split, compress, and convert PDF files
          </p>
        </div>
      </div>

      <main className="py-16">
        <div className="container">
          <div className="text-center p-16 bg-bg-secondary border-2 border-border rounded-2xl max-w-2xl mx-auto">
            <div className="text-8xl mb-6">🚧</div>
            <h2 className="text-4xl font-bold mb-4 text-text-primary">Coming Soon!</h2>
            <p className="text-text-secondary mb-6 text-lg">PDF tools are currently under development. Check back soon for:</p>
            <ul className="list-none p-0 text-text-secondary space-y-2">
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">PDF Merger</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">PDF Splitter</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">PDF Compressor</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">PDF to Word / Word to PDF</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">Image to PDF / PDF to Image</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">And more...</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
