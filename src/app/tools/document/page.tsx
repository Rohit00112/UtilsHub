import Link from 'next/link';
import styles from '../text/text.module.css';

export default function DocumentToolsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">Document Tools</span>
                    </h1>
                    <p className={styles.description}>
                        Convert documents between different formats
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.comingSoon}>
                        <div className={styles.comingSoonIcon}>🚧</div>
                        <h2>Coming Soon!</h2>
                        <p>Document conversion tools are under development:</p>
                        <ul>
                            <li>DOCX ↔ PDF</li>
                            <li>DOCX ↔ TXT</li>
                            <li>PPTX ↔ PDF</li>
                            <li>XLSX ↔ PDF</li>
                            <li>Markdown ↔ HTML/PDF</li>
                        </ul>
                    </div>
                </div>
            </main>

            <style jsx>{`
        .comingSoon {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-xl);
          max-width: 600px;
          margin: 0 auto;
        }

        .comingSoonIcon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
        }

        .comingSoon h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .comingSoon p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .comingSoon ul {
          list-style: none;
          padding: 0;
          color: var(--text-secondary);
        }

        .comingSoon li {
          padding: 0.5rem 0;
        }

        .comingSoon li::before {
          content: '✓ ';
          color: var(--color-primary);
          font-weight: bold;
          margin-right: 0.5rem;
        }
      `}</style>
        </div>
    );
}
