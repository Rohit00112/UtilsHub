import Link from 'next/link';

const categories = [
    {
        id: 'pdf',
        name: 'PDF Tools',
        icon: '📄',
        description: 'Merge, split, compress, convert PDFs',
        tools: ['PDF Merger', 'PDF Splitter', 'PDF Compressor', 'PDF to Word', 'Word to PDF', 'Image to PDF', 'PDF to Image', 'PDF Reorder', 'PDF Delete', 'PDF Rotate', 'PDF Unlock', 'PDF Watermark', 'PDF Viewer'],
    },
    {
        id: 'document',
        name: 'Document Tools',
        icon: '📝',
        description: 'Convert documents between formats',
        tools: ['DOCX ↔ PDF', 'DOCX ↔ TXT', 'PPTX ↔ PDF', 'XLSX ↔ PDF', 'CSV ↔ XLSX', 'Markdown ↔ HTML', 'Markdown ↔ PDF'],
    },
    {
        id: 'text',
        name: 'Text Tools',
        icon: '✍️',
        description: 'Process and transform text',
        tools: ['Case Converter', 'Remove Spaces', 'Word Counter', 'Character Counter', 'Keyword Extractor', 'Grammar Checker', 'Text Summarizer', 'Encrypt/Decrypt', 'URL Encoder', 'Base64 Encoder'],
    },
    {
        id: 'image',
        name: 'Image Tools',
        icon: '🎨',
        description: 'Edit and convert images',
        tools: ['PNG ↔ JPG', 'WebP Converter', 'HEIC Converter', 'Image to Base64', 'Image Resizer', 'Image Cropper', 'Image Compressor', 'Background Remover', 'Watermark Tool', 'Color Picker'],
    },
    {
        id: 'security',
        name: 'Security Tools',
        icon: '🔐',
        description: 'Encryption and password utilities',
        tools: ['Password Generator', 'Hash Generator', 'JWT Decoder', 'QR Code Generator', 'QR Scanner', 'Barcode Generator', 'ZIP Creator', 'ZIP Extractor', 'Metadata Viewer', 'EXIF Remover'],
    },
    {
        id: 'web',
        name: 'Web Tools',
        icon: '🌐',
        description: 'URL and web utilities',
        tools: ['URL Shortener', 'Open Graph Preview', 'HTTP Header Checker', 'Status Checker', 'DNS Lookup', 'WHOIS Lookup'],
    },
    {
        id: 'calculator',
        name: 'Calculators',
        icon: '🧮',
        description: 'Financial and unit calculators',
        tools: ['EMI Calculator', 'GST Calculator', 'Age Calculator', 'BMI Calculator', 'CGPA Converter', 'Unit Converter'],
    },
    {
        id: 'ai',
        name: 'AI Tools',
        icon: '🤖',
        description: 'AI-powered utilities',
        tools: ['Image Upscaler', 'Text Summarizer', 'Paraphraser', 'Resume Analyzer', 'Chat PDF', 'Speech-to-Text', 'Text-to-Speech', 'Translator', 'OCR'],
    },
    {
        id: 'developer',
        name: 'Developer Tools',
        icon: '💻',
        description: 'Tools for developers',
        tools: ['JSON Formatter', 'XML Formatter', 'YAML ↔ JSON', 'Regex Tester', 'UUID Generator', 'Color Palette', 'Lorem Ipsum', 'Markdown Editor'],
    },
    {
        id: 'special',
        name: 'Special Tools',
        icon: '💡',
        description: 'Unique and rare utilities',
        tools: ['Remove Duplicates', 'Text Diff', 'PDF Compare', 'Image Merger', 'Audio Cleaner', 'Multi-file ZIP', 'Favicon Creator'],
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Hero Section */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="mb-6 animate-fade-in">
                        UtilsHub
                    </h1>
                    <p className="text-xl text-text-secondary mb-8 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                        Your All-in-One Toolkit for Everything. <br className="hidden sm:block" />
                        50+ Free Online Tools.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 sm:gap-16 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-text-primary mb-1">50+</div>
                            <div className="text-xs text-text-tertiary uppercase tracking-wider">Tools</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-text-primary mb-1">10</div>
                            <div className="text-xs text-text-tertiary uppercase tracking-wider">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-text-primary mb-1">100%</div>
                            <div className="text-xs text-text-tertiary uppercase tracking-wider">Free</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12 bg-bg-secondary/50">
                <div className="container">
                    <h2 className="text-center mb-12">Explore Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                href={`/tools/${category.id}`}
                                key={category.id}
                                className="card group hover:bg-bg-primary"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                                        {category.icon}
                                    </div>
                                    <span className="text-xs font-medium text-text-tertiary bg-bg-tertiary px-2 py-1 rounded-full">
                                        {category.tools.length} tools
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {category.tools.slice(0, 3).map((tool, idx) => (
                                        <span key={idx} className="text-xs text-text-tertiary border border-border px-2 py-0.5 rounded">
                                            {tool}
                                        </span>
                                    ))}
                                    {category.tools.length > 3 && (
                                        <span className="text-xs text-text-tertiary px-1">
                                            +{category.tools.length - 3}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
                            <p className="text-sm text-text-secondary">Instant results, running locally in your browser.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-lg font-bold mb-2">100% Private</h3>
                            <p className="text-sm text-text-secondary">Your files never leave your device.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-lg font-bold mb-2">No Limits</h3>
                            <p className="text-sm text-text-secondary">Unlimited usage, completely free forever.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-lg font-bold mb-2">Responsive</h3>
                            <p className="text-sm text-text-secondary">Works perfectly on all your devices.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
