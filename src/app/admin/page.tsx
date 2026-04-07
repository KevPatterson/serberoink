'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { ContentI18nSection, PortfolioImage, SiteContent } from '@/lib/content';
import { hasPendingFiles, hasSectionChanged } from '@/lib/admin-change-utils';
import AdminSidebar, { type SectionKey } from './components/AdminSidebar';

type TranslationStatusKind = 'saving' | 'success' | 'warning' | 'error';

interface TranslationStatus {
  visible: boolean;
  kind: TranslationStatusKind;
  message: string;
}

const CONTENT_PATH = 'public/content/content.json';

function updateMeta(nextContent: SiteContent): SiteContent {
  return {
    ...nextContent,
    _meta: {
      lastUpdated: new Date().toISOString(),
      version: (nextContent._meta?.version || 0) + 1,
    },
  };
}

function parsePlacementsInput(rawValue: string): string[] {
  return rawValue
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
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
  const [newImagePlacements, setNewImagePlacements] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [pendingHeroImageFile, setPendingHeroImageFile] = useState<File | null>(null);
  const [pendingAboutImageFile, setPendingAboutImageFile] = useState<File | null>(null);
  const [pendingPortfolioUploads, setPendingPortfolioUploads] = useState<Record<string, File>>({});

  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
  const [dragSpecialtyIndex, setDragSpecialtyIndex] = useState<number | null>(null);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({
    visible: false,
    kind: 'success',
    message: '',
  });
  const [lastSavedContent, setLastSavedContent] = useState<SiteContent | null>(null);

  const previewContent = content;
  const hasPortfolioUnsavedChanges =
    hasPendingFiles(pendingPortfolioUploads) ||
    hasSectionChanged(content?.portfolio, lastSavedContent?.portfolio);
  const hasHeroUnsavedChanges =
    !!pendingHeroImageFile ||
    hasSectionChanged(content?.hero, lastSavedContent?.hero);
  const hasAboutUnsavedChanges =
    !!pendingAboutImageFile ||
    hasSectionChanged(content?.about, lastSavedContent?.about);
  const hasSpecialtiesUnsavedChanges =
    hasSectionChanged(content?.specialties, lastSavedContent?.specialties);
  const hasContactUnsavedChanges =
    hasSectionChanged(content?.contact, lastSavedContent?.contact);
  const hasFooterUnsavedChanges =
    hasSectionChanged(content?.footer, lastSavedContent?.footer);

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
        setLastSavedContent(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  useEffect(() => {
    if (!translationStatus.visible || translationStatus.kind !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTranslationStatus((prev) => ({ ...prev, visible: false }));
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [translationStatus]);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
      return;
    }
    toast.error(message);
  };

  const uploadCmsImage = async (file: File, context: 'portfolio' | 'artist' | 'about') => {
    const base64 = await fileToBase64(file);

    const uploadRes = await fetch('/api/cms/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        base64,
        mimeType: file.type,
        message: `cms: upload ${context} image ${file.name}`,
      }),
    });

    if (!uploadRes.ok) {
      const payload = (await uploadRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error || 'No se pudo subir la imagen');
    }

    const uploadPayload = (await uploadRes.json()) as { url: string };
    return uploadPayload.url;
  };

  const persistContent = async (nextContent: SiteContent, message: string) => {
    setSaving(true);
    setTranslationStatus({
      visible: true,
      kind: 'saving',
      message: 'Guardando cambios y actualizando traducciones...'
    });
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

      if (res.status === 401) {
        setTranslationStatus({
          visible: true,
          kind: 'error',
          message: 'Sesion expirada. Inicia sesion nuevamente para guardar y traducir.',
        });
        showToast('error', 'Sesion expirada. Inicia sesion nuevamente.');
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'No se pudo guardar');
      }

      const payload = (await res.json().catch(() => ({}))) as {
        content?: SiteContent;
        translationWarning?: string;
      };
      const savedContent = payload.content ?? withMeta;
      setContent(savedContent);
      setLastSavedContent(savedContent);
      if (payload.translationWarning) {
        setTranslationStatus({
          visible: true,
          kind: 'warning',
          message: payload.translationWarning,
        });
        toast.error(payload.translationWarning);
      } else {
        setTranslationStatus({
          visible: true,
          kind: 'success',
          message: 'Traducciones actualizadas correctamente en este guardado.',
        });
      }
      showToast('success', 'Cambios guardados');
    } catch (error) {
      setTranslationStatus({
        visible: true,
        kind: 'error',
        message: error instanceof Error ? error.message : 'Error al guardar y traducir',
      });
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

  const queuePortfolioImage = () => {
    if (!content || !uploadFile || !newImageTitle.trim() || !newImageYear.trim()) {
      showToast('error', 'Completa archivo, titulo y anio');
      return;
    }

    const nextId = `img_${Date.now()}`;
    const nextImage: PortfolioImage = {
      id: nextId,
      src: uploadPreview,
      title: newImageTitle.trim(),
      year: newImageYear.trim(),
      category: newImageCategory.trim() || 'general',
      placements: parsePlacementsInput(newImagePlacements),
    };

    const nextContent: SiteContent = {
      ...content,
      portfolio: {
        ...content.portfolio,
        images: [...content.portfolio.images, nextImage],
      },
    };

    setContent(nextContent);
    setPendingPortfolioUploads((prev) => ({ ...prev, [nextId]: uploadFile }));
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadPreview('');
    setNewImageTitle('');
    setNewImageYear('');
    setNewImageCategory('general');
    setNewImagePlacements('');
    showToast('success', 'Imagen en cola. Se subira al guardar cambios.');
  };

  if (loading || !content) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--ink-black)' }} />;
  }

  return (
    <div
      className="min-h-screen md:flex"
      style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}
    >
      <AdminSidebar
        section={section}
        onSectionChange={setSection}
        onLogout={handleLogout}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
      />

      <main className="flex-1 p-6 md:p-8 max-w-5xl">
        {translationStatus.visible && <TranslationStatusBanner status={translationStatus} />}

        {section === 'portfolio' && (
          <AdminPortfolio
            content={content}
            saving={saving}
            hasUnsavedChanges={hasPortfolioUnsavedChanges}
            dragImageIndex={dragImageIndex}
            setDragImageIndex={setDragImageIndex}
            setContent={setContent}
            pendingImageIds={Object.keys(pendingPortfolioUploads)}
            onSave={(currentContent) => {
              if (!hasPortfolioUnsavedChanges) {
                showToast('success', 'No hay cambios en Portfolio para guardar.');
                return;
              }

              void (async () => {
                let nextContent = currentContent;

                try {
                  for (const image of currentContent.portfolio.images) {
                    const pendingFile = pendingPortfolioUploads[image.id];
                    if (!pendingFile) {
                      continue;
                    }

                    const uploadedUrl = await uploadCmsImage(pendingFile, 'portfolio');
                    nextContent = {
                      ...nextContent,
                      portfolio: {
                        ...nextContent.portfolio,
                        images: nextContent.portfolio.images.map((item) =>
                          item.id === image.id ? { ...item, src: uploadedUrl } : item
                        ),
                      },
                    };
                  }
                } catch (error) {
                  showToast('error', error instanceof Error ? error.message : 'Error al subir imagenes pendientes');
                  return;
                }

                await persistContent(nextContent, 'cms: update portfolio');
                setPendingPortfolioUploads({});
              })();
            }}
            onDelete={(id) => {
              toast('Eliminar esta imagen? No se puede deshacer.', {
                action: {
                  label: 'Eliminar',
                  onClick: () => {
                    const nextImages = content.portfolio.images.filter((img) => img.id !== id);
                    const nextContent = {
                      ...content,
                      portfolio: { ...content.portfolio, images: nextImages },
                    };
                    setContent(nextContent);
                    setPendingPortfolioUploads((prev) => {
                      const next = { ...prev };
                      delete next[id];
                      return next;
                    });
                    showToast('success', 'Imagen eliminada. Guarda cambios para aplicar.');
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
            hasUnsavedChanges={hasHeroUnsavedChanges}
            pendingImageFileName={pendingHeroImageFile?.name ?? null}
            onSelectImageFile={setPendingHeroImageFile}
            onSave={() => {
              if (!hasHeroUnsavedChanges) {
                showToast('success', 'No hay cambios en Hero para guardar.');
                return;
              }

              void (async () => {
                let nextContent = content;

                if (pendingHeroImageFile) {
                  try {
                    const uploadedUrl = await uploadCmsImage(pendingHeroImageFile, 'artist');
                    nextContent = {
                      ...nextContent,
                      hero: { ...nextContent.hero, artistImageSrc: uploadedUrl },
                    };
                    setContent(nextContent);
                  } catch (error) {
                    showToast('error', error instanceof Error ? error.message : 'Error al subir imagen');
                    return;
                  }
                }

                if (
                  !nextContent.hero.title.trim() ||
                  !nextContent.hero.tagline.trim() ||
                  !nextContent.hero.scrollText.trim()
                ) {
                  showToast('error', 'Todos los campos de Hero son requeridos');
                  return;
                }
                await persistContent(nextContent, 'cms: update hero');
                setPendingHeroImageFile(null);
              })();
            }}
          />
        )}

        {section === 'about' && (
          <AdminAbout
            content={content}
            setContent={setContent}
            saving={saving}
            hasUnsavedChanges={hasAboutUnsavedChanges}
            pendingImageFileName={pendingAboutImageFile?.name ?? null}
            onSelectImageFile={setPendingAboutImageFile}
            onSave={() => {
              if (!hasAboutUnsavedChanges) {
                showToast('success', 'No hay cambios en About para guardar.');
                return;
              }

              void (async () => {
                let nextContent = content;

                if (pendingAboutImageFile) {
                  try {
                    const uploadedUrl = await uploadCmsImage(pendingAboutImageFile, 'about');
                    nextContent = {
                      ...nextContent,
                      about: { ...nextContent.about, imageSrc: uploadedUrl },
                    };
                    setContent(nextContent);
                  } catch (error) {
                    showToast('error', error instanceof Error ? error.message : 'Error al subir imagen');
                    return;
                  }
                }

                if (!nextContent.about.heading.trim() || !nextContent.about.bio.trim()) {
                  showToast('error', 'Heading y Bio son requeridos');
                  return;
                }
                await persistContent(nextContent, 'cms: update about');
                setPendingAboutImageFile(null);
              })();
            }}
          />
        )}

        {section === 'specialties' && (
          <AdminSpecialties
            content={content}
            setContent={setContent}
            saving={saving}
            hasUnsavedChanges={hasSpecialtiesUnsavedChanges}
            dragSpecialtyIndex={dragSpecialtyIndex}
            setDragSpecialtyIndex={setDragSpecialtyIndex}
            onSave={() => {
              if (!hasSpecialtiesUnsavedChanges) {
                showToast('success', 'No hay cambios en Especialidades para guardar.');
                return;
              }

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
            hasUnsavedChanges={hasContactUnsavedChanges}
            onSave={() => {
              if (!hasContactUnsavedChanges) {
                showToast('success', 'No hay cambios en Contacto para guardar.');
                return;
              }

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
            hasUnsavedChanges={hasFooterUnsavedChanges}
            onSave={() => {
              if (!hasFooterUnsavedChanges) {
                showToast('success', 'No hay cambios en Footer para guardar.');
                return;
              }

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
              className="font-mono-body mb-5 break-words leading-relaxed"
              style={{
                fontSize: '0.64rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
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
              className="mb-4 w-full font-mono-body text-[0.62rem] leading-relaxed text-[rgba(240,234,214,0.82)]"
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

            <input
              value={newImagePlacements}
              onChange={(e) => setNewImagePlacements(e.target.value)}
              placeholder="Ubicaciones (coma separadas): arm, forearm, ribs"
              className="mb-2 w-full px-3 py-2 font-mono-body"
              style={inputStyle}
            />
            <p
              className="mb-4 font-mono-body"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(240,234,214,0.65)',
              }}
            >
              Claves sugeridas: head, neck, chest, ribs, stomach, shoulder, upper-back, lower-back, arm, forearm, hand, thigh, knee, calf, ankle.
            </p>

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
                onClick={queuePortfolioImage}
                className="px-3 py-2 font-mono-body"
                style={primaryButtonStyle}
              >
                Agregar
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
  hasUnsavedChanges: boolean;
  dragImageIndex: number | null;
  setDragImageIndex: (index: number | null) => void;
  setContent: (next: SiteContent) => void;
  pendingImageIds: string[];
  onSave: (currentContent: SiteContent) => void;
  onDelete: (id: string) => void;
  onOpenUpload: () => void;
}) {
  const {
    content,
    saving,
    hasUnsavedChanges,
    dragImageIndex,
    setDragImageIndex,
    setContent,
    pendingImageIds,
    onSave,
    onDelete,
    onOpenUpload,
  } = props;

  const pendingSet = new Set(pendingImageIds);

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
      {pendingImageIds.length > 0 && (
        <p
          className="mb-4 font-mono-body break-words leading-relaxed"
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.06em',
            color: 'rgba(240,234,214,0.8)',
          }}
        >
          {pendingImageIds.length} imagen(es) pendiente(s) por subir. Se enviaran a GitHub al guardar.
        </p>
      )}
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
            {pendingSet.has(image.id) && (
              <p
                className="mb-2 font-mono-body"
                style={{
                  fontSize: '0.54rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,195,95,0.95)',
                }}
              >
                Pendiente de subida
              </p>
            )}
            <Image
              src={image.src}
              alt={image.title}
              width={1200}
              height={700}
              priority={index === 0}
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
            <input
              value={(image.placements ?? []).join(', ')}
              onChange={(e) => {
                const nextPlacements = parsePlacementsInput(e.target.value);
                const next = content.portfolio.images.map((item) =>
                  item.id === image.id ? { ...item, placements: nextPlacements } : item
                );
                setContent({ ...content, portfolio: { ...content.portfolio, images: next } });
              }}
              placeholder="Ubicaciones: arm, forearm"
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
      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="Portfolio" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={() => onSave(content)} />
    </section>
  );
}

function AdminHero(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
  pendingImageFileName: string | null;
  onSelectImageFile: (file: File | null) => void;
  onSave: () => void;
}) {
  const {
    content,
    setContent,
    saving,
    hasUnsavedChanges,
    pendingImageFileName,
    onSelectImageFile,
    onSave,
  } = props;
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
      <ImageUploadField
        label="Imagen del artista"
        value={content.hero.artistImageSrc}
        altValue={content.hero.artistImageAlt}
        onChangeValue={(value) =>
          setContent({ ...content, hero: { ...content.hero, artistImageSrc: value } })
        }
        onChangeAlt={(value) =>
          setContent({ ...content, hero: { ...content.hero, artistImageAlt: value } })
        }
        pendingFileName={pendingImageFileName}
        onSelectFile={onSelectImageFile}
      />
      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="Hero" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={onSave} />
    </section>
  );
}

function AdminAbout(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
  pendingImageFileName: string | null;
  onSelectImageFile: (file: File | null) => void;
  onSave: () => void;
}) {
  const {
    content,
    setContent,
    saving,
    hasUnsavedChanges,
    pendingImageFileName,
    onSelectImageFile,
    onSave,
  } = props;
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
      <ImageUploadField
        label="Imagen seccion Sobre mi"
        value={content.about.imageSrc}
        altValue={content.about.imageAlt}
        onChangeValue={(value) =>
          setContent({ ...content, about: { ...content.about, imageSrc: value } })
        }
        onChangeAlt={(value) =>
          setContent({ ...content, about: { ...content.about, imageAlt: value } })
        }
        pendingFileName={pendingImageFileName}
        onSelectFile={onSelectImageFile}
      />
      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="About" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={onSave} />
    </section>
  );
}

function AdminSpecialties(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
  dragSpecialtyIndex: number | null;
  setDragSpecialtyIndex: (index: number | null) => void;
  onSave: () => void;
}) {
  const {
    content,
    setContent,
    saving,
    hasUnsavedChanges,
    dragSpecialtyIndex,
    setDragSpecialtyIndex,
    onSave,
  } = props;
  return (
    <section>
      <SectionTitle title="Especialidades" />
      <div className="space-y-2">
        {content.specialties.items.map((item, index) => (
          <div
            key={index}
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

      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="Especialidades" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={onSave} />
    </section>
  );
}

function AdminContact(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, hasUnsavedChanges, onSave } = props;

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
      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="Contacto" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={onSave} />
    </section>
  );
}

function AdminFooter(props: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}) {
  const { content, setContent, saving, hasUnsavedChanges, onSave } = props;
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
      {!hasUnsavedChanges && (
        <SectionNoChangesMessage sectionName="Footer" />
      )}
      <SaveButton saving={saving} disabled={!hasUnsavedChanges} onClick={onSave} />
    </section>
  );
}

function SectionNoChangesMessage({ sectionName }: { sectionName: string }) {
  return (
    <p
      className="mt-4 font-mono-body"
      style={{
        fontSize: '0.56rem',
        letterSpacing: '0.08em',
        color: 'rgba(240,234,214,0.55)',
      }}
    >
      Sin cambios pendientes en {sectionName}.
    </p>
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
          fontSize: '0.54rem',
          letterSpacing: '0.08em',
          textTransform: 'none',
          color: 'rgba(240,234,214,0.62)',
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
          fontSize: '0.54rem',
          letterSpacing: '0.08em',
          textTransform: 'none',
          color: 'rgba(240,234,214,0.62)',
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

function ImageUploadField(props: {
  label: string;
  value: string;
  altValue: string;
  onChangeValue: (value: string) => void;
  onChangeAlt: (value: string) => void;
  pendingFileName: string | null;
  onSelectFile: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState('');

  const previewSrc = preview || props.value;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      props.onSelectFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview((reader.result as string) || '');
    reader.readAsDataURL(file);

    props.onSelectFile(file);
    toast.message('Imagen lista. Se subira cuando guardes cambios.');
  };

  return (
    <div
      className="mb-6 p-4"
      style={{
        border: '1px solid rgba(200,169,110,0.16)',
        borderRadius: '0.55rem',
        backgroundColor: 'rgba(240,234,214,0.02)',
      }}
    >
      <label
        className="block mb-2 font-mono-body"
        style={{
          fontSize: '0.54rem',
          letterSpacing: '0.08em',
          textTransform: 'none',
          color: 'rgba(240,234,214,0.62)',
        }}
      >
        {props.label}
      </label>

      <input
        value={props.value}
        onChange={(event) => props.onChangeValue(event.target.value)}
        placeholder="URL de imagen"
        className="w-full px-3 py-2 mb-3 font-mono-body"
        style={inputStyle}
      />

      <input
        value={props.altValue}
        onChange={(event) => props.onChangeAlt(event.target.value)}
        placeholder="Texto alternativo (accesibilidad)"
        className="w-full px-3 py-2 mb-3 font-mono-body"
        style={inputStyle}
      />

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          handleFileChange(event);
        }}
        className="mb-3 w-full font-mono-body text-[0.62rem] leading-relaxed text-[rgba(240,234,214,0.82)]"
      />

      {props.pendingFileName && (
        <p
          className="mb-3 font-mono-body break-all leading-relaxed"
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.06em',
            color: 'rgba(240,234,214,0.75)',
          }}
        >
          Archivo pendiente: {props.pendingFileName}
        </p>
      )}

      {previewSrc && (
        <Image
          src={previewSrc}
          alt={props.altValue || props.label}
          width={1200}
          height={700}
          unoptimized
          className="w-full h-48 object-cover"
        />
      )}

      <p
        className="mt-2 font-mono-body break-words leading-relaxed"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.06em',
          color: 'rgba(240,234,214,0.62)',
        }}
      >
        La imagen seleccionada no se sube a GitHub hasta que pulses "Guardar cambios".
      </p>
    </div>
  );
}

