import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

export interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel,
  ...props
}) => {
  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      strokeWidth={1.5}
      {...props}
    />
  );
};

export default Icon;
