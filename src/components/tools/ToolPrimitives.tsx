import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, Upload, XCircle } from 'lucide-react';

type StatusTone = 'info' | 'success' | 'warning' | 'error';

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

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
        <section className={cx('rounded-lg border bg-card p-5 sm:p-6', className)}>
            {(title || description || actions) && (
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
                        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
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
        <div className={cx('flex flex-wrap items-center gap-2', className)}>
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
        <label className={cx('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40', className)}>
            <div className="mb-3 text-muted-foreground">
                {icon || <Upload className="h-8 w-8" />}
            </div>
            <span className="font-medium text-foreground">{title}</span>
            {description && <span className="mt-1 text-sm text-muted-foreground">{description}</span>}
            <input {...inputProps} className={cx('hidden', inputProps.className)} />
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
        <div className={cx('flex items-start gap-2 rounded-md border px-3 py-2 text-sm', styles[tone], className)}>
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
}: {
    title: string;
    meta?: string;
    actions?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className="rounded-md border bg-muted/30 p-4">
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