function SaveButton({
  saving,
  disabled = false,
  onClick,
}: {
  saving: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isDisabled = saving || disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="mt-4 px-4 py-2 font-mono-body"
      style={
        isDisabled
          ? {
              ...primaryButtonStyle,
              opacity: 0.45,
              cursor: 'not-allowed',
            }
          : primaryButtonStyle
      }
    >
      {saving ? 'Guardando...' : 'Guardar cambios'}
    </button>
  );
}

function TranslationStatusBanner({ status }: { status: TranslationStatus }) {
  const palette: Record<TranslationStatusKind, { border: string; background: string; color: string; label: string }> = {
    saving: {
      border: '1px solid rgba(200,169,110,0.45)',
      background: 'rgba(200,169,110,0.09)',
      color: 'var(--faded-gold)',
      label: 'EN CURSO',
    },
    success: {
      border: '1px solid rgba(120,190,140,0.5)',
      background: 'rgba(120,190,140,0.1)',
      color: 'rgba(140,210,160,0.95)',
      label: 'OK',
    },
    warning: {
      border: '1px solid rgba(230,180,90,0.55)',
      background: 'rgba(230,180,90,0.12)',
      color: 'rgba(245,195,95,0.95)',
      label: 'WARNING',
    },
    error: {
      border: '1px solid rgba(220,120,120,0.6)',
      background: 'rgba(220,120,120,0.12)',
      color: 'rgba(235,140,140,0.95)',
      label: 'ERROR',
    },
  };

  const styles = palette[status.kind];

  return (
    <section
      className="mb-5 p-3"
      aria-live="polite"
      style={{
        border: styles.border,
        backgroundColor: styles.background,
      }}
    >
      <p
        className="font-mono-body mb-1"
        style={{
          fontSize: '0.56rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: styles.color,
        }}
      >
        Estado traduccion: {styles.label}
      </p>
      <p
        className="font-mono-body"
        style={{
          fontSize: '0.66rem',
          lineHeight: 1.6,
          color: 'rgba(240,234,214,0.9)',
        }}
      >
        {status.message}
      </p>
    </section>
  );
}

