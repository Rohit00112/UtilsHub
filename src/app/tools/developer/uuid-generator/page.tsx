'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import styles from '../../text/case-converter/case-converter.module.css';

export default function UUIDGenerator() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [version, setVersion] = useState<'v4' | 'v1'>('v4');

    const generateUUID = () => {
        if (version === 'v4') {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        } else {
            // Simple v1 UUID (timestamp-based)
            const timestamp = Date.now();
            const random = Math.random().toString(16).substring(2, 14);
            return `${timestamp.toString(16)}-${random.substring(0, 4)}-1xxx-yxxx-${random.substring(4)}`.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
    };

    const handleGenerate = () => {
        const newUUIDs = Array.from({ length: count }, () => generateUUID());
        setUuids(newUUIDs);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(uuids.join('\n'));
    };

    const copyOne = (uuid: string) => {
        navigator.clipboard.writeText(uuid);
    };

    return (
        <ToolLayout
            title="UUID Generator"
            description="Generate unique identifiers (UUIDs) for your applications"
            category="developer"
        >
            <div className={styles.tool}>
                <div className={styles.inputSection}>
                    <div className={styles.versionSelector}>
                        <button
                            className={`btn ${version === 'v4' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setVersion('v4')}
                        >
                            UUID v4 (Random)
                        </button>
                        <button
                            className={`btn ${version === 'v1' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setVersion('v1')}
                        >
                            UUID v1 (Timestamp)
                        </button>
                    </div>

                    <label className={styles.label} style={{ marginTop: '1.5rem' }}>
                        Number of UUIDs: {count}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className={styles.slider}
                    />

                    <button
                        onClick={handleGenerate}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        🎲 Generate UUID{count > 1 ? 's' : ''}
                    </button>
                </div>

                {uuids.length > 0 && (
                    <div className={styles.outputSection}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Generated UUID{uuids.length > 1 ? 's' : ''} ({uuids.length})
                            </label>
                            <button onClick={copyAll} className={styles.copyBtn}>
                                📋 Copy All
                            </button>
                        </div>

                        <div className={styles.uuidList}>
                            {uuids.map((uuid, index) => (
                                <div key={index} className={styles.uuidItem}>
                                    <code>{uuid}</code>
                                    <button
                                        onClick={() => copyOne(uuid)}
                                        className={styles.copyBtnSmall}
                                        title="Copy this UUID"
                                    >
                                        📋
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .versionSelector {
          display: flex;
          gap: 1rem;
        }

        .slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          outline: none;
          margin: 1rem 0;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }

        .uuidList {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .uuidItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          transition: all var(--transition-fast);
        }

        .uuidItem:hover {
          border-color: var(--color-primary);
        }

        .uuidItem code {
          color: var(--color-primary-light);
          font-size: 0.95rem;
        }

        .copyBtnSmall {
          padding: 0.5rem 0.75rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .copyBtnSmall:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }
      `}</style>
        </ToolLayout>
    );
}
