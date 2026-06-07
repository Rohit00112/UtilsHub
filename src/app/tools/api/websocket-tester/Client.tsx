'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, Eraser, Plug, PlugZap, Send } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolActionBar, ToolField, ToolMetric, ToolPanel, ToolStatus, ToolTextarea } from '@/components/tools/ToolPrimitives';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
type LogDirection = 'system' | 'sent' | 'received';

interface SocketLog {
    id: number;
    direction: LogDirection;
    timestamp: string;
    message: string;
}

function statusLabel(status: ConnectionStatus) {
    if (status === 'open') return 'Connected';
    if (status === 'connecting') return 'Connecting';
    if (status === 'error') return 'Error';
    if (status === 'closed') return 'Closed';
    return 'Idle';
}

function logText(logs: SocketLog[]) {
    return logs.map((log) => `[${log.timestamp}] ${log.direction.toUpperCase()}: ${log.message}`).join('\n');
}

export default function WebSocketTester() {
    const [url, setUrl] = useState('wss://echo.websocket.events');
    const [message, setMessage] = useState('{"type":"ping","source":"UtilsHub"}');
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [logs, setLogs] = useState<SocketLog[]>([]);
    const [copied, setCopied] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const logIdRef = useRef(0);

    const addLog = (direction: LogDirection, logMessage: string) => {
        logIdRef.current += 1;
        const timestamp = new Date().toLocaleTimeString();
        setLogs((current) => [
            {
                id: logIdRef.current,
                direction,
                timestamp,
                message: logMessage,
            },
            ...current,
        ].slice(0, 100));
        setCopied(false);
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.close(1000, 'Closed from UtilsHub');
            socketRef.current = null;
        }
        setStatus((current) => (current === 'idle' ? 'idle' : 'closed'));
    };

    useEffect(() => {
        return () => {
            socketRef.current?.close(1000, 'Component unmounted');
        };
    }, []);

    const connect = () => {
        const trimmedUrl = url.trim();
        if (!/^wss?:\/\//i.test(trimmedUrl)) {
            setStatus('error');
            addLog('system', 'Enter a WebSocket URL that starts with ws:// or wss://.');
            return;
        }

        disconnect();
        setStatus('connecting');
        addLog('system', `Connecting to ${trimmedUrl}`);

        try {
            const socket = new WebSocket(trimmedUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus('open');
                addLog('system', 'Connection opened.');
            };

            socket.onmessage = (event) => {
                addLog('received', typeof event.data === 'string' ? event.data : '[binary message]');
            };

            socket.onerror = () => {
                setStatus('error');
                addLog('system', 'Socket error. Check the URL, network, TLS, and server policy.');
            };

            socket.onclose = (event) => {
                setStatus('closed');
                addLog('system', `Connection closed (${event.code}${event.reason ? `: ${event.reason}` : ''}).`);
                socketRef.current = null;
            };
        } catch (error) {
            setStatus('error');
            addLog('system', error instanceof Error ? error.message : 'Unable to create this WebSocket connection.');
        }
    };

    const sendMessage = () => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            addLog('system', 'Connect before sending a message.');
            return;
        }

        socket.send(message);
        addLog('sent', message || '(empty message)');
    };

    const clearLogs = () => {
        setLogs([]);
        setCopied(false);
    };

    const copyLogs = async () => {
        if (logs.length === 0) return;
        await navigator.clipboard.writeText(logText([...logs].reverse()));
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const sentCount = logs.filter((log) => log.direction === 'sent').length;
    const receivedCount = logs.filter((log) => log.direction === 'received').length;

    return (
        <ToolLayout
            title="WebSocket Tester"
            description="Connect to WebSocket endpoints, send messages, and inspect realtime events"
            category="api"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <ToolPanel title="Connection">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                        <ToolField label="WebSocket URL" htmlFor="websocket-url" description="Use ws:// or wss://. Browser TLS and network policies still apply.">
                            <input
                                id="websocket-url"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder="wss://example.com/socket"
                                className="input h-11 font-mono"
                                spellCheck={false}
                            />
                        </ToolField>
                        <div className="flex items-end gap-2">
                            <button type="button" onClick={connect} disabled={status === 'connecting'} className="btn btn-primary h-11 gap-2">
                                <PlugZap className="h-4 w-4" />
                                Connect
                            </button>
                            <button type="button" onClick={disconnect} className="btn btn-secondary h-11 gap-2">
                                <Plug className="h-4 w-4" />
                                Disconnect
                            </button>
                        </div>
                    </div>
                </ToolPanel>

                <div className="grid gap-4 sm:grid-cols-4">
                    <ToolMetric label="Status" value={statusLabel(status)} />
                    <ToolMetric label="Sent" value={sentCount} />
                    <ToolMetric label="Received" value={receivedCount} />
                    <ToolMetric label="Log entries" value={logs.length} />
                </div>

                {status === 'error' ? (
                    <ToolStatus tone="error">The browser could not keep this WebSocket connection open.</ToolStatus>
                ) : (
                    <ToolStatus tone="info">Connections are opened directly from your browser to the WebSocket URL.</ToolStatus>
                )}

                <ToolPanel title="Message">
                    <ToolTextarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder='{"type":"ping"}'
                        className="min-h-36"
                        spellCheck={false}
                    />
                    <ToolActionBar className="mt-4 justify-center">
                        <button type="button" onClick={sendMessage} disabled={status !== 'open'} className="btn btn-primary gap-2">
                            <Send className="h-4 w-4" />
                            Send message
                        </button>
                    </ToolActionBar>
                </ToolPanel>

                <ToolPanel
                    title="Event log"
                    description="Newest events appear first. Up to 100 entries are kept."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={copyLogs} disabled={logs.length === 0} className="btn btn-secondary h-8 gap-2 px-3">
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy log'}
                            </button>
                            <button type="button" onClick={clearLogs} className="btn btn-secondary h-8 gap-2 px-3">
                                <Eraser className="h-4 w-4" />
                                Clear
                            </button>
                        </div>
                    }
                >
                    {logs.length === 0 ? (
                        <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Connect to a socket or send a message to start the log.
                        </div>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {logs.map((log) => (
                                <div key={log.id} className="grid gap-2 p-3 md:grid-cols-[110px_110px_1fr]">
                                    <div className="font-mono text-xs text-muted-foreground">{log.timestamp}</div>
                                    <div className="font-mono text-xs uppercase text-foreground">{log.direction}</div>
                                    <div className="break-all font-mono text-sm text-muted-foreground">{log.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
