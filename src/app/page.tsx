import Link from 'next/link';
import styles from './page.module.css';

const categories = [
    {
        id: 'pdf',
        name: 'PDF Tools',
        icon: '📄',
        description: 'Merge, split, compress, convert PDFs',
        tools: ['PDF Merger', 'PDF Splitter', 'PDF Compressor', 'PDF to Word', 'Word to PDF', 'Image to PDF', 'PDF to Image', 'PDF Reorder', 'PDF Delete', 'PDF Rotate', 'PDF Unlock', 'PDF Watermark', 'PDF Viewer'],
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        id: 'document',
        name: 'Document Tools',
        icon: '📝',
        description: 'Convert documents between formats',
        tools: ['DOCX ↔ PDF', 'DOCX ↔ TXT', 'PPTX ↔ PDF', 'XLSX ↔ PDF', 'CSV ↔ XLSX', 'Markdown ↔ HTML', 'Markdown ↔ PDF'],
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id: 'text',
        name: 'Text Tools',
        icon: '✍️',
        description: 'Process and transform text',
        tools: ['Case Converter', 'Remove Spaces', 'Word Counter', 'Character Counter', 'Keyword Extractor', 'Grammar Checker', 'Text Summarizer', 'Encrypt/Decrypt', 'URL Encoder', 'Base64 Encoder'],
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id: 'image',
        name: 'Image Tools',
        icon: '🎨',
        description: 'Edit and convert images',
        tools: ['PNG ↔ JPG', 'WebP Converter', 'HEIC Converter', 'Image to Base64', 'Image Resizer', 'Image Cropper', 'Image Compressor', 'Background Remover', 'Watermark Tool', 'Color Picker'],
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
        id: 'security',
        name: 'Security Tools',
        icon: '🔐',
        description: 'Encryption and password utilities',
        tools: ['Password Generator', 'Hash Generator', 'JWT Decoder', 'QR Code Generator', 'QR Scanner', 'Barcode Generator', 'ZIP Creator', 'ZIP Extractor', 'Metadata Viewer', 'EXIF Remover'],
        gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
        id: 'web',
        name: 'Web Tools',
        icon: '🌐',
        description: 'URL and web utilities',
        tools: ['URL Shortener', 'Open Graph Preview', 'HTTP Header Checker', 'Status Checker', 'DNS Lookup', 'WHOIS Lookup'],
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        id: 'calculator',
        name: 'Calculators',
        icon: '🧮',
        description: 'Financial and unit calculators',
        tools: ['EMI Calculator', 'GST Calculator', 'Age Calculator', 'BMI Calculator', 'CGPA Converter', 'Unit Converter'],
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
    {
        id: 'ai',
        name: 'AI Tools',
        icon: '🤖',
        description: 'AI-powered utilities',
        tools: ['Image Upscaler', 'Text Summarizer', 'Paraphraser', 'Resume Analyzer', 'Chat PDF', 'Speech-to-Text', 'Text-to-Speech', 'Translator', 'OCR'],
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    },
    {
        id: 'developer',
        name: 'Developer Tools',
        icon: '💻',
        description: 'Tools for developers',
        tools: ['JSON Formatter', 'XML Formatter', 'YAML ↔ JSON', 'Regex Tester', 'UUID Generator', 'Color Palette', 'Lorem Ipsum', 'Markdown Editor'],
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    },
    {
        id: 'special',
        name: 'Special Tools',
        icon: '💡',
        description: 'Unique and rare utilities',
        tools: ['Remove Duplicates', 'Text Diff', 'PDF Compare', 'Image Merger', 'Audio Cleaner', 'Multi-file ZIP', 'Favicon Creator'],
        gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    },
];

export default function Home() {
    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroGlow}></div>
                    <h1 className={styles.heroTitle}>
                        <span className="text-gradient">UtilsHub</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Your All-in-One Toolkit for Everything
                    </p>
                    <p className={styles.heroDescription}>
                        50+ Free Online Tools for PDF, Images, Text, Documents, AI, and More
                    </p>
                    <div className={styles.heroStats}>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>50+</div>
                            <div className={styles.statLabel}>Tools</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>10</div>
                            <div className={styles.statLabel}>Categories</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>100%</div>
                            <div className={styles.statLabel}>Free</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className={styles.categories}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Explore Tools by Category</h2>
                    <div className={styles.grid}>
                        {categories.map((category) => (
                            <Link
                                href={`/tools/${category.id}`}
                                key={category.id}
                                className={styles.categoryCard}
                            >
                                <div className={styles.cardGlow} style={{ background: category.gradient }}></div>
                                <div className={styles.cardContent}>
                                    <div className={styles.categoryIcon}>{category.icon}</div>
                                    <h3 className={styles.categoryName}>{category.name}</h3>
                                    <p className={styles.categoryDescription}>{category.description}</p>
                                    <div className={styles.toolCount}>{category.tools.length} tools</div>
                                    <div className={styles.toolsList}>
                                        {category.tools.slice(0, 3).map((tool, idx) => (
                                            <span key={idx} className={styles.toolTag}>{tool}</span>
                                        ))}
                                        {category.tools.length > 3 && (
                                            <span className={styles.toolTag}>+{category.tools.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Why Choose UtilsHub?</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>⚡</div>
                            <h3>Lightning Fast</h3>
                            <p>All tools run in your browser for instant results</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>🔒</div>
                            <h3>100% Private</h3>
                            <p>Your files never leave your device</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>🎯</div>
                            <h3>No Limits</h3>
                            <p>Use all tools unlimited times, completely free</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>📱</div>
                            <h3>Works Everywhere</h3>
                            <p>Fully responsive on desktop, tablet, and mobile</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
