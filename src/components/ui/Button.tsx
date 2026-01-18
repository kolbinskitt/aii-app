import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonKind = 'default' | 'submit' | 'danger' | 'primary' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  tooltip?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function Button({
  kind = 'default',
  size = 'medium',
  className,
  disabled,
  tooltip,
  icon,
  children,
  loading = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded-md box-border';

  const sizeClasses: Record<ButtonSize, string> = {
    small: 'px-2 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const typeClasses: Record<ButtonKind, string> = {
    default: 'bg-white text-black border border-black hover:bg-gray-100',
    submit:
      'bg-green-600 text-white hover:bg-green-500 border border-green-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow hover:brightness-110 border border-blue-600',
    ghost:
      'bg-transparent text-current border border-transparent hover:bg-zinc-100 hover:text-black',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <div title={tooltip}>
      <button
        {...props}
        disabled={disabled || loading}
        className={clsx(
          baseClasses,
          sizeClasses[size],
          typeClasses[kind],
          (disabled || loading) && disabledClasses,
          className,
        )}
      >
        {loading ? (
          <div className="spinner animate-spin h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
        ) : (
          icon && <span className="inline-flex">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    </div>
  );
}
