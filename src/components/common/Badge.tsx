import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] font-medium px-1.5 py-0.5 gap-1 rounded-[2px]',
    md: 'text-xs font-medium px-2 py-0.5 gap-1.5 rounded-[2px]'
  };

  const variantClasses = {
    default: 'bg-[#F2F3F0] text-[#202522] border border-[#E5E7E3]',
    neutral: 'bg-[#F9F9F8] text-[#747A75] border border-[#E5E7E3]',
    success: 'bg-[#EDF5F1] text-[#2A5C45] border border-[#BDE0D0]',
    warning: 'bg-[#FCF6EE] text-[#8C5D23] border border-[#EED7BA]',
    error: 'bg-[#FDF2F1] text-[#9E3932] border border-[#F3C5C1]',
    outline: 'bg-transparent text-[#202522] border border-[#E5E7E3]'
  };

  return (
    <span
      className={`inline-flex items-center tracking-tight ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
