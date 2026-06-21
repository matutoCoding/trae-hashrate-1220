import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({
  children,
  hover = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden',
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

Card.Title = function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-800', className)}>
      {children}
    </h3>
  );
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

Card.Body = function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50', className)}>
      {children}
    </div>
  );
};
