'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../case-converter/case-converter.module.css';

export default function WordCounter() {
    const [text, setText] = useState('');

    const stats = {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0,
        paragraphs: text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0,
        lines: text.split('\n').length,
        readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200), // 200 words per minute
    };

    const clearText = () => setText('');

    return (
        <ToolLayout
            title="Word & Character Counter"
            description="Count words, characters, sentences, paragraphs, and estimate reading time"
            category="text"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <label htmlFor="input" className={styles.label}>
                        Enter Your Text
                    </label>
                    <textarea
                        id="input"
                        className={styles.textarea}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your text here..."
                        rows={12}
                    />
                    <button onClick={clearText} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                        Clear Text
                    </button>
                </div>

                <div className={styles.outputSection}>
                    <h2 className={styles.label}>Statistics</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.words}</div>
                            <div className={styles.statLabel}>Words</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.characters}</div>
                            <div className={styles.statLabel}>Characters</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.charactersNoSpaces}</div>
                            <div className={styles.statLabel}>Characters (no spaces)</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.sentences}</div>
                            <div className={styles.statLabel}>Sentences</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.paragraphs}</div>
                            <div className={styles.statLabel}>Paragraphs</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.lines}</div>
                            <div className={styles.statLabel}>Lines</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.readingTime} min</div>
                            <div className={styles.statLabel}>Reading Time</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .statsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .statCard {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          text-align: center;
          transition: all var(--transition-base);
        }

        .statCard:hover {
          border-color: var(--color-primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .statValue {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .statLabel {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
        </ToolLayout>
    );
}
