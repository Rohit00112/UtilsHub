import Link from 'next/link';
import styles from '../text/text.module.css';

const securityTools = [
    {
        name: 'Password Generator',
        description: 'Generate strong, random passwords with customizable options',
        href: '/tools/security/password-generator',
        icon: '🔐',
    },
    {
        name: 'QR Code Generator',
        description: 'Generate QR codes from text, URLs, or any data',
        href: '/tools/security/qr-generator',
        icon: '🔲',
    },
    {
        name: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256 hashes (Coming Soon)',
        href: '#',
        icon: '#️⃣',
    },
    {
        name: 'JWT Decoder',
        description: 'Decode and inspect JWT tokens (Coming Soon)',
        href: '#',
        icon: '🎫',
    },
];

export default function SecurityToolsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Security Tools</span>
                    </h1>
                    <p className={styles.description}>
                        Encryption, password utilities, and security tools
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.grid}>
                        {securityTools.map((tool) => (
                            <Link href={tool.href} key={tool.href} className={styles.toolCard}>
                                <div className={styles.toolIcon}>{tool.icon}</div>
                                <h3 className={styles.toolName}>{tool.name}</h3>
                                <p className={styles.toolDescription}>{tool.description}</p>
                                {tool.href !== '#' && <div className={styles.arrow}>→</div>}
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
