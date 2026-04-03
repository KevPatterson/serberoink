'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { ContentI18nSection, PortfolioImage, SiteContent } from '@/lib/content';
import { applyAutomaticI18n } from '@/lib/content-translation-core';

type SectionKey = 'portfolio' | 'hero' | 'about' | 'specialties' | 'contact' | 'footer';

const CONTENT_PATH = 'public/content/content.json';

const sectionItems: { key: SectionKey; label: string }[] = [
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About' },
  { key: 'specialties', label: 'Especialidades' },
  { key: 'contact', label: 'Contacto' },
  { key: 'footer', label: 'Footer' },
];

function updateMeta(nextContent: SiteContent): SiteContent {
  return {
    ...nextContent,
    _meta: {
      lastUpdated: new Date().toISOString(),
      version: (nextContent._meta?.version || 0) + 1,
    },
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [section, setSection] = useState<SectionKey>('portfolio');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageYear, setNewImageYear] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
  const [dragSpecialtyIndex, setDragSpecialtyIndex] = useState<number | null>(null);

  const previewContent = useMemo(() => {
    if (!content) return null;
    return applyAutomaticI18n(content);
  }, [content]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cms/content', { cache: 'no-store' });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (!res.ok) throw new Error('No se pudo cargar content.json');
        const data = (await res.json()) as SiteContent;
        setContent(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
      return;
    }
    toast.error(message);
  };

  const persistContent = async (nextContent: SiteContent, message: string) => {
    setSaving(true);
    try {
      const withMeta = updateMeta(nextContent);
      const res = await fetch('/api/cms/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: CONTENT_PATH,
          content: withMeta,
          message,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'No se pudo guardar');
      }

      const payload = (await res.json().catch(() => ({}))) as { content?: SiteContent };
      setContent(payload.content ?? withMeta);
      showToast('success', 'Cambios guardados');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/cms/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Las contrasenas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      showToast('error', 'Minimo 8 caracteres');
      return;
    }
    if (newPassword === currentPassword) {
      showToast('error', 'La nueva contrasena debe ser diferente');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/cms/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(payload.error || 'Error al cambiar contrasena');
      }

      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showToast('success', 'Contrasena actualizada. Inicia sesion de nuevo.');
      setTimeout(() => {
        router.push('/admin/login?passwordChanged=1');
      }, 1500);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadPortfolioImage = async () => {
    if (!content || !uploadFile || !newImageTitle.trim() || !newImageYear.trim()) {
      showToast('error', 'Completa archivo, titulo y anio');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const base64 = await fileToBase64(uploadFile);
      setUploadProgress(45);

      const uploadRes = await fetch('/api/cms/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadFile.name,
          base64,
          mimeType: uploadFile.type,
          message: `cms: upload ${uploadFile.name}`,
        }),
      });

      if (!uploadRes.ok) {
        const payload = (await uploadRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'No se pudo subir la imagen');
      }

      const uploadPayload = (await uploadRes.json()) as { url: string; filename: string };
      setUploadProgress(75);

      const nextImage: PortfolioImage = {
        id: `img_${Date.now()}`,
        src: uploadPayload.url,
        title: newImageTitle.trim(),
        year: newImageYear.trim(),
        category: newImageCategory.trim() || 'general',
      };

      const nextContent: SiteContent = {
        ...content,
        portfolio: {
          ...content.portfolio,
          images: [...content.portfolio.images, nextImage],
        },
      };

      await persistContent(nextContent, `cms: append ${uploadPayload.filename} to content`);
      setUploadProgress(100);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview('');
      setNewImageTitle('');
      setNewImageYear('');
      setNewImageCategory('general');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Error al subir');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  };

  if (loading || !content) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--ink-black)' }} />;
  }

  return (
    <div
      className="min-h-screen md:flex"
      style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}
    >
      <aside className="md:w-64 p-6" style={{ borderRight: '1px solid var(--rule-color)' }}>
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
              onClick={() => setSection(item.key)}
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

        <div className="flex flex-col gap-3">
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
            onClick={handleLogout}
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
            onClick={() => setShowPasswordModal(true)}
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

      <main className="flex-1 p-6 md:p-8 max-w-5xl">
        {section === 'portfolio' && (
          <AdminPortfolio
            content={content}
            saving={saving}
            dragImageIndex={dragImageIndex}
            setDragImageIndex={setDragImageIndex}
            setContent={setContent}
            onSave={() => persistContent(content, 'cms: update portfolio')}
            onDelete={(id) => {
              toast('Eliminar esta imagen? No se puede deshacer.', {
                action: {
                  label: 'Eliminar',
                  onClick: () => {
                    const nextImages = content.portfolio.images.filter((img) => img.id !== id);
                    setContent({
                      ...content,
                      portfolio: { ...content.portfolio, images: nextImages },
                    });
                    toast.success('Imagen eliminada del borrador');
                  },
                },
                cancel: {
                  label: 'Cancelar',
                  onClick: () => {
                    toast.message('Cancelado');
                  },
                },
              });
            }}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        )}

        {section === 'hero' && (
          <AdminHero
            content={content}
            setContent={setContent}
            saving={saving}
            onSave={() => {
              if (
                !content.hero.title.trim() ||
                !content.hero.tagline.trim() ||
                !content.hero.scrollText.trim()
              ) {
                showToast('error', 'Todos los campos de Hero son requeridos');
                return;
              }
              void persistContent(content, 'cms: update hero');
            }}
          />
        )}

        {section === 'about' && (
          <AdminAbout
            content={content}
            setContent={setContent}
            saving={saving}
            onSave={() => {
              if (!content.about.heading.trim() || !content.about.bio.trim()) {
                showToast('error', 'Heading y Bio son requeridos');
                return;
              }
              void persistContent(content, 'cms: update about');
            }}
          />
        )}

        {section === 'specialties' && (
          <AdminSpecialties
            content={content}
            setContent={setContent}
            saving={saving}
            dragSpecialtyIndex={dragSpecialtyIndex}
            setDragSpecialtyIndex={setDragSpecialtyIndex}
            onSave={() => {
              if (content.specialties.items.some((item) => !item.trim())) {
                showToast('error', 'No puede haber especialidades vacias');
                return;
              }
              void persistContent(content, 'cms: update specialties');
            }}
          />
        )}

        {section === 'contact' && (
          <AdminContact
            content={content}
            setContent={setContent}
            saving={saving}
            onSave={() => {
              if (!content.contact.email.trim() || !content.contact.whatsapp.trim()) {
                showToast('error', 'Email y WhatsApp son requeridos');
                return;
              }
              void persistContent(content, 'cms: update contact');
            }}
          />
        )}

        {section === 'footer' && (
          <AdminFooter
            content={content}
            setContent={setContent}
            saving={saving}
            onSave={() => {
              if (!content.footer.brand.trim() || !content.footer.tagline.trim()) {
                showToast('error', 'Brand y tagline son requeridos');
                return;
              }
              void persistContent(content, 'cms: update footer');
            }}
          />
        )}

        {previewContent && <BilingualPreview section={section} content={previewContent} />}
      </main>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: '#111111',
            color: '#F0EAD6',
            border: '1px solid rgba(200,169,110,0.35)',
          },
        }}
      />

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.72)' }}
        >
          <div
            className="w-full max-w-lg p-6"
            style={{ backgroundColor: '#101010', border: '1px solid var(--rule-color)' }}
          >
            <p
              className="font-mono-body mb-5"
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--faded-gold)',
              }}
            >
              Subir imagen
            </p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setUploadFile(file);
                if (!file) {
                  setUploadPreview('');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setUploadPreview((reader.result as string) || '');
                reader.readAsDataURL(file);
              }}
              className="mb-4"
            />

            {uploadPreview && (
              <Image
                src={uploadPreview}
                alt="Preview"
                width={1200}
                height={700}
                unoptimized
                className="w-full h-44 object-cover mb-4"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Titulo"
                className="px-3 py-2 font-mono-body"
                style={inputStyle}
              />
              <input
                value={newImageYear}
                onChange={(e) => setNewImageYear(e.target.value)}
                placeholder="Anio"
                className="px-3 py-2 font-mono-body"
                style={inputStyle}
              />
              <input
                value={newImageCategory}
                onChange={(e) => setNewImageCategory(e.target.value)}
                placeholder="Categoria"
                className="px-3 py-2 font-mono-body"
                style={inputStyle}
              />
            </div>

            {uploading && (
              <div className="mb-4">
                <div style={{ height: '6px', backgroundColor: 'rgba(200,169,110,0.2)' }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: 'var(--faded-gold)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-2 font-mono-body"
                style={ghostButtonStyle}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void uploadPortfolioImage()}
                disabled={uploading}
                className="px-3 py-2 font-mono-body"
                style={primaryButtonStyle}
              >
                {uploading ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.72)' }}
        >
          <div
            className="w-full max-w-md p-6"
            style={{ backgroundColor: '#101010', border: '1px solid var(--rule-color)' }}
          >
            <p
              className="font-mono-body mb-5"
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--faded-gold)',
              }}
            >
              Cambiar contrasena
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="password"
                placeholder="Contrasena actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 font-mono-body"
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Nueva contrasena (min. 8 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 font-mono-body"
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirmar nueva contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 font-mono-body"
                style={inputStyle}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-3 py-2 font-mono-body"
                style={ghostButtonStyle}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleChangePassword()}
                disabled={changingPassword}
                className="px-3 py-2 font-mono-body"
                style={primaryButtonStyle}
              >
                {changingPassword ? 'Guardando...' : 'Cambiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPortfolio(props: {
  content: SiteContent;
  saving: boolean;
  dragImageIndex: number | null;
  setDragImageIndex: (index: number | null) => void;
  setContent: (next: SiteContent) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onOpenUpload: () => void;
}) {
  const {
    content,
    saving,
    dragImageIndex,
    setDragImageIndex,
    setContent,
    onSave,
    onDelete,
    onOpenUpload,
  } = props;

  return (
    <section>
      <SectionTitle title="Portfolio" />
      <button
        type="button"
        onClick={onOpenUpload}
        className="mb-5 px-4 py-2 font-mono-body"
        style={primaryButtonStyle}
      >
        Subir imagen
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.portfolio.images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDragImageIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragImageIndex === null || dragImageIndex === index) return;
              const next = [...content.portfolio.images];
              const [moved] = next.splice(dragImageIndex, 1);
              next.splice(index, 0, moved);
              setContent({ ...content, portfolio: { ...content.portfolio, images: next } });
              setDragImageIndex(null);
            }}
            className="p-3"
            style={{ border: '1px solid var(--rule-color)' }}
          >
            <Image
              src={image.src}
              alt={image.title}
              width={1200}
              height={700}
              unoptimized
              className="w-full h-44 object-cover mb-3"
            />
            <input
              value={image.title}
              onChange={(e) => {
                const next = content.portfolio.images.map((item) =>
                  item.id === image.id ? { ...item, title: e.target.value } : item
                );
                setContent({ ...content, portfolio: { ...content.portfolio, images: next } });
              }}
              className="w-full px-3 py-2 mb-2 font-mono-body"
              style={inputStyle}
            />
            <input
              value={image.year}
              onChange={(e) => {
                const next = content.portfolio.images.map((item) =>
                  item.id === image.id ? { ...item, year: e.target.value } : item
                );
                setContent({ ...content, portfolio: { ...content.portfolio, images: next } });
              }}
              className="w-full px-3 py-2 mb-2 font-mono-body"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => onDelete(image.id)}
              className="font-mono-body"
              style={dangerButtonStyle}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function AdminHero(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, onSave } = props;
  return (
    <section>
      <SectionTitle title="Hero" />
      <InputField
        label="Title"
        value={content.hero.title}
        onChange={(value) => setContent({ ...content, hero: { ...content.hero, title: value } })}
      />
      <InputField
        label="Tagline"
        value={content.hero.tagline}
        onChange={(value) => setContent({ ...content, hero: { ...content.hero, tagline: value } })}
      />
      <InputField
        label="Scroll text"
        value={content.hero.scrollText}
        onChange={(value) =>
          setContent({ ...content, hero: { ...content.hero, scrollText: value } })
        }
      />
      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function AdminAbout(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, onSave } = props;
  return (
    <section>
      <SectionTitle title="About" />
      <InputField
        label="Heading"
        value={content.about.heading}
        onChange={(value) =>
          setContent({ ...content, about: { ...content.about, heading: value } })
        }
      />
      <TextareaField
        label="Bio"
        value={content.about.bio}
        onChange={(value) => setContent({ ...content, about: { ...content.about, bio: value } })}
      />
      <InputField
        label="Quote"
        value={content.about.quote}
        onChange={(value) => setContent({ ...content, about: { ...content.about, quote: value } })}
      />
      <InputField
        label="Location"
        value={content.about.location}
        onChange={(value) =>
          setContent({ ...content, about: { ...content.about, location: value } })
        }
      />
      <InputField
        label="Details"
        value={content.about.details}
        onChange={(value) =>
          setContent({ ...content, about: { ...content.about, details: value } })
        }
      />
      <InputField
        label="Established"
        value={content.about.established}
        onChange={(value) =>
          setContent({ ...content, about: { ...content.about, established: value } })
        }
      />
      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function AdminSpecialties(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  dragSpecialtyIndex: number | null;
  setDragSpecialtyIndex: (index: number | null) => void;
  onSave: () => void;
}) {
  const { content, setContent, saving, dragSpecialtyIndex, setDragSpecialtyIndex, onSave } = props;
  return (
    <section>
      <SectionTitle title="Especialidades" />
      <div className="space-y-2">
        {content.specialties.items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            draggable
            onDragStart={() => setDragSpecialtyIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragSpecialtyIndex === null || dragSpecialtyIndex === index) return;
              const next = [...content.specialties.items];
              const [moved] = next.splice(dragSpecialtyIndex, 1);
              next.splice(index, 0, moved);
              setContent({ ...content, specialties: { ...content.specialties, items: next } });
              setDragSpecialtyIndex(null);
            }}
            className="flex gap-2"
          >
            <input
              value={item}
              onChange={(e) => {
                const next = [...content.specialties.items];
                next[index] = e.target.value;
                setContent({ ...content, specialties: { ...content.specialties, items: next } });
              }}
              className="flex-1 px-3 py-2 font-mono-body"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => {
                const next = content.specialties.items.filter((_, i) => i !== index);
                setContent({ ...content, specialties: { ...content.specialties, items: next } });
              }}
              className="px-3 py-2 font-mono-body"
              style={dangerButtonStyle}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setContent({
            ...content,
            specialties: {
              ...content.specialties,
              items: [...content.specialties.items, 'Nueva especialidad'],
            },
          })
        }
        className="mt-4 px-3 py-2 font-mono-body"
        style={ghostButtonStyle}
      >
        Agregar especialidad
      </button>

      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function AdminContact(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, onSave } = props;

  return (
    <section>
      <SectionTitle title="Contacto" />
      <InputField
        label="Email"
        value={content.contact.email}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, email: value } })
        }
      />
      <InputField
        label="Instagram handle (sin @)"
        value={content.contact.instagram.replace('@', '')}
        onChange={(value) => {
          const clean = value.replace(/^@+/, '');
          setContent({
            ...content,
            contact: {
              ...content.contact,
              instagram: `@${clean}`,
              instagramUrl: `https://instagram.com/${clean}`,
            },
          });
        }}
      />
      <InputField
        label="Instagram URL"
        value={content.contact.instagramUrl}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, instagramUrl: value } })
        }
      />
      <InputField
        label="WhatsApp (solo digitos)"
        value={content.contact.whatsapp}
        onChange={(value) =>
          setContent({
            ...content,
            contact: { ...content.contact, whatsapp: value.replace(/\D+/g, '') },
          })
        }
      />
      <TextareaField
        label="Texto WhatsApp"
        value={content.contact.whatsappText}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, whatsappText: value } })
        }
      />
      <InputField
        label="Texto CTA"
        value={content.contact.ctaText}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, ctaText: value } })
        }
      />
      <InputField
        label="Quote"
        value={content.contact.quote}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, quote: value } })
        }
      />
      <InputField
        label="Location"
        value={content.contact.location}
        onChange={(value) =>
          setContent({ ...content, contact: { ...content.contact, location: value } })
        }
      />
      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function AdminFooter(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, onSave } = props;
  return (
    <section>
      <SectionTitle title="Footer" />
      <InputField
        label="Brand"
        value={content.footer.brand}
        onChange={(value) =>
          setContent({ ...content, footer: { ...content.footer, brand: value } })
        }
      />
      <InputField
        label="Established"
        value={content.footer.established}
        onChange={(value) =>
          setContent({ ...content, footer: { ...content.footer, established: value } })
        }
      />
      <InputField
        label="Rights"
        value={content.footer.rights}
        onChange={(value) =>
          setContent({ ...content, footer: { ...content.footer, rights: value } })
        }
      />
      <InputField
        label="Tagline"
        value={content.footer.tagline}
        onChange={(value) =>
          setContent({ ...content, footer: { ...content.footer, tagline: value } })
        }
      />
      <SaveButton saving={saving} onClick={onSave} />
    </section>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p
      className="font-mono-body mb-6"
      style={{
        fontSize: '0.66rem',
        textTransform: 'uppercase',
        letterSpacing: '0.32em',
        color: 'var(--faded-gold)',
      }}
    >
      {title}
    </p>
  );
}

