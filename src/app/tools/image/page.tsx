'use client';

import Link from 'next/link';

const imageTools = [
  {
    name: 'Image Merger',
    description: 'Merge multiple images into a grid, vertical, or horizontal layout',
    href: '/tools/image/merger',
    icon: '🖼️',
  },
  {
    name: 'Favicon Creator',
    description: 'Generate a complete favicon kit from a single image',
    href: '/tools/image/favicon-generator',
    icon: '💎',
  },
];

export default function ImageToolsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

        <div className="container py-12 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 transition-all duration-fast hover:text-primary hover:-translate-x-1"
          >
            ← Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">Image Tools</span>
          </h1>
          <p className="text-xl text-text-secondary m-0">
            Edit, convert, and optimize images
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <main className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageTools.map((tool) => (
              <Link
                href={tool.href}
                key={tool.href}
                className="group relative bg-bg-secondary border-2 border-border rounded-lg p-8 transition-all duration-base hover:-translate-y-2 hover:border-primary hover:shadow-lg cursor-pointer overflow-hidden block"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-base" />

                <div className="relative z-10">
                  <div className="text-5xl mb-4 inline-block transition-transform duration-base group-hover:scale-110 group-hover:rotate-6">
                    {tool.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-text-primary">{tool.name}</h3>
                  <p className="text-text-secondary text-base m-0 leading-relaxed">{tool.description}</p>
                  <div className="absolute bottom-8 right-8 text-2xl text-primary opacity-0 group-hover:opacity-100 transition-all duration-base -translate-x-2 group-hover:translate-x-0">
                    →
                  </div>
                </div>
              </Link>
            ))}

            {/* Placeholder for future tools */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center opacity-75 hover:opacity-100 transition-opacity">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-text-primary">More Coming Soon</h3>
              <p className="text-text-secondary">Compressor, Converter, and Background Remover</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
