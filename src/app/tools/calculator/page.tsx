import Link from 'next/link';
import styles from '../text/text.module.css';

const calculatorTools = [
    {
        name: 'BMI Calculator',
        description: 'Calculate your Body Mass Index and check your weight category',
        href: '/tools/calculator/bmi',
        icon: '⚖️',
    },
    {
        name: 'Age Calculator',
        description: 'Calculate your exact age in years, months, days, and more',
        href: '/tools/calculator/age',
        icon: '🎂',
    },
    {
        name: 'EMI Calculator',
        description: 'Calculate loan EMI payments (Coming Soon)',
        href: '#',
        icon: '💰',
    },
    {
        name: 'Unit Converter',
        description: 'Convert between different units (Coming Soon)',
        href: '#',
        icon: '📏',
    },
];

export default function CalculatorToolsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Calculators</span>
                    </h1>
                    <p className={styles.description}>
                        Financial and unit calculators for everyday use
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.grid}>
                        {calculatorTools.map((tool) => (
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
