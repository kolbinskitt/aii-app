import { PropsWithChildren, CSSProperties } from 'react';

type Props = {
  title?: string;
  className?: string;
  styles?: CSSProperties;
};

export default function Sidebar({
  children,
  title,
  className,
  styles,
}: PropsWithChildren<Props>) {
  return (
    <aside
      className={`relative overflow-y-auto p-4 rounded-2xl shadow-xl
        ${className}`}
      style={styles}
    >
      {/* Tło z blur i półprzezroczystością */}
      <div className="absolute inset-0 rounded-2xl bg-white/40 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/60 to-transparent rounded-b-2xl" />
      </div>

      {/* Zawartość ponad tłem */}
      <div className="relative z-10">
        {!!title && (
          <div className="mb-4">
            <h2 className="text-md font-bold text-gray-800">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </aside>
  );
}
