import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[#263B35] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-sm',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-sm',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-sm'
  };

  const variantClasses = {
    primary: 'bg-[#263B35] hover:bg-[#1C2D28] text-white border border-[#263B35] shadow-xs active:bg-[#15231F]',
    secondary: 'bg-[#F2F3F0] hover:bg-[#E5E7E3] text-[#202522] border border-[#E5E7E3] active:bg-[#DCDFD9]',
    outline: 'bg-transparent hover:bg-[#F2F3F0] text-[#202522] border border-[#E5E7E3] active:bg-[#E5E7E3]',
    danger: 'bg-[#B44B43] hover:bg-[#9B3D36] text-white border border-[#B44B43] active:bg-[#86332D]',
    ghost: 'bg-transparent hover:bg-[#F2F3F0] text-[#747A75] hover:text-[#202522] border border-transparent'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
