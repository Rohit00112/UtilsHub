import Image from 'next/image';

interface LogoMarkProps {
  className?: string;
  priority?: boolean;
}

export default function LogoMark({ className = 'h-8 w-8', priority = false }: LogoMarkProps) {
  return (
    <Image
      src="/favicon.svg"
      alt=""
      width={64}
      height={64}
      className={className}
      priority={priority}
      aria-hidden="true"
    />
  );
}