function BilingualPreview({ section, content }: { section: SectionKey; content: SiteContent }) {
  const esData = getPreviewSection(content.i18n?.es, section);
  const enData = getPreviewSection(content.i18n?.en, section);

  return (
    <section className="mt-12">
      <SectionTitle title="Vista editorial por idioma" />
      <p
        className="mb-5 font-mono-body"
        style={{
          fontSize: '0.62rem',
          letterSpacing: '0.08em',
          color: 'rgba(240,234,214,0.75)',
        }}
      >
        Asi se lee el contenido para cada idioma, sin formato tecnico. Guarda cambios para actualizar.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PreviewCard language="ES" section={section} data={esData} />
        <PreviewCard language="EN" section={section} data={enData} />
      </div>
    </section>
  );
}

function PreviewCard({ language, section, data }: { language: 'ES' | 'EN'; section: SectionKey; data: unknown }) {
  const model = toPreviewModel(section, data);

  return (
    <div
      className="p-5 md:p-6"
      style={{
        border: '1px solid rgba(200,169,110,0.2)',
        borderRadius: '0.55rem',
        backgroundColor: 'rgba(14,14,14,0.78)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p
            className="font-mono-body mb-1"
            style={{
              fontSize: '0.56rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.95)',
            }}
          >
            Idioma {language}
          </p>
          <p
            className="font-serif-display"
            style={{
              fontSize: '1.14rem',
              color: 'rgba(240,234,214,0.95)',
              lineHeight: 1.3,
            }}
          >
            {model.title}
          </p>
        </div>
        <p
          className="font-mono-body"
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.7)',
          }}
        >
          Vista rapida
        </p>
      </div>

      {model.subtitle && (
        <p
          className="mb-4"
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.7,
            color: 'rgba(240,234,214,0.82)',
          }}
        >
          {model.subtitle}
        </p>
      )}

      {model.imageSrc && (
        <div className="mb-4 overflow-hidden" style={{ borderRadius: '0.6rem' }}>
          <Image
            src={model.imageSrc}
            alt={model.imageAlt || model.title}
            width={1200}
            height={700}
            unoptimized
            className="w-full h-44 md:h-52 object-cover"
          />
        </div>
      )}

      {model.fields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {model.fields.map((field) => (
            <div
              key={`${field.label}-${field.value}`}
              className="p-3"
              style={{
                border: '1px solid rgba(200,169,110,0.16)',
                borderRadius: '0.45rem',
                backgroundColor: 'rgba(240,234,214,0.02)',
              }}
            >
              <p
                className="font-mono-body mb-1"
                style={{
                  fontSize: '0.5rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(200,169,110,0.85)',
                }}
              >
                {field.label}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(240,234,214,0.88)', lineHeight: 1.5 }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {model.items.length > 0 && (
        <div
          className="p-3 mb-4"
          style={{
            borderRadius: '0.45rem',
            border: '1px solid rgba(200,169,110,0.14)',
            backgroundColor: 'rgba(240,234,214,0.02)',
          }}
        >
          <p
            className="font-mono-body mb-2"
            style={{
              fontSize: '0.54rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.9)',
            }}
          >
            Puntos clave
          </p>
          <ul className="space-y-1.5 pl-4" style={{ color: 'rgba(240,234,214,0.88)' }}>
            {model.items.map((item, index) => (
              <li key={`${item}-${index}`} style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p
        className="font-mono-body"
        style={{
          fontSize: '0.54rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(240,234,214,0.55)',
        }}
      >
        Representacion visual del contenido publicado
      </p>
    </div>
  );
}

function toPreviewModel(section: SectionKey, data: unknown): {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  fields: Array<{ label: string; value: string }>;
  items: string[];
} {
  const fallback = {
    title: 'Sin contenido cargado',
    subtitle: 'Aun no hay una traduccion disponible para esta seccion.',
    imageSrc: '',
    imageAlt: '',
    fields: [] as Array<{ label: string; value: string }>,
    items: [] as string[],
  };

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const sectionData = data as Record<string, unknown>;

  if (section === 'hero') {
    return {
      title: getText(sectionData.title, 'Hero principal'),
      subtitle: getText(sectionData.tagline, 'Sin subtitulo'),
      imageSrc: getText(sectionData.artistImageSrc),
      imageAlt: getText(sectionData.artistImageAlt),
      fields: [{ label: 'Texto de desplazamiento', value: getText(sectionData.scrollText, 'No definido') }],
      items: [],
    };
  }

  if (section === 'about') {
    return {
      title: getText(sectionData.heading, 'Sobre el artista'),
      subtitle: getText(sectionData.bio, 'Sin descripcion disponible.'),
      imageSrc: getText(sectionData.imageSrc),
      imageAlt: getText(sectionData.imageAlt),
      fields: [
        { label: 'Frase', value: getText(sectionData.quote, 'No definida') },
        { label: 'Ubicacion', value: getText(sectionData.location, 'No definida') },
        { label: 'Detalles', value: getText(sectionData.details, 'No definidos') },
        { label: 'Desde', value: getText(sectionData.established, 'No definido') },
      ],
      items: [],
    };
  }

  if (section === 'specialties') {
    return {
      title: getText(sectionData.sectionLabel, 'Especialidades'),
      subtitle: 'Resumen de estilos disponibles en el estudio.',
      imageSrc: '',
      imageAlt: '',
      fields: [{ label: 'Numero de seccion', value: getText(sectionData.sectionNumber, 'No definido') }],
      items: toTextList(sectionData.items),
    };
  }

  if (section === 'portfolio') {
    const images = Array.isArray(sectionData.images)
      ? (sectionData.images as Array<Record<string, unknown>>)
      : [];

    const featuredImage = images.find(
      (image) => image && typeof image === 'object' && typeof image.src === 'string' && image.src.trim().length > 0
    ) ?? null;

    const items = images.slice(0, 5).map((image, index) => {
      const title = getText(image.title, `Pieza ${index + 1}`);
      const year = getText(image.year);
      const category = getText(image.category);
      return [title, year, category].filter(Boolean).join(' · ');
    });

    return {
      title: getText(sectionData.sectionLabel, 'Galeria de trabajos'),
      subtitle: getText(sectionData.subtitle, 'Seleccion visual de trabajos recientes.'),
      imageSrc: getText(featuredImage?.src),
      imageAlt: getText(featuredImage?.title, 'Pieza destacada'),
      fields: [{ label: 'Piezas visibles', value: `${images.length}` }],
      items,
    };
  }

  if (section === 'contact') {
    return {
      title: getText(sectionData.heading, 'Reservas y contacto'),
      subtitle: getText(sectionData.quote, 'Canales para agendar una sesion.'),
      imageSrc: '',
      imageAlt: '',
      fields: [
        { label: 'Email', value: getText(sectionData.email, 'No definido') },
        { label: 'Instagram', value: getText(sectionData.instagram, 'No definido') },
        { label: 'Ubicacion', value: getText(sectionData.location, 'No definida') },
        { label: 'WhatsApp', value: getText(sectionData.whatsapp, 'No definido') },
      ],
      items: [getText(sectionData.ctaText), getText(sectionData.whatsappText)].filter(Boolean),
    };
  }

  if (section === 'footer') {
    return {
      title: getText(sectionData.brand, 'Marca del estudio'),
      subtitle: getText(sectionData.tagline, 'Sin frase disponible.'),
      imageSrc: '',
      imageAlt: '',
      fields: [
        { label: 'Fundado', value: getText(sectionData.established, 'No definido') },
        { label: 'Derechos', value: getText(sectionData.rights, 'No definido') },
      ],
      items: [],
    };
  }

  return fallback;
}

function getText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

function toTextList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => getText(item))
    .filter(Boolean);
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
  backgroundColor: 'rgba(240,234,214,0.025)',
  border: '1px solid rgba(200,169,110,0.16)',
  borderRadius: '0.45rem',
  color: 'var(--parchment)',
  fontSize: '0.72rem',
  lineHeight: 1.45,
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
