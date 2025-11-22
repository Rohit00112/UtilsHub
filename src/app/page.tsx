import Link from 'next/link';

const categories = [
    {
        id: 'pdf',
        name: 'PDF Tools',
        icon: '📄',
        description: 'Merge, split, compress, convert PDFs',
        tools: ['PDF Merger', 'PDF Splitter', 'PDF Compressor', 'PDF to Word', 'Word to PDF', 'Image to PDF', 'PDF to Image', 'PDF Reorder', 'PDF Delete', 'PDF Rotate', 'PDF Unlock', 'PDF Watermark', 'PDF Viewer'],
        gradient: 'from-[#667eea] to-[#764ba2]',
    },
    {
        id: 'document',
        name: 'Document Tools',
        icon: '📝',
        description: 'Convert documents between formats',
        tools: ['DOCX ↔ PDF', 'DOCX ↔ TXT', 'PPTX ↔ PDF', 'XLSX ↔ PDF', 'CSV ↔ XLSX', 'Markdown ↔ HTML', 'Markdown ↔ PDF'],
        gradient: 'from-[#f093fb] to-[#f5576c]',
    },
    {
        id: 'text',
        name: 'Text Tools',
        icon: '✍️',
        description: 'Process and transform text',
        tools: ['Case Converter', 'Remove Spaces', 'Word Counter', 'Character Counter', 'Keyword Extractor', 'Grammar Checker', 'Text Summarizer', 'Encrypt/Decrypt', 'URL Encoder', 'Base64 Encoder'],
        gradient: 'from-[#4facfe] to-[#00f2fe]',
    },
    {
        id: 'image',
        name: 'Image Tools',
        icon: '🎨',
        description: 'Edit and convert images',
        tools: ['PNG ↔ JPG', 'WebP Converter', 'HEIC Converter', 'Image to Base64', 'Image Resizer', 'Image Cropper', 'Image Compressor', 'Background Remover', 'Watermark Tool', 'Color Picker'],
        gradient: 'from-[#fa709a] to-[#fee140]',
    },
    {
        id: 'security',
        name: 'Security Tools',
        icon: '🔐',
        description: 'Encryption and password utilities',
        tools: ['Password Generator', 'Hash Generator', 'JWT Decoder', 'QR Code Generator', 'QR Scanner', 'Barcode Generator', 'ZIP Creator', 'ZIP Extractor', 'Metadata Viewer', 'EXIF Remover'],
        gradient: 'from-[#30cfd0] to-[#330867]',
    },
    {
        id: 'web',
        name: 'Web Tools',
        icon: '🌐',
        description: 'URL and web utilities',
        tools: ['URL Shortener', 'Open Graph Preview', 'HTTP Header Checker', 'Status Checker', 'DNS Lookup', 'WHOIS Lookup'],
        gradient: 'from-[#a8edea] to-[#fed6e3]',
    },
    {
        id: 'calculator',
        name: 'Calculators',
        icon: '🧮',
        description: 'Financial and unit calculators',
        tools: ['EMI Calculator', 'GST Calculator', 'Age Calculator', 'BMI Calculator', 'CGPA Converter', 'Unit Converter'],
        gradient: 'from-[#ffecd2] to-[#fcb69f]',
    },
    {
        id: 'ai',
        name: 'AI Tools',
        icon: '🤖',
        description: 'AI-powered utilities',
        tools: ['Image Upscaler', 'Text Summarizer', 'Paraphraser', 'Resume Analyzer', 'Chat PDF', 'Speech-to-Text', 'Text-to-Speech', 'Translator', 'OCR'],
        gradient: 'from-[#ff9a9e] to-[#fecfef]',
    },
    {
        id: 'developer',
        name: 'Developer Tools',
        icon: '💻',
        description: 'Tools for developers',
        tools: ['JSON Formatter', 'XML Formatter', 'YAML ↔ JSON', 'Regex Tester', 'UUID Generator', 'Color Palette', 'Lorem Ipsum', 'Markdown Editor'],
        gradient: 'from-[#a1c4fd] to-[#c2e9fb]',
    },
    {
        id: 'special',
        name: 'Special Tools',
        icon: '💡',
        description: 'Unique and rare utilities',
        tools: ['Remove Duplicates', 'Text Diff', 'PDF Compare', 'Image Merger', 'Audio Cleaner', 'Multi-file ZIP', 'Favicon Creator'],
        gradient: 'from-[#fbc2eb] to-[#a6c1ee]',
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-bg-primary relative">
            {/* Background Mesh Gradient */}
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />

            {/* Hero Section */}
            <section className="relative py-32 px-8 text-center overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[80px] animate-pulse pointer-events-none" />

                    <h1 className="text-7xl font-extrabold mb-4 tracking-tight animate-fade-in">
                        <span className="text-gradient">UtilsHub</span>
                    </h1>
                    <p className="text-3xl text-text-secondary mb-4 font-semibold animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                        Your All-in-One Toolkit for Everything
                    </p>
                    <p className="text-xl text-text-tertiary mb-12 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
                        50+ Free Online Tools for PDF, Images, Text, Documents, AI, and More
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
                        <div className="text-center">
                            <div className="text-5xl font-extrabold text-gradient mb-2">50+</div>
                            <div className="text-sm text-text-tertiary uppercase tracking-wider">Tools</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-extrabold text-gradient mb-2">10</div>
                            <div className="text-sm text-text-tertiary uppercase tracking-wider">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-extrabold text-gradient mb-2">100%</div>
                            <div className="text-sm text-text-tertiary uppercase tracking-wider">Free</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="relative z-10 py-16">
                <div className="container">
                    <h2 className="text-5xl text-center mb-12 text-gradient">Explore Tools by Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <Link
                                href={`/tools/${category.id}`}
                                key={category.id}
                                className="group relative bg-bg-secondary rounded-2xl p-8 border border-border transition-all duration-base hover:-translate-y-2 hover:border-primary hover:shadow-lg hover:shadow-glow overflow-hidden"
                            >
                                {/* Gradient Glow on Hover */}
                                <div className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-slow blur-3xl pointer-events-none`} />

                                {/* Mesh Background on Hover */}
                                <div className="absolute inset-0 bg-gradient-mesh opacity-0 group-hover:opacity-10 transition-opacity duration-base" />

                                <div className="relative z-10">
                                    <div className="text-5xl mb-4 inline-block transition-transform duration-base group-hover:scale-110 group-hover:rotate-6">
                                        {category.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-text-primary">{category.name}</h3>
                                    <p className="text-text-secondary mb-4 text-base">{category.description}</p>
                                    <div className="inline-block px-3 py-1 bg-bg-tertiary rounded-full text-sm text-primary-light font-semibold mb-4">
                                        {category.tools.length} tools
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {category.tools.slice(0, 3).map((tool, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs text-text-secondary">
                                                {tool}
                                            </span>
                                        ))}
                                        {category.tools.length > 3 && (
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs text-text-secondary">
                                                +{category.tools.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-16 pb-24">
                <div className="container">
                    <h2 className="text-5xl text-center mb-12 text-gradient">Why Choose UtilsHub?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-8 bg-bg-secondary rounded-lg border border-border transition-all duration-base hover:-translate-y-1 hover:border-primary hover:shadow-md">
                            <div className="text-5xl mb-4 inline-block transition-transform duration-base hover:scale-125">⚡</div>
                            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                            <p className="text-text-secondary text-base m-0">All tools run in your browser for instant results</p>
                        </div>
                        <div className="text-center p-8 bg-bg-secondary rounded-lg border border-border transition-all duration-base hover:-translate-y-1 hover:border-primary hover:shadow-md">
                            <div className="text-5xl mb-4 inline-block transition-transform duration-base hover:scale-125">🔒</div>
                            <h3 className="text-xl font-bold mb-2">100% Private</h3>
                            <p className="text-text-secondary text-base m-0">Your files never leave your device</p>
                        </div>
                        <div className="text-center p-8 bg-bg-secondary rounded-lg border border-border transition-all duration-base hover:-translate-y-1 hover:border-primary hover:shadow-md">
                            <div className="text-5xl mb-4 inline-block transition-transform duration-base hover:scale-125">🎯</div>
                            <h3 className="text-xl font-bold mb-2">No Limits</h3>
                            <p className="text-text-secondary text-base m-0">Use all tools unlimited times, completely free</p>
                        </div>
                        <div className="text-center p-8 bg-bg-secondary rounded-lg border border-border transition-all duration-base hover:-translate-y-1 hover:border-primary hover:shadow-md">
                            <div className="text-5xl mb-4 inline-block transition-transform duration-base hover:scale-125">📱</div>
                            <h3 className="text-xl font-bold mb-2">Works Everywhere</h3>
                            <p className="text-text-secondary text-base m-0">Fully responsive on desktop, tablet, and mobile</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
