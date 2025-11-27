import Link from 'next/link';

const developerTools = [
    {
        name: 'JSON Formatter & Validator',
        description: 'Format, minify, and validate JSON data',
        href: '/tools/developer/json-formatter',
        icon: '{ }',
    },
    {
        name: 'UUID Generator',
        description: 'Generate unique identifiers (UUIDs) for your applications',
        href: '/tools/developer/uuid-generator',
        icon: '🎲',
    },
    {
        name: 'Color Palette Generator',
        description: 'Generate beautiful color palettes and harmonies',
        href: '/tools/developer/color-palette',
        icon: '🎨',
    },
    {
        name: 'Regex Tester',
        description: 'Test and debug regular expressions with real-time matching',
        href: '/tools/developer/regex-tester',
        icon: '🔍',
    },
    {
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text for your designs and mockups',
        href: '/tools/developer/lorem-ipsum',
        icon: '📝',
    },
    {
        name: 'YAML ↔ JSON Converter',
        description: 'Convert between YAML and JSON formats instantly',
        href: '/tools/developer/yaml-json',
        icon: '🔄',
    },
    {
        name: 'XML Formatter',
        description: 'Format, validate, and minify XML data',
        href: '/tools/developer/xml-formatter',
        icon: '📄',
    },
    {
        name: 'Markdown Editor',
        description: 'Write and preview Markdown in real-time',
        href: '/tools/developer/markdown-editor',
        icon: '📝',
    },
];

export default function DeveloperToolsPage() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="bg-bg-secondary border-b border-border relative">
                <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
                <div className="container py-12 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 transition-all duration-fast hover:text-primary hover:-translate-x-1">
                        ← Back to Home
                    </Link>
                    <h1 className="text-6xl font-bold mb-4">
                        <span className="text-gradient">Developer Tools</span>
                    </h1>
                    <p className="text-xl text-text-secondary m-0">
                        Essential utilities for developers and programmers
                    </p>
                </div>
            </div>

            <main className="py-16">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {developerTools.map((tool) => (
                            <Link href={tool.href} key={tool.href} className="group relative bg-bg-secondary border-2 border-border rounded-lg p-8 transition-all duration-base hover:-translate-y-2 hover:border-primary hover:shadow-lg cursor-pointer overflow-hidden block">
                                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-base" />
                                <div className="relative z-10">
                                    <div className="text-5xl mb-4 inline-block transition-transform duration-base group-hover:scale-110 group-hover:rotate-6">{tool.icon}</div>
                                    <h3 className="text-2xl font-bold mb-3 text-text-primary">{tool.name}</h3>
                                    <p className="text-text-secondary text-base m-0 leading-relaxed">{tool.description}</p>
                                    {tool.href !== '#' && <div className="absolute bottom-8 right-8 text-2xl text-primary opacity-0 group-hover:opacity-100 transition-all duration-base -translate-x-2 group-hover:translate-x-0">→</div>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