function InputField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mb-4">
      <label
        className="block mb-2 font-mono-body"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,110,0.7)',
        }}
      >
        {props.label}
      </label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full px-3 py-2 font-mono-body"
        style={inputStyle}
      />
    </div>
  );
}

function TextareaField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mb-4">
      <label
        className="block mb-2 font-mono-body"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,110,0.7)',
        }}
      >
        {props.label}
      </label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 font-mono-body"
        style={inputStyle}
      />
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="mt-4 px-4 py-2 font-mono-body"
      style={primaryButtonStyle}
    >
      {saving ? 'Guardando...' : 'Guardar cambios'}
    </button>
  );
}

function BilingualPreview({ section, content }: { section: SectionKey; content: SiteContent }) {
  const esData = getPreviewSection(content.i18n?.es, section);
  const enData = getPreviewSection(content.i18n?.en, section);

  return (
    <section className="mt-10">
      <SectionTitle title="Vista previa traducciones" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PreviewCard language="ES" data={esData} />
        <PreviewCard language="EN" data={enData} />
      </div>
    </section>
  );
}

function PreviewCard({ language, data }: { language: 'ES' | 'EN'; data: unknown }) {
  return (
    <div
      className="p-4"
      style={{
        border: '1px solid rgba(200,169,110,0.25)',
        backgroundColor: 'rgba(240,234,214,0.02)',
      }}
    >
      <p
        className="font-mono-body mb-3"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded-gold)',
        }}
      >
        {language}
      </p>
      <pre
        className="font-mono-body overflow-auto"
        style={{
          fontSize: '0.64rem',
          lineHeight: 1.6,
          color: 'rgba(240,234,214,0.9)',
          maxHeight: '20rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  );
}

function getPreviewSection(i18n: ContentI18nSection | undefined, section: SectionKey): unknown {
  if (!i18n) return null;

  switch (section) {
    case 'hero':
      return i18n.hero;
    case 'about':
      return i18n.about;
    case 'specialties':
      return i18n.specialties;
    case 'portfolio':
      return i18n.portfolio;
    case 'contact':
      return i18n.contact;
    case 'footer':
      return i18n.footer;
    default:
      return null;
  }
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(240,234,214,0.05)',
  border: '1px solid rgba(200,169,110,0.25)',
  color: 'var(--parchment)',
  fontSize: '0.75rem',
};

const primaryButtonStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--ink-black)',
  backgroundColor: 'var(--faded-gold)',
  border: 'none',
};

const ghostButtonStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--faded-gold)',
  backgroundColor: 'transparent',
  border: '1px solid rgba(200,169,110,0.35)',
};

const dangerButtonStyle: React.CSSProperties = {
  fontSize: '0.58rem',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'rgba(220,120,120,0.95)',
  backgroundColor: 'transparent',
  border: '1px solid rgba(220,120,120,0.4)',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      resolve(value);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}
