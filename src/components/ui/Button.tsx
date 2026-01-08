import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'default' | 'submit' | 'danger';
}

export default function Button({
  kind = 'default',
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded font-medium border transition-all duration-150';

  const typeClasses = {
    default: 'bg-white text-black border-black hover:bg-gray-100',
    submit: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
    danger: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        baseClasses,
        typeClasses[kind],
        disabled && disabledClasses,
        className,
      )}
    />
  );
}
