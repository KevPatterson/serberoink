'use client';

import { useMemo, useState } from 'react';
import { useLang } from './LanguageContext';

type Step = 'size' | 'style' | 'complexity' | 'color' | 'result';

interface CalcState {
  size: string;
  style: string;
  complexity: string;
  color: string;
}

interface SizeOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
  sessions: [number, number];
  hours: [number, number];
}

interface StyleOption {
  id: string;
  label: string;
  multiplier: number;
}

interface ComplexityOption {
  id: string;
  label: string;
  desc: string;
  multiplier: number;
}

interface CalculatorCopy {
  sectionBadge: string;
  heading: string;
  headingAccent: string;
  intro: string;
  stepLabels: {
    size: string;
    style: string;
    complexity: string;
    color: string;
    result: string;
  };
  sizeQuestion: string;
  sizeHint: string;
  styleQuestion: string;
  styleHint: string;
  complexityQuestion: string;
  complexityHint: string;
  colorQuestion: string;
  colorHint: string;
  bwLabel: string;
  bwHint: string;
  colorLabel: string;
  colorHintShort: string;
  resultTitle: string;
  startOver: string;
  sessionsLabel: string;
  hoursLabel: string;
  priceLabel: string;
  disclaimer: string;
  cta: string;
  currency: string;
}

const STEPS: Step[] = ['size', 'style', 'complexity', 'color', 'result'];

interface InkCalculatorProps {
  pricePerHour?: number;
  whatsappNumber?: string;
  whatsappBaseText?: string;
}

