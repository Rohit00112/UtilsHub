'use client';

import { useMemo, useState } from 'react';
import { Eraser } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolTextarea } from '@/components/tools/ToolPrimitives';

const sample = 'Clear writing helps readers find an answer quickly. Paste an article, speech, script, or documentation draft here to estimate how long it takes to read.';

function formatDuration(seconds: number) {
  if (!seconds) return '0 sec';
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return remainder ? `${minutes} min ${remainder} sec` : `${minutes} min`;
}

export default function ReadingTimeCalculator() {
  const [text, setText] = useState(sample);
  const [speed, setSpeed] = useState('225');
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const wordsPerMinute = Math.min(1000, Math.max(50, Number(speed) || 225));
    return {
      words,
      characters: text.length,
      reading: formatDuration((words / wordsPerMinute) * 60),
      speaking: formatDuration((words / 130) * 60),
    };
  }, [speed, text]);

  return (
    <ToolLayout title="Reading Time Calculator" description="Estimate reading and speaking time from any text" category="text">
      <div className="mx-auto max-w-5xl space-y-6">
        <ToolPanel
          title="Text to measure"
          actions={
            <ToolActionBar>
              <button type="button" onClick={() => setText('')} className="btn btn-secondary h-8 gap-2 px-3">
                <Eraser className="h-4 w-4" /> Clear
              </button>
            </ToolActionBar>
          }
        >
          <ToolTextarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-72" placeholder="Paste your article, speech, or script..." />
        </ToolPanel>

        <ToolPanel title="Reading pace" description="Average adult reading is commonly estimated around 200–250 words per minute.">
          <ToolField label="Words per minute" htmlFor="reading-speed" className="max-w-xs">
            <input id="reading-speed" type="number" min="50" max="1000" value={speed} onChange={(event) => setSpeed(event.target.value)} className="input h-10" />
          </ToolField>
        </ToolPanel>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          <ToolMetric label="Reading time" value={stats.reading} />
          <ToolMetric label="Speaking time" value={stats.speaking} description="At 130 words per minute" />
          <ToolMetric label="Words" value={stats.words.toLocaleString()} />
          <ToolMetric label="Characters" value={stats.characters.toLocaleString()} />
        </div>
      </div>
    </ToolLayout>
  );
}
