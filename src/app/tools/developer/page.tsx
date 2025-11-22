import Link from 'next/link';
import styles from '../text/text.module.css';

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
        description: 'Test and debug regular expressions (Coming Soon)',
        href: '#',
        icon: '🔍',
    },
    {
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text (Coming Soon)',
        href: '#',
        icon: '📝',
    },
];

export default function DeveloperToolsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Developer Tools</span>
                    </h1>
                    <p className={styles.description}>
                        Essential utilities for developers and programmers
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.grid}>
                        {developerTools.map((tool) => (
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
