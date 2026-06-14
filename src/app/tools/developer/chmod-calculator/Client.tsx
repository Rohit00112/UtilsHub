'use client';

import { useState } from 'react';
import { Check, Clipboard, RotateCcw, Terminal } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
    ToolActionBar,
    ToolField,
    ToolMetric,
    ToolPanel,
    ToolStatus,
} from '@/components/tools/ToolPrimitives';

type Scope = 'owner' | 'group' | 'others';
type Permission = 'read' | 'write' | 'execute';
type SpecialBit = 'setuid' | 'setgid' | 'sticky';

type PermissionState = Record<Scope, Record<Permission, boolean>>;
type SpecialBitState = Record<SpecialBit, boolean>;

const scopes: Array<{ key: Scope; label: string; description: string }> = [
    { key: 'owner', label: 'Owner', description: 'User who owns the file' },
    { key: 'group', label: 'Group', description: 'Members of the owning group' },
    { key: 'others', label: 'Others', description: 'Every other user' },
];

const permissionValues: Record<Permission, number> = {
    read: 4,
    write: 2,
    execute: 1,
};

const specialValues: Record<SpecialBit, number> = {
    setuid: 4,
    setgid: 2,
    sticky: 1,
};

const presets = [
    { mode: '644', label: 'Regular file' },
    { mode: '755', label: 'Executable' },
    { mode: '600', label: 'Private file' },
    { mode: '700', label: 'Private script' },
    { mode: '775', label: 'Shared directory' },
];

function digitToPermissions(digit: number): Record<Permission, boolean> {
    return {
        read: (digit & permissionValues.read) !== 0,
        write: (digit & permissionValues.write) !== 0,
        execute: (digit & permissionValues.execute) !== 0,
    };
}

function parseMode(value: string): { permissions: PermissionState; specialBits: SpecialBitState } | null {
    if (!/^[0-7]{3,4}$/.test(value)) return null;

    const digits = value.padStart(4, '0').split('').map(Number);
    const [special, owner, group, others] = digits;

    return {
        permissions: {
            owner: digitToPermissions(owner),
            group: digitToPermissions(group),
            others: digitToPermissions(others),
        },
        specialBits: {
            setuid: (special & specialValues.setuid) !== 0,
            setgid: (special & specialValues.setgid) !== 0,
            sticky: (special & specialValues.sticky) !== 0,
        },
    };
}

function permissionDigit(permissions: Record<Permission, boolean>) {
    return (Object.keys(permissionValues) as Permission[]).reduce(
        (total, permission) => total + (permissions[permission] ? permissionValues[permission] : 0),
        0
    );
}

function formatMode(permissions: PermissionState, specialBits: SpecialBitState) {
    const special = (Object.keys(specialValues) as SpecialBit[]).reduce(
        (total, bit) => total + (specialBits[bit] ? specialValues[bit] : 0),
        0
    );
    const standard = scopes.map(({ key }) => permissionDigit(permissions[key])).join('');
    return special > 0 ? `${special}${standard}` : standard;
}

function executeCharacter(enabled: boolean, special: boolean, active: string, inactive: string) {
    if (!special) return enabled ? 'x' : '-';
    return enabled ? active : inactive;
}

function formatSymbolic(permissions: PermissionState, specialBits: SpecialBitState) {
    return scopes.map(({ key }) => {
        const current = permissions[key];
        const special = key === 'owner'
            ? specialBits.setuid
            : key === 'group'
                ? specialBits.setgid
                : specialBits.sticky;
        const execute = key === 'others'
            ? executeCharacter(current.execute, special, 't', 'T')
            : executeCharacter(current.execute, special, 's', 'S');

        return `${current.read ? 'r' : '-'}${current.write ? 'w' : '-'}${execute}`;
    }).join('');
}

function shellQuote(value: string) {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}

const initialMode = parseMode('755');

