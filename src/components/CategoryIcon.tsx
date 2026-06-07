import {
  Calculator,
  Code2,
  FileText,
  Globe2,
  ImageIcon,
  KeyRound,
  Network,
  Sparkles,
  TextCursorInput,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const categoryIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  text: TextCursorInput,
  image: ImageIcon,
  security: KeyRound,
  calculator: Calculator,
  developer: Code2,
  api: Network,
  web: Globe2,
  special: Sparkles,
};

export function CategoryIcon({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const Icon = categoryIcons[categoryId] || Sparkles;

  return <Icon className={cn('h-5 w-5', className)} aria-hidden="true" />;
}
