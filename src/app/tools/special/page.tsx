'use client';

import Link from 'next/link';

export default function SpecialToolsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary border-b border-border relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div className="container py-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 transition-all duration-150 hover:text-primary hover:-translate-x-1">
            ← Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">Special Tools</span>
          </h1>
          <p className="text-xl text-text-secondary m-0">
            Unique and rare utilities for specific tasks
          </p>
        </div>
      </div>

      <main className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Link href="/tools/special/remove-duplicates" className="group block p-6 bg-bg-secondary border-2 border-border rounded-xl hover:border-primary hover:-translate-y-1 transition-all duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">✂️</div>
              <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary transition-colors">Remove Duplicates</h3>
              <p className="text-text-secondary text-sm">Clean up text lists by removing repeated lines instantly</p>
            </Link>
            <Link href="/tools/special/text-diff" className="group block p-6 bg-bg-secondary border-2 border-border rounded-xl hover:border-primary hover:-translate-y-1 transition-all duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">📝</div>
              <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary transition-colors">Text Diff Checker</h3>
              <p className="text-text-secondary text-sm">Compare two texts and highlight the differences instantly</p>
            </Link>
            <Link href="/tools/special/pdf-compare" className="group block p-6 bg-bg-secondary border-2 border-border rounded-xl hover:border-primary hover:-translate-y-1 transition-all duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">📄</div>
              <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary transition-colors">PDF Compare</h3>
              <p className="text-text-secondary text-sm">Compare text content of two PDF files and highlight differences</p>
            </Link>
          </div>

          <div className="text-center p-12 bg-bg-secondary/50 border-2 border-dashed border-border rounded-2xl max-w-2xl mx-auto">
            <div className="text-6xl mb-6 opacity-50">🚧</div>
            <h2 className="text-2xl font-bold mb-4 text-text-primary">More Coming Soon!</h2>
            <ul className="list-none p-0 text-text-secondary space-y-2 inline-block text-left">
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">Image Merger</li>
              <li className="before:content-['✓'] before:text-primary before:font-bold before:mr-2">Favicon Creator</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