export default function ChmodCalculator() {
    const [permissions, setPermissions] = useState<PermissionState>(initialMode!.permissions);
    const [specialBits, setSpecialBits] = useState<SpecialBitState>(initialMode!.specialBits);
    const [octalInput, setOctalInput] = useState('755');
    const [filePath, setFilePath] = useState('path/to/file');
    const [copied, setCopied] = useState<'mode' | 'command' | null>(null);

    const mode = formatMode(permissions, specialBits);
    const symbolic = formatSymbolic(permissions, specialBits);
    const command = `chmod ${mode} ${shellQuote(filePath.trim() || 'path/to/file')}`;
    const invalidOctal = octalInput.length > 0 && parseMode(octalInput) === null;
    const isWorldWritable = permissions.others.write;
    const hasSpecialBits = Object.values(specialBits).some(Boolean);

    const applyMode = (value: string) => {
        const parsed = parseMode(value);
        setOctalInput(value);
        if (!parsed) return;

        setPermissions(parsed.permissions);
        setSpecialBits(parsed.specialBits);
        setCopied(null);
    };

    const togglePermission = (scope: Scope, permission: Permission) => {
        const next = {
            ...permissions,
            [scope]: {
                ...permissions[scope],
                [permission]: !permissions[scope][permission],
            },
        };
        setPermissions(next);
        setOctalInput(formatMode(next, specialBits));
        setCopied(null);
    };

    const toggleSpecialBit = (bit: SpecialBit) => {
        const next = { ...specialBits, [bit]: !specialBits[bit] };
        setSpecialBits(next);
        setOctalInput(formatMode(permissions, next));
        setCopied(null);
    };

    const copyText = async (kind: 'mode' | 'command', value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(kind);
        window.setTimeout(() => setCopied(null), 1600);
    };

    const reset = () => {
        applyMode('755');
        setFilePath('path/to/file');
    };

    return (
        <ToolLayout
            title="Unix Permissions Calculator"
            description="Convert chmod modes between octal and symbolic notation"
            category="developer"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                <ToolPanel title="Octal mode" description="Enter three digits, or four digits when using special permission bits.">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <ToolField label="Mode" htmlFor="octal-mode">
                            <input
                                id="octal-mode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                spellCheck={false}
                                maxLength={4}
                                value={octalInput}
                                onChange={(event) => applyMode(event.target.value.trim())}
                                className={`input h-11 font-mono text-lg ${invalidOctal ? 'border-destructive text-destructive' : ''}`}
                                aria-invalid={invalidOctal}
                                aria-describedby={invalidOctal ? 'octal-error' : undefined}
                            />
                            {invalidOctal && (
                                <p id="octal-error" className="text-xs text-destructive">
                                    Use three or four digits from 0 to 7.
                                </p>
                            )}
                        </ToolField>

                        <ToolField label="Common presets">
                            <div className="flex flex-wrap gap-2">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.mode}
                                        type="button"
                                        onClick={() => applyMode(preset.mode)}
                                        className="btn btn-secondary h-11 gap-2"
                                    >
                                        <span className="font-mono">{preset.mode}</span>
                                        <span className="text-muted-foreground">{preset.label}</span>
                                    </button>
                                ))}
                            </div>
                        </ToolField>
                    </div>
                </ToolPanel>

                <ToolPanel title="Permission matrix" description="Read = 4, write = 2, and execute = 1 within each scope.">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] border-collapse text-left">
                            <thead>
                                <tr className="border-b text-sm text-muted-foreground">
                                    <th className="px-3 py-3 font-medium">Scope</th>
                                    <th className="px-3 py-3 text-center font-medium">Read (4)</th>
                                    <th className="px-3 py-3 text-center font-medium">Write (2)</th>
                                    <th className="px-3 py-3 text-center font-medium">Execute (1)</th>
                                    <th className="px-3 py-3 text-right font-medium">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scopes.map((scope) => (
                                    <tr key={scope.key} className="border-b last:border-0">
                                        <th className="px-3 py-4">
                                            <div className="font-medium text-foreground">{scope.label}</div>
                                            <div className="mt-0.5 text-xs font-normal text-muted-foreground">{scope.description}</div>
                                        </th>
                                        {(Object.keys(permissionValues) as Permission[]).map((permission) => (
                                            <td key={permission} className="px-3 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={permissions[scope.key][permission]}
                                                    onChange={() => togglePermission(scope.key, permission)}
                                                    aria-label={`${scope.label} ${permission} permission`}
                                                    className="h-5 w-5 accent-current"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-3 py-4 text-right font-mono text-lg font-semibold text-foreground">
                                            {permissionDigit(permissions[scope.key])}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ToolPanel>

                <ToolPanel title="Special permission bits" description="These are uncommon for regular files. Enable them only when you understand their effect.">
                    <div className="grid gap-3 sm:grid-cols-3">
                        {([
                            ['setuid', 'Setuid (4)', 'Run with the file owner identity'],
                            ['setgid', 'Setgid (2)', 'Use the group identity or inherit group'],
                            ['sticky', 'Sticky bit (1)', 'Restrict deletion in shared directories'],
                        ] as Array<[SpecialBit, string, string]>).map(([bit, label, description]) => (
                            <label key={bit} className="flex cursor-pointer items-start gap-3 rounded-md border bg-muted/20 p-4">
                                <input
                                    type="checkbox"
                                    checked={specialBits[bit]}
                                    onChange={() => toggleSpecialBit(bit)}
                                    className="mt-0.5 h-5 w-5 accent-current"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-foreground">{label}</span>
                                    <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </ToolPanel>

                {isWorldWritable && (
                    <ToolStatus tone="warning">
                        This mode is world-writable. Any local user or process can modify the target.
                    </ToolStatus>
                )}
                {!isWorldWritable && hasSpecialBits && (
                    <ToolStatus tone="info">
                        Special permission bits can change process identity or directory behavior. Review the target before applying this mode.
                    </ToolStatus>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <ToolMetric label="Octal mode" value={<span className="font-mono">{mode}</span>} />
                    <ToolMetric label="Symbolic mode" value={<span className="font-mono text-xl">{symbolic}</span>} />
                </div>

                <ToolPanel title="chmod command" description="Set the path, review the command, then copy it for your terminal.">
                    <ToolField label="File or directory path" htmlFor="chmod-path">
                        <input
                            id="chmod-path"
                            type="text"
                            value={filePath}
                            onChange={(event) => {
                                setFilePath(event.target.value);
                                setCopied(null);
                            }}
                            className="input h-10 font-mono"
                        />
                    </ToolField>

                    <pre className="mt-4 overflow-x-auto rounded-md border bg-muted/20 p-4 font-mono text-sm text-foreground">
                        {command}
                    </pre>

                    <ToolActionBar className="mt-4">
                        <button type="button" onClick={() => copyText('command', command)} className="btn btn-primary gap-2">
                            {copied === 'command' ? <Check className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                            {copied === 'command' ? 'Copied command' : 'Copy command'}
                        </button>
                        <button type="button" onClick={() => copyText('mode', mode)} className="btn btn-secondary gap-2">
                            {copied === 'mode' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {copied === 'mode' ? 'Copied mode' : 'Copy mode'}
                        </button>
                        <button type="button" onClick={reset} className="btn btn-secondary gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </ToolActionBar>
                </ToolPanel>
            </div>
        </ToolLayout>
    );
}
