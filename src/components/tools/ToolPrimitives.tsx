import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info, Upload, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StatusTone = 'info' | 'success' | 'warning' | 'error';

export function ToolPanel({
    title,
    description,
    actions,
    children,
    className,
}: {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('rounded-2xl border bg-card p-4 shadow-sm sm:p-6', className)}>
            {(title || description || actions) && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        {title && <h3 className="text-base font-semibold text-foreground text-balance">{title}</h3>}
                        {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </div>
            )}
            {children}
        </section>
    );
}

export function ToolActionBar({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {children}
        </div>
    );
}

export function ToolUploadZone({
    title,
    description,
    icon,
    inputProps,
    className,
}: {
    title: string;
    description?: string;
    icon?: ReactNode;
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    className?: string;
}) {
    return (
        <label className={cn('flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.035]', className)}>
            <div className="mb-3 text-muted-foreground">
                {icon || <Upload className="h-8 w-8" />}
            </div>
            <span className="font-medium text-foreground">{title}</span>
            {description && <span className="mt-1 text-sm text-muted-foreground">{description}</span>}
            <input {...inputProps} className={cn('hidden', inputProps.className)} />
        </label>
    );
}

export function ToolStatus({
    tone = 'info',
    children,
    className,
}: {
    tone?: StatusTone;
    children: ReactNode;
    className?: string;
}) {
    const styles: Record<StatusTone, string> = {
        info: 'border-border bg-muted/40 text-muted-foreground',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        error: 'border-destructive/30 bg-destructive/10 text-destructive',
    };

    const icons: Record<StatusTone, ReactNode> = {
        info: <Info className="h-4 w-4" />,
        success: <CheckCircle2 className="h-4 w-4" />,
        warning: <AlertCircle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
    };

    return (
        <div className={cn('flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-pretty', styles[tone], className)}>
            <span className="mt-0.5 flex-shrink-0">{icons[tone]}</span>
            <div>{children}</div>
        </div>
    );
}

export function ToolResultCard({
    title,
    meta,
    actions,
    children,
    className,
}: {
    title: string;
    meta?: string;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('rounded-xl border bg-muted/20 p-4', className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h4 className="truncate font-medium text-foreground">{title}</h4>
                    {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}

export function ToolField({
    label,
    description,
    htmlFor,
    children,
    className,
}: {
    label: string;
    description?: string;
    htmlFor?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            <div>
                <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
                    {label}
                </label>
                {description && <p className="mt-1 text-xs text-muted-foreground text-pretty">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export const ToolTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function ToolTextarea(
    { className, ...props },
    ref
) {
    return <textarea ref={ref} {...props} className={cn('textarea font-mono leading-relaxed', className)} />;
});

export function ToolEmptyState({
    icon,
    title,
    description,
    action,
    className,
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center', className)}>
            {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
            <p className="font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 max-w-md text-sm text-muted-foreground text-pretty">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function ToolMetric({
    label,
    value,
    description,
    className,
}: {
    label: string;
    value: ReactNode;
    description?: string;
    className?: string;
}) {
    return (
        <div className={cn('rounded-xl border bg-muted/20 p-4', className)}>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{value}</div>
            {description && <div className="mt-1 text-xs text-muted-foreground text-pretty">{description}</div>}
        </div>
    );
}

export function ToolIconButton({
    className,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50', className)}
        >
            {children}
        </button>
    );
}

export function ToolSegmentedControl<T extends string>({
    value,
    options,
    onChange,
    className,
}: {
    value: T;
    options: Array<{ label: string; value: T }>;
    onChange: (value: T) => void;
    className?: string;
}) {
    return (
        <div className={cn('inline-flex flex-wrap rounded-xl border bg-muted/20 p-1', className)}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                        value === option.value && 'bg-background text-foreground shadow-sm'
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
