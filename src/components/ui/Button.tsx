import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'default' | 'submit' | 'danger' | 'fire';
  tooltip?: string;
}

export default function Button({
  kind = 'default',
  className,
  disabled,
  tooltip,
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded font-medium border transition-all duration-150';

  const typeClasses = {
    default: 'bg-white text-black border-black hover:bg-gray-100',
    submit: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
    danger: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
    fire: 'px-4 py-2 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-md shadow hover:brightness-110 transition border-none',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <div title={tooltip}>
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
    </div>
  );
}
