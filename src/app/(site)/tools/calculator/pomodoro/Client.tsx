'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward, Settings } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolSegmentedControl,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Phase = 'work' | 'short-break' | 'long-break';

const phaseLabels: Record<Phase, string> = {
    'work': 'Focus',
    'short-break': 'Short Break',
    'long-break': 'Long Break',
};

const phaseColors: Record<Phase, string> = {
    'work': 'stroke-rose-500',
    'short-break': 'stroke-emerald-500',
    'long-break': 'stroke-blue-500',
};

const phaseBgColors: Record<Phase, string> = {
    'work': 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    'short-break': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    'long-break': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
};

/* ------------------------------------------------------------------ */
/*  Audio helper                                                        */
/* ------------------------------------------------------------------ */

function playAlert() {
    try {
        const ctx = new AudioContext();
        const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        playTone(880, ctx.currentTime, 0.15);
        playTone(1100, ctx.currentTime + 0.18, 0.15);
        playTone(880, ctx.currentTime + 0.36, 0.2);
    } catch {
        // Audio not available
    }
}

/* ------------------------------------------------------------------ */
/*  Format time                                                         */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PomodoroTimer() {
    const [workMinutes, setWorkMinutes] = useToolState('pomodoro', 'work', 25);
    const [shortBreakMinutes, setShortBreakMinutes] = useToolState('pomodoro', 'shortBreak', 5);
    const [longBreakMinutes, setLongBreakMinutes] = useToolState('pomodoro', 'longBreak', 15);
    const [sessionsBeforeLong, setSessionsBeforeLong] = useToolState('pomodoro', 'sessionsBeforeLong', 4);

    const [phase, setPhase] = useState<Phase>('work');
    const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
    const [running, setRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Track start time for accurate countdown
    const startedAtRef = useRef<number>(0);
    const timeLeftAtStartRef = useRef<number>(0);

    const totalSeconds = phase === 'work'
        ? workMinutes * 60
        : phase === 'short-break'
            ? shortBreakMinutes * 60
            : longBreakMinutes * 60;

    const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

    // Accurate timer using Date.now() delta
    useEffect(() => {
        if (!running) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        startedAtRef.current = Date.now();
        timeLeftAtStartRef.current = timeLeft;

        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
            const newTimeLeft = timeLeftAtStartRef.current - elapsed;

            if (newTimeLeft <= 0) {
                setTimeLeft(0);
                setRunning(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                playAlert();

                // Transition to next phase
                if (phase === 'work') {
                    const newCompleted = completedSessions + 1;
                    setCompletedSessions(newCompleted);
                    if (newCompleted % sessionsBeforeLong === 0) {
                        setPhase('long-break');
                        setTimeLeft(longBreakMinutes * 60);
                    } else {
                        setPhase('short-break');
                        setTimeLeft(shortBreakMinutes * 60);
                    }
                } else {
                    setPhase('work');
                    setTimeLeft(workMinutes * 60);
                }
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 250);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    const start = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);

    const reset = useCallback(() => {
        setRunning(false);
        setPhase('work');
        setTimeLeft(workMinutes * 60);
        setCompletedSessions(0);
    }, [workMinutes]);

    const skip = useCallback(() => {
        setRunning(false);
        if (phase === 'work') {
            const newCompleted = completedSessions + 1;
            setCompletedSessions(newCompleted);
            if (newCompleted % sessionsBeforeLong === 0) {
                setPhase('long-break');
                setTimeLeft(longBreakMinutes * 60);
            } else {
                setPhase('short-break');
                setTimeLeft(shortBreakMinutes * 60);
            }
        } else {
            setPhase('work');
            setTimeLeft(workMinutes * 60);
        }
    }, [phase, completedSessions, sessionsBeforeLong, workMinutes, shortBreakMinutes, longBreakMinutes]);

    const switchPhase = useCallback((newPhase: Phase) => {
        setRunning(false);
        setPhase(newPhase);
        const dur = newPhase === 'work' ? workMinutes : newPhase === 'short-break' ? shortBreakMinutes : longBreakMinutes;
        setTimeLeft(dur * 60);
    }, [workMinutes, shortBreakMinutes, longBreakMinutes]);

    // SVG circle properties
    const circleRadius = 120;
    const circumference = 2 * Math.PI * circleRadius;
    const dashOffset = circumference * (1 - progress);

    return (
        <ToolLayout
            title="Pomodoro Timer"
            description="Focus timer with configurable work and break intervals"
            category="calculator"
            processingLabel="No data processed"
        >
            <div className="mx-auto max-w-3xl space-y-8">

                {/* ── Phase selector ─────────────────────────────── */}
                <div className="flex justify-center">
                    <ToolSegmentedControl
                        value={phase}
                        onChange={switchPhase}
                        options={[
                            { label: 'Focus', value: 'work' },
                            { label: 'Short Break', value: 'short-break' },
                            { label: 'Long Break', value: 'long-break' },
                        ]}
                    />
                </div>

                {/* ── Timer ring ─────────────────────────────────── */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center">
                        <svg
                            viewBox="0 0 280 280"
                            className="h-64 w-64 sm:h-72 sm:w-72 -rotate-90"
                        >
                            {/* Background track */}
                            <circle
                                cx="140" cy="140"
                                r={circleRadius}
                                fill="none"
                                className="stroke-border"
                                strokeWidth="8"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="140" cy="140"
                                r={circleRadius}
                                fill="none"
                                className={`${phaseColors[phase]} transition-all duration-300`}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                            />
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${phaseBgColors[phase]}`}>
                                {phaseLabels[phase]}
                            </span>
                            <span className="mt-2 font-mono text-6xl font-bold tracking-tighter text-foreground sm:text-7xl">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={reset}
                            className="btn btn-secondary h-12 w-12 rounded-full p-0"
                            title="Reset"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={running ? pause : start}
                            className="btn btn-primary h-14 w-14 rounded-full p-0 text-lg shadow-lg"
                            title={running ? 'Pause' : 'Start'}
                        >
                            {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={skip}
                            className="btn btn-secondary h-12 w-12 rounded-full p-0"
                            title="Skip to next phase"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ── Session counter ────────────────────────────── */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <ToolMetric label="Sessions completed" value={completedSessions} description="focus blocks" />
                    <ToolMetric label="Total focus time" value={`${completedSessions * workMinutes} min`} description="estimated" />
                    <ToolMetric label="Next long break" value={`in ${sessionsBeforeLong - (completedSessions % sessionsBeforeLong)} sessions`} description={`every ${sessionsBeforeLong} sessions`} />
                </div>

                {/* ── Settings ───────────────────────────────────── */}
                <ToolPanel
                    title="Timer settings"
                    actions={
                        <button
                            type="button"
                            onClick={() => setShowSettings(!showSettings)}
                            className="btn btn-secondary h-8 gap-2 px-3"
                        >
                            <Settings className="h-4 w-4" />
                            {showSettings ? 'Hide' : 'Customize'}
                        </button>
                    }
                >
                    {showSettings && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <ToolField label="Work (minutes)">
                                <input
                                    type="number" min={1} max={120}
                                    value={workMinutes}
                                    onChange={(e) => {
                                        const v = Math.max(1, Math.min(120, Number(e.target.value)));
                                        setWorkMinutes(v);
                                        if (phase === 'work' && !running) setTimeLeft(v * 60);
                                    }}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="Short break (minutes)">
                                <input
                                    type="number" min={1} max={60}
                                    value={shortBreakMinutes}
                                    onChange={(e) => {
                                        const v = Math.max(1, Math.min(60, Number(e.target.value)));
                                        setShortBreakMinutes(v);
                                        if (phase === 'short-break' && !running) setTimeLeft(v * 60);
                                    }}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="Long break (minutes)">
                                <input
                                    type="number" min={1} max={60}
                                    value={longBreakMinutes}
                                    onChange={(e) => {
                                        const v = Math.max(1, Math.min(60, Number(e.target.value)));
                                        setLongBreakMinutes(v);
                                        if (phase === 'long-break' && !running) setTimeLeft(v * 60);
                                    }}
                                    className="input font-mono"
                                />
                            </ToolField>
                            <ToolField label="Sessions before long break">
                                <input
                                    type="number" min={2} max={10}
                                    value={sessionsBeforeLong}
                                    onChange={(e) => setSessionsBeforeLong(Math.max(2, Math.min(10, Number(e.target.value))))}
                                    className="input font-mono"
                                />
                            </ToolField>
                        </div>
                    )}
                    {!showSettings && (
                        <p className="text-sm text-muted-foreground">
                            {workMinutes} min work · {shortBreakMinutes} min short break · {longBreakMinutes} min long break · every {sessionsBeforeLong} sessions
                        </p>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
