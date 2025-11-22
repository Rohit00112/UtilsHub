import Link from 'next/link';
import styles from './ToolLayout.module.css';

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    category: string;
}

export default function ToolLayout({ children, title, description, category }: ToolLayoutProps) {
    return (
        <div className={styles.toolPage}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Home</Link>
                        <span className={styles.separator}>/</span>
                        <Link href={`/tools/${category}`}>{category}</Link>
                        <span className={styles.separator}>/</span>
                        <span>{title}</span>
                    </div>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className={styles.footer}>
                <div className="container">
                    <p>© 2024 UtilsHub - All tools are free and process data locally in your browser</p>
                </div>
            </footer>
        </div>
    );
}
