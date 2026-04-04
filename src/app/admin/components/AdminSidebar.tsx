import Link from 'next/link';

export type SectionKey = 'portfolio' | 'hero' | 'about' | 'specialties' | 'contact' | 'footer';

export const sectionItems: { key: SectionKey; label: string }[] = [
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About' },
  { key: 'specialties', label: 'Especialidades' },
  { key: 'contact', label: 'Contacto' },
  { key: 'footer', label: 'Footer' },
];

interface AdminSidebarProps {
  section: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
}

export default function AdminSidebar({
  section,
  onSectionChange,
  onLogout,
  onOpenPasswordModal,
}: AdminSidebarProps) {
  return (
    <aside
      className="md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen p-6 flex flex-col"
      style={{ borderRight: '1px solid var(--rule-color)' }}
    >
      <p
        className="font-serif-display"
        style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--faded-gold)' }}
      >
        SERBERO INK
      </p>
      <p
        className="font-mono-body mb-6"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,110,0.65)',
        }}
      >
        Admin CMS
      </p>

      <div className="space-y-1 mb-8">
        {sectionItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange(item.key)}
            className="w-full text-left px-3 py-2 font-mono-body"
            style={{
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: section === item.key ? 'var(--faded-gold)' : 'rgba(240,234,214,0.5)',
              borderLeft:
                section === item.key ? '1px solid var(--faded-gold)' : '1px solid transparent',
              backgroundColor: section === item.key ? 'rgba(200,169,110,0.08)' : 'transparent',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href="/homepage"
          className="font-mono-body"
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,234,214,0.55)',
            textDecoration: 'none',
          }}
        >
          Volver al sitio
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="font-mono-body text-left"
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(220,120,120,0.95)',
            background: 'none',
            border: 'none',
          }}
        >
          Cerrar sesion
        </button>
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="font-mono-body text-left"
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.7)',
            background: 'none',
            border: 'none',
          }}
        >
          Cambiar contrasena
        </button>
      </div>
    </aside>
  );
}