function createWhatsappUrl(number: string, message: string): string {
  const clean = number.replace(/\D+/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

const SIZES: Record<'es' | 'en', SizeOption[]> = {
  es: [
    { id: 'small', label: 'Pequeño', desc: 'Tamaño moneda o menor', icon: '●', sessions: [1, 1], hours: [1, 2] },
    { id: 'medium', label: 'Mediano', desc: 'Tamaño palma de la mano', icon: '◉', sessions: [1, 2], hours: [2, 4] },
    { id: 'large', label: 'Grande', desc: 'Media manga o panel de espalda', icon: '⬤', sessions: [2, 4], hours: [4, 8] },
    { id: 'full', label: 'Pieza completa', desc: 'Manga completa o espalda completa', icon: '◼', sessions: [4, 8], hours: [8, 20] },
  ],
  en: [
    { id: 'small', label: 'Small', desc: 'Coin-sized or smaller', icon: '●', sessions: [1, 1], hours: [1, 2] },
    { id: 'medium', label: 'Medium', desc: 'Palm-sized', icon: '◉', sessions: [1, 2], hours: [2, 4] },
    { id: 'large', label: 'Large', desc: 'Half-sleeve or back panel', icon: '⬤', sessions: [2, 4], hours: [4, 8] },
    { id: 'full', label: 'Full Piece', desc: 'Full sleeve or back', icon: '◼', sessions: [4, 8], hours: [8, 20] },
  ],
};

const STYLES: Record<'es' | 'en', StyleOption[]> = {
  es: [
    { id: 'fineline', label: 'Línea fina', multiplier: 1 },
    { id: 'blackwork', label: 'Blackwork', multiplier: 1.2 },
    { id: 'realism', label: 'Realismo', multiplier: 1.5 },
    { id: 'neotraditional', label: 'Neo-Tradicional', multiplier: 1.3 },
    { id: 'geometric', label: 'Geométrico', multiplier: 1.1 },
    { id: 'watercolor', label: 'Acuarela', multiplier: 1.2 },
  ],
  en: [
    { id: 'fineline', label: 'Fine Line', multiplier: 1 },
    { id: 'blackwork', label: 'Blackwork', multiplier: 1.2 },
    { id: 'realism', label: 'Realism', multiplier: 1.5 },
    { id: 'neotraditional', label: 'Neo-Traditional', multiplier: 1.3 },
    { id: 'geometric', label: 'Geometric', multiplier: 1.1 },
    { id: 'watercolor', label: 'Watercolor', multiplier: 1.2 },
  ],
};

const COMPLEXITIES: Record<'es' | 'en', ComplexityOption[]> = {
  es: [
    { id: 'simple', label: 'Simple', desc: 'Líneas limpias, mínimo detalle', multiplier: 1 },
    { id: 'medium', label: 'Media', desc: 'Algo de sombreado y detalle', multiplier: 1.3 },
    { id: 'complex', label: 'Compleja', desc: 'Alto detalle y patrones intrincados', multiplier: 1.7 },
  ],
  en: [
    { id: 'simple', label: 'Simple', desc: 'Clean lines, minimal detail', multiplier: 1 },
    { id: 'medium', label: 'Medium', desc: 'Some shading and detail', multiplier: 1.3 },
    { id: 'complex', label: 'Complex', desc: 'High detail, intricate patterns', multiplier: 1.7 },
  ],
};

const COPY: Record<'es' | 'en', CalculatorCopy> = {
  es: {
    sectionBadge: '005 - Herramienta de estimación',
    heading: 'Calculadora de',
    headingAccent: 'Tinta',
    intro: 'Responde unas preguntas y obtén una estimación orientativa de sesiones, horas y precio.',
    stepLabels: {
      size: 'Tamaño',
      style: 'Estilo',
      complexity: 'Complejidad',
      color: 'Color',
      result: 'Resultado',
    },
    sizeQuestion: '¿Qué tamaño tienes en mente?',
    sizeHint: 'Es el factor que más impacta en tiempo y coste.',
    styleQuestion: '¿Qué estilo prefieres?',
    styleHint: 'Cada estilo requiere un ritmo de trabajo distinto.',
    complexityQuestion: '¿Qué nivel de detalle tendrá el diseño?',
    complexityHint: 'A más detalle, más tiempo de sesión.',
    colorQuestion: '¿Incluirá color?',
    colorHint: 'El color suele requerir más pasadas y tiempo de curación.',
    bwLabel: 'Negro y gris',
    bwHint: 'Clásico y atemporal',
    colorLabel: 'Color completo',
    colorHintShort: 'Vibrante y llamativo',
    resultTitle: 'Tu estimación',
    startOver: 'Empezar de nuevo',
    sessionsLabel: 'Sesiones',
    hoursLabel: 'Horas',
    priceLabel: 'Precio est.',
    disclaimer:
      'Estimación orientativa. El presupuesto final depende del diseño, zona, piel y sesión. La consulta define el precio exacto.',
    cta: 'Reservar consulta',
    currency: 'EUR',
  },
  en: {
    sectionBadge: 'Estimate Tool',
    heading: 'Ink',
    headingAccent: 'Calculator',
    intro: 'Answer a few questions and get an orientative estimate for sessions, hours, and price.',
    stepLabels: {
      size: 'Size',
      style: 'Style',
      complexity: 'Complexity',
      color: 'Color',
      result: 'Result',
    },
    sizeQuestion: 'What size are you thinking?',
    sizeHint: 'This is the biggest factor in time and cost.',
    styleQuestion: 'What style do you prefer?',
    styleHint: 'Each style has different time requirements.',
    complexityQuestion: 'How complex is the design?',
    complexityHint: 'More detail means more time.',
    colorQuestion: 'Will it include color?',
    colorHint: 'Color work often requires additional passes and healing time.',
    bwLabel: 'Black & Grey',
    bwHint: 'Classic, timeless',
    colorLabel: 'Full Color',
    colorHintShort: 'Vibrant, bold',
    resultTitle: 'Your estimate',
    startOver: 'Start over',
    sessionsLabel: 'Sessions',
    hoursLabel: 'Hours',
    priceLabel: 'Est. Price',
    disclaimer:
      'This is an orientative estimate. Final pricing depends on design details, placement, skin, and session planning.',
    cta: 'Book consultation',
    currency: 'EUR',
  },
};

function getEstimate(calc: CalcState, lang: 'es' | 'en', pricePerHour: number) {
  const sizeData = SIZES[lang].find((size) => size.id === calc.size);
  const styleData = STYLES[lang].find((style) => style.id === calc.style);
  const complexityData = COMPLEXITIES[lang].find((complexity) => complexity.id === calc.complexity);
  const colorMultiplier = calc.color === 'yes' ? 1.3 : 1;

  if (!sizeData || !styleData || !complexityData) {
    return null;
  }

  const multiplier = styleData.multiplier * complexityData.multiplier * colorMultiplier;
  const minSessions = Math.ceil(sizeData.sessions[0] * multiplier);
  const maxSessions = Math.ceil(sizeData.sessions[1] * multiplier);
  const minHours = Math.round(sizeData.hours[0] * multiplier);
  const maxHours = Math.round(sizeData.hours[1] * multiplier);

  return {
    minSessions,
    maxSessions,
    minHours,
    maxHours,
    minPrice: minHours * pricePerHour,
    maxPrice: maxHours * pricePerHour,
  };
}

export default function InkCalculator({
  pricePerHour = 150,
  whatsappNumber = '',
  whatsappBaseText = '',
}: InkCalculatorProps) {
  const { lang } = useLang();
  const locale = lang === 'en' ? 'en' : 'es';
  const copy = COPY[locale];
  const normalizedRate =
    Number.isFinite(pricePerHour) && pricePerHour > 0 ? Math.round(pricePerHour) : 150;
  const [currentStep, setCurrentStep] = useState<Step>('size');
  const [calc, setCalc] = useState<CalcState>({ size: '', style: '', complexity: '', color: '' });

  const progress = (STEPS.indexOf(currentStep) / (STEPS.length - 1)) * 100;

  const estimate = useMemo(
    () => (currentStep === 'result' ? getEstimate(calc, locale, normalizedRate) : null),
    [calc, currentStep, locale, normalizedRate]
  );
  const selectedSize = SIZES[locale].find((size) => size.id === calc.size);
  const selectedStyle = STYLES[locale].find((style) => style.id === calc.style);
  const selectedComplexity = COMPLEXITIES[locale].find((complexity) => complexity.id === calc.complexity);
  const selectedColor =
    calc.color === 'yes' ? copy.colorLabel : calc.color === 'no' ? copy.bwLabel : '';
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: copy.currency,
      maximumFractionDigits: 0,
    }).format(value);
  const whatsappMessage = useMemo(() => {
    if (!estimate || !selectedSize || !selectedStyle || !selectedComplexity || !selectedColor) {
      return '';
    }

    const rangeText = (min: number, max: number) => (min === max ? String(min) : `${min}-${max}`);
    const greeting = whatsappBaseText.trim();

    if (locale === 'es') {
      return `${greeting || 'Hola, quiero reservar una consulta.'}\n\nDatos del Ink Calculator:\n- Tamaño: ${selectedSize.label}\n- Estilo: ${selectedStyle.label}\n- Complejidad: ${selectedComplexity.label}\n- Color: ${selectedColor}\n- Sesiones estimadas: ${rangeText(estimate.minSessions, estimate.maxSessions)}\n- Horas estimadas: ${rangeText(estimate.minHours, estimate.maxHours)}\n- Presupuesto estimado: ${estimate.minPrice === estimate.maxPrice ? formatPrice(estimate.minPrice) : `${formatPrice(estimate.minPrice)}-${formatPrice(estimate.maxPrice)}`}\n\nMe gustaría agendar una consulta.`;
    }

    return `${greeting || 'Hi, I want to book a consultation.'}\n\nInk Calculator details:\n- Size: ${selectedSize.label}\n- Style: ${selectedStyle.label}\n- Complexity: ${selectedComplexity.label}\n- Color: ${selectedColor}\n- Estimated sessions: ${rangeText(estimate.minSessions, estimate.maxSessions)}\n- Estimated hours: ${rangeText(estimate.minHours, estimate.maxHours)}\n- Estimated budget: ${estimate.minPrice === estimate.maxPrice ? formatPrice(estimate.minPrice) : `${formatPrice(estimate.minPrice)}-${formatPrice(estimate.maxPrice)}`}\n\nI would like to schedule a consultation.`;
  }, [
    estimate,
    formatPrice,
    locale,
    selectedColor,
    selectedComplexity,
    selectedSize,
    selectedStyle,
    whatsappBaseText,
  ]);
  const whatsappUrl =
    whatsappNumber.trim().length > 0 && whatsappMessage
      ? createWhatsappUrl(whatsappNumber, whatsappMessage)
      : '#booking';

  const handleSelect = (field: keyof CalcState, value: string) => {
    setCalc((prev) => ({ ...prev, [field]: value }));
    const nextIndex = STEPS.indexOf(currentStep) + 1;
    if (nextIndex < STEPS.length) {
      setTimeout(() => setCurrentStep(STEPS[nextIndex]), 220);
    }
  };

  const reset = () => {
    setCalc({ size: '', style: '', complexity: '', color: '' });
    setCurrentStep('size');
  };

  return (
    <section id="ink-calculator" className="reveal-section py-20 md:py-32 px-6 md:px-16 lg:px-24" aria-labelledby="ink-calculator-heading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono-body mb-6 text-xs uppercase" style={{ letterSpacing: '0.32em', color: 'var(--faded-gold)', opacity: 0.72 }}>
            {copy.sectionBadge}
          </p>
          <h2 id="ink-calculator-heading" className="font-serif-display" style={{ fontSize: 'clamp(2rem, 6vw, 4.4rem)', fontWeight: 300, lineHeight: 1.02 }}>
            {copy.heading} <span style={{ color: 'var(--blood-red)', fontStyle: 'italic', fontWeight: 800 }}>{copy.headingAccent}</span>
          </h2>
          <p className="font-mono-body mx-auto mt-5" style={{ maxWidth: '44rem', color: 'var(--muted-parchment)', fontSize: '0.78rem', letterSpacing: '0.08em', lineHeight: 1.9 }}>
            {copy.intro}
          </p>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-5 gap-2 font-mono-body text-[0.62rem] uppercase mb-3" style={{ letterSpacing: '0.18em', color: 'var(--muted-parchment)' }}>
            {(Object.keys(copy.stepLabels) as Array<keyof CalculatorCopy['stepLabels']>).map((stepKey, index) => (
              <span key={stepKey} className="text-center" style={{ color: STEPS.indexOf(currentStep) >= index ? 'var(--faded-gold)' : 'var(--muted-parchment)' }}>
                {copy.stepLabels[stepKey]}
              </span>
            ))}
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(200, 169, 110, 0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, rgba(139,0,0,1) 0%, rgba(200,169,110,1) 100%)',
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl p-6 md:p-8 lg:p-10" style={{ border: '1px solid var(--rule-color)', background: 'linear-gradient(180deg, rgba(16,16,16,0.92) 0%, rgba(10,10,10,0.96) 100%)' }}>
          {currentStep === 'size' && (
            <div>
              <h3 className="font-serif-display text-3xl md:text-4xl font-light mb-2">{copy.sizeQuestion}</h3>
              <p className="font-mono-body text-xs mb-8" style={{ color: 'var(--muted-parchment)', letterSpacing: '0.08em' }}>
                {copy.sizeHint}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIZES[locale].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSelect('size', size.id)}
                    className="rounded-xl p-5 text-left transition-all duration-200"
                    style={{
                      border: calc.size === size.id ? '1px solid var(--faded-gold)' : '1px solid rgba(200,169,110,0.22)',
                      backgroundColor: calc.size === size.id ? 'rgba(200,169,110,0.08)' : 'rgba(240,234,214,0.02)',
                    }}
                  >
                    <span className="text-2xl mb-3 block" style={{ color: 'var(--blood-red)' }}>{size.icon}</span>
                    <p className="font-semibold text-parchment mb-1">{size.label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-parchment)' }}>{size.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'style' && (
            <div>
              <h3 className="font-serif-display text-3xl md:text-4xl font-light mb-2">{copy.styleQuestion}</h3>
              <p className="font-mono-body text-xs mb-8" style={{ color: 'var(--muted-parchment)', letterSpacing: '0.08em' }}>
                {copy.styleHint}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STYLES[locale].map((styleOption) => (
                  <button
                    key={styleOption.id}
                    onClick={() => handleSelect('style', styleOption.id)}
                    className="rounded-xl p-4 text-left transition-all duration-200"
                    style={{
                      border: calc.style === styleOption.id ? '1px solid var(--faded-gold)' : '1px solid rgba(200,169,110,0.22)',
                      backgroundColor: calc.style === styleOption.id ? 'rgba(200,169,110,0.08)' : 'rgba(240,234,214,0.02)',
                    }}
                  >
                    <p className="font-semibold text-sm text-parchment">{styleOption.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'complexity' && (
            <div>
              <h3 className="font-serif-display text-3xl md:text-4xl font-light mb-2">{copy.complexityQuestion}</h3>
              <p className="font-mono-body text-xs mb-8" style={{ color: 'var(--muted-parchment)', letterSpacing: '0.08em' }}>
                {copy.complexityHint}
              </p>
              <div className="space-y-3">
                {COMPLEXITIES[locale].map((complexity) => (
                  <button
                    key={complexity.id}
                    onClick={() => handleSelect('complexity', complexity.id)}
                    className="w-full rounded-xl p-4 md:p-5 text-left flex items-center gap-4 transition-all duration-200"
                    style={{
                      border: calc.complexity === complexity.id ? '1px solid var(--faded-gold)' : '1px solid rgba(200,169,110,0.22)',
                      backgroundColor: calc.complexity === complexity.id ? 'rgba(200,169,110,0.08)' : 'rgba(240,234,214,0.02)',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          complexity.id === 'simple' ? 'rgba(34,197,94,0.9)' : complexity.id === 'medium' ? 'rgba(250,204,21,0.9)' : 'rgba(239,68,68,0.9)',
                      }}
                    />
                    <div>
                      <p className="font-semibold text-parchment">{complexity.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-parchment)' }}>{complexity.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'color' && (
            <div>
              <h3 className="font-serif-display text-3xl md:text-4xl font-light mb-2">{copy.colorQuestion}</h3>
              <p className="font-mono-body text-xs mb-8" style={{ color: 'var(--muted-parchment)', letterSpacing: '0.08em' }}>
                {copy.colorHint}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelect('color', 'no')}
                  className="rounded-xl p-6 transition-all duration-200"
                  style={{ border: '1px solid rgba(200,169,110,0.22)', backgroundColor: 'rgba(240,234,214,0.02)' }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(240,234,214,0.06)' }}>
                    <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(161,161,170,1) 0%, rgba(39,39,42,1) 100%)' }} />
                  </div>
                  <p className="font-semibold text-parchment">{copy.bwLabel}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-parchment)' }}>{copy.bwHint}</p>
                </button>
                <button
                  onClick={() => handleSelect('color', 'yes')}
                  className="rounded-xl p-6 transition-all duration-200"
                  style={{ border: '1px solid rgba(200,169,110,0.22)', backgroundColor: 'rgba(240,234,214,0.02)' }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(240,234,214,0.06)' }}>
                    <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,1) 0%, rgba(250,204,21,1) 50%, rgba(59,130,246,1) 100%)' }} />
                  </div>
                  <p className="font-semibold text-parchment">{copy.colorLabel}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-parchment)' }}>{copy.colorHintShort}</p>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'result' && estimate && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif-display text-3xl md:text-4xl font-light">{copy.resultTitle}</h3>
                <button
                  onClick={reset}
                  className="font-mono-body text-xs uppercase transition-colors"
                  style={{ letterSpacing: '0.16em', color: 'var(--muted-parchment)' }}
                >
                  {copy.startOver}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5 text-center" style={{ border: '1px solid var(--rule-color)', backgroundColor: 'rgba(240,234,214,0.02)' }}>
                  <p className="font-mono-body text-[0.62rem] uppercase mb-2" style={{ letterSpacing: '0.16em', color: 'var(--muted-parchment)' }}>
                    {copy.sessionsLabel}
                  </p>
                  <p className="font-serif-display text-4xl">
                    {estimate.minSessions === estimate.maxSessions ? estimate.minSessions : `${estimate.minSessions}-${estimate.maxSessions}`}
                  </p>
                </div>
                <div className="rounded-xl p-5 text-center" style={{ border: '1px solid var(--rule-color)', backgroundColor: 'rgba(240,234,214,0.02)' }}>
                  <p className="font-mono-body text-[0.62rem] uppercase mb-2" style={{ letterSpacing: '0.16em', color: 'var(--muted-parchment)' }}>
                    {copy.hoursLabel}
                  </p>
                  <p className="font-serif-display text-4xl">
                    {estimate.minHours === estimate.maxHours ? estimate.minHours : `${estimate.minHours}-${estimate.maxHours}`}
                  </p>
                </div>
                <div className="rounded-xl p-5 text-center" style={{ border: '1px solid rgba(139,0,0,0.42)', backgroundColor: 'rgba(139,0,0,0.1)' }}>
                  <p className="font-mono-body text-[0.62rem] uppercase mb-2" style={{ letterSpacing: '0.16em', color: 'var(--blood-red)' }}>
                    {copy.priceLabel}
                  </p>
                  <p className="font-serif-display text-4xl">
                    {estimate.minPrice === estimate.maxPrice
                      ? formatPrice(estimate.minPrice)
                      : `${formatPrice(estimate.minPrice)}-${formatPrice(estimate.maxPrice)}`}
                  </p>
                </div>
              </div>

              <p className="font-mono-body text-xs leading-7" style={{ color: 'var(--muted-parchment)', letterSpacing: '0.05em' }}>
                {copy.disclaimer}
              </p>

              <div className="mt-8">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 rounded-full transition-transform duration-200 hover:scale-[1.03]"
                  style={{ backgroundColor: 'var(--blood-red)', color: 'var(--parchment)', fontWeight: 700 }}
                >
                  {copy.cta}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
