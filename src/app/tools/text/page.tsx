import Link from 'next/link';
import styles from './text.module.css';

const textTools = [
    {
        name: 'Text Case Converter',
        description: 'Convert text between UPPER, lower, Title, camelCase, and more',
        href: '/tools/text/case-converter',
        icon: '🔤',
    },
    {
        name: 'Word & Character Counter',
        description: 'Count words, characters, sentences, and estimate reading time',
        href: '/tools/text/word-counter',
        icon: '📊',
    },
    {
        name: 'Base64 Encoder/Decoder',
        description: 'Encode text to Base64 or decode Base64 strings',
        href: '/tools/text/base64',
        icon: '🔐',
    },
    {
        name: 'URL Encoder/Decoder',
        description: 'Encode URLs for safe transmission or decode URL-encoded strings',
        href: '/tools/text/url-encoder',
        icon: '🔗',
    },
];

export default function TextToolsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Text Tools</span>
                    </h1>
                    <p className={styles.description}>
                        Process, transform, and analyze text with our collection of text utilities
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.grid}>
                        {textTools.map((tool) => (
                            <Link href={tool.href} key={tool.href} className={styles.toolCard}>
                                <div className={styles.toolIcon}>{tool.icon}</div>
                                <h3 className={styles.toolName}>{tool.name}</h3>
                                <p className={styles.toolDescription}>{tool.description}</p>
                                <div className={styles.arrow}>→</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
