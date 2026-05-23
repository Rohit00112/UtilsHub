import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Browser-local utilities for everyday work.
          </p>
          <p className="text-center text-sm leading-6 text-muted-foreground md:text-left">
            <Link href="/about" className="font-medium underline underline-offset-4">
              About
            </Link>
            {' · '}
            <Link href="/privacy" className="font-medium underline underline-offset-4">
              Privacy
            </Link>
            {' · '}
            Built by{' '}
            <Link
              href="https://github.com/Rohit00112"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Rohit
            </Link>
            {' · '}
            <Link
              href="https://github.com/Rohit00112/UtilsHub"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Source
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
