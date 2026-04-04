"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface TattooPlacementMapProps {
  onZoneClick?: (zone: string) => void;
  className?: string;
  lang?: "es" | "en";
}

type ZoneKey =
  | "head" | "neck" | "chest"
  | "left-arm" | "right-arm"
  | "left-forearm" | "right-forearm"
  | "left-hand" | "right-hand"
  | "ribs" | "stomach"
  | "left-thigh" | "right-thigh"
  | "left-shin" | "right-shin"
  | "left-foot" | "right-foot"
  | "upper-back" | "lower-back";

type ZoneInfo = { label: string; labelEs: string; pain: 1|2|3|4|5; healing: string };
type BodyView = "front" | "back";

const ZONE_DATA: Record<ZoneKey, ZoneInfo> = {
  head:            { label: "Head",          labelEs: "Cabeza",              pain: 3, healing: "2-4 semanas" },
  neck:            { label: "Neck",          labelEs: "Cuello",              pain: 4, healing: "3-5 semanas" },
  chest:           { label: "Chest",         labelEs: "Pecho",               pain: 3, healing: "3-6 semanas" },
  "left-arm":      { label: "Left Arm",      labelEs: "Brazo Izquierdo",     pain: 2, healing: "2-4 semanas" },
  "right-arm":     { label: "Right Arm",     labelEs: "Brazo Derecho",       pain: 2, healing: "2-4 semanas" },
  "left-forearm":  { label: "Left Forearm",  labelEs: "Antebrazo Izquierdo", pain: 2, healing: "2-4 semanas" },
  "right-forearm": { label: "Right Forearm", labelEs: "Antebrazo Derecho",   pain: 2, healing: "2-4 semanas" },
  "left-hand":     { label: "Left Hand",     labelEs: "Mano Izquierda",      pain: 5, healing: "4-6 semanas" },
  "right-hand":    { label: "Right Hand",    labelEs: "Mano Derecha",        pain: 5, healing: "4-6 semanas" },
  ribs:            { label: "Ribs",          labelEs: "Costilla",            pain: 5, healing: "3-6 semanas" },
  stomach:         { label: "Stomach",       labelEs: "Estómago",            pain: 3, healing: "3-5 semanas" },
  "left-thigh":    { label: "Left Thigh",    labelEs: "Muslo Izquierdo",     pain: 2, healing: "2-4 semanas" },
  "right-thigh":   { label: "Right Thigh",   labelEs: "Muslo Derecho",       pain: 2, healing: "2-4 semanas" },
  "left-shin":     { label: "Left Shin",     labelEs: "Espinilla Izquierda", pain: 2, healing: "2-4 semanas" },
  "right-shin":    { label: "Right Shin",    labelEs: "Espinilla Derecha",   pain: 2, healing: "2-4 semanas" },
  "left-foot":     { label: "Left Foot",     labelEs: "Pie Izquierdo",       pain: 5, healing: "4-6 semanas" },
  "right-foot":    { label: "Right Foot",    labelEs: "Pie Derecho",         pain: 5, healing: "4-6 semanas" },
  "upper-back":    { label: "Upper Back",    labelEs: "Espalda Alta",        pain: 4, healing: "3-6 semanas" },
  "lower-back":    { label: "Lower Back",    labelEs: "Espalda Baja",        pain: 4, healing: "3-5 semanas" },
};

const VP_FRONT: Record<ZoneKey, string> = {
  head:            "M150,20 C136,20 126,32 126,47 C126,61 136,72 150,72 C164,72 174,61 174,47 C174,32 164,20 150,20 Z",
  neck:            "M140,72 C138,82 138,90 142,98 L158,98 C162,90 162,82 160,72 Z",
  chest:           "M116,98 C108,112 106,126 108,144 C114,158 126,166 150,166 C174,166 186,158 192,144 C194,126 192,112 184,98 Z",
  "left-arm":      "M108,100 C90,108 82,122 84,146 C88,168 94,186 102,202 C108,206 114,204 117,198 C112,180 108,160 108,140 Z",
  "right-arm":     "M192,100 C210,108 218,122 216,146 C212,168 206,186 198,202 C192,206 186,204 183,198 C188,180 192,160 192,140 Z",
  "left-forearm":  "M102,202 C96,218 92,236 92,252 C96,266 102,270 110,266 C112,244 114,222 117,198 Z",
  "right-forearm": "M198,202 C204,218 208,236 208,252 C204,266 198,270 190,266 C188,244 186,222 183,198 Z",
  "left-hand":     "M92,252 C86,262 86,272 94,280 C102,284 108,282 110,266 Z",
  "right-hand":    "M208,252 C214,262 214,272 206,280 C198,284 192,282 190,266 Z",
  ribs:            "M118,148 C116,166 118,182 126,198 C134,204 142,200 142,188 L142,166 C140,156 132,150 118,148 Z",
  stomach:         "M142,166 L158,166 C164,178 164,192 158,208 L142,208 C136,192 136,178 142,166 Z",
  "left-thigh":    "M130,208 C118,224 114,246 116,272 C122,286 130,292 140,292 C142,266 142,236 142,208 Z",
  "right-thigh":   "M170,208 C182,224 186,246 184,272 C178,286 170,292 160,292 C158,266 158,236 158,208 Z",
  "left-shin":     "M116,272 C114,294 116,318 124,338 C130,344 136,344 140,338 C140,318 140,304 140,292 C130,292 122,286 116,272 Z",
  "right-shin":    "M184,272 C186,294 184,318 176,338 C170,344 164,344 160,338 C160,318 160,304 160,292 C170,292 178,286 184,272 Z",
  "left-foot":     "M124,338 C114,342 108,350 108,358 C118,362 130,362 142,358 C144,350 140,344 132,340 Z",
  "right-foot":    "M176,338 C186,342 192,350 192,358 C182,362 170,362 158,358 C156,350 160,344 168,340 Z",
  "upper-back":    "M126,108 C120,122 122,136 128,148 C136,154 144,154 150,150 C156,154 164,154 172,148 C178,136 180,122 174,108 C166,102 158,100 150,102 C142,100 134,102 126,108 Z",
  "lower-back":    "M132,176 C126,188 128,202 136,214 C144,218 156,218 164,214 C172,202 174,188 168,176 C160,170 140,170 132,176 Z",
};

const VP_BACK: Record<ZoneKey, string> = {
  ...VP_FRONT,
  "left-arm":      VP_FRONT["right-arm"],
  "right-arm":     VP_FRONT["left-arm"],
  "left-forearm":  VP_FRONT["right-forearm"],
  "right-forearm": VP_FRONT["left-forearm"],
  "left-hand":     VP_FRONT["right-hand"],
  "right-hand":    VP_FRONT["left-hand"],
  "left-thigh":    VP_FRONT["right-thigh"],
  "right-thigh":   VP_FRONT["left-thigh"],
  "left-shin":     VP_FRONT["right-shin"],
  "right-shin":    VP_FRONT["left-shin"],
  "left-foot":     VP_FRONT["right-foot"],
  "right-foot":    VP_FRONT["left-foot"],
  "upper-back":    "M118,98 C110,112 110,132 120,150 C132,162 142,168 150,166 C158,168 168,162 180,150 C190,132 190,112 182,98 C172,90 160,88 150,92 C140,88 128,90 118,98 Z",
  "lower-back":    "M126,168 C120,184 122,204 134,220 C142,226 158,226 166,220 C178,204 180,184 174,168 C164,160 136,160 126,168 Z",
};

// Bounding boxes rectangulares para shins y feet — los paths originales son
// demasiado estrechos para hover confiable. Los rect cubren toda el área visible.
const HIT_FRONT: Partial<Record<ZoneKey, string>> = {
  "left-shin":  "M108,272 L144,272 L144,344 L108,344 Z",
  "right-shin": "M156,272 L192,272 L192,344 L156,344 Z",
  "left-foot":  "M104,336 L146,336 L146,366 L104,366 Z",
  "right-foot": "M154,336 L196,336 L196,366 L154,366 Z",
};

const HIT_BACK: Partial<Record<ZoneKey, string>> = {
  "left-shin":  HIT_FRONT["right-shin"],
  "right-shin": HIT_FRONT["left-shin"],
  "left-foot":  HIT_FRONT["right-foot"],
  "right-foot": HIT_FRONT["left-foot"],
};

const FRONT_ZONES: ZoneKey[] = [
  "head","neck","chest",
  "left-arm","right-arm","left-forearm","right-forearm","left-hand","right-hand",
  "ribs","stomach","left-thigh","right-thigh","left-shin","right-shin","left-foot","right-foot",
];

const BACK_ZONES: ZoneKey[] = [
  "head","neck","upper-back","lower-back",
  "left-arm","right-arm","left-forearm","right-forearm","left-hand","right-hand",
  "left-thigh","right-thigh","left-shin","right-shin","left-foot","right-foot",
];

function InkDrop({ filled }: { filled: boolean }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
      <path
        d="M5 1 C5.8 2.9 9 5.4 9 8 A4 4 0 1 1 1 8 C1 5.4 4.2 2.9 5 1 Z"
        fill={filled ? "var(--faded-gold)" : "transparent"}
        stroke="var(--faded-gold)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function TattooPlacementMap({ onZoneClick, className, lang = "es" }: TattooPlacementMapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [view, setView]                   = useState<BodyView>("front");
  const [hoveredZone, setHoveredZone]     = useState<ZoneKey | null>(null);
  const [focusedZone, setFocusedZone]     = useState<ZoneKey | null>(null);
  const [selectedZone, setSelectedZone]   = useState<ZoneKey | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile]           = useState(false);
  const [cursor, setCursor]               = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media       = window.matchMedia("(hover: none), (pointer: coarse)");
    const mobileMedia = window.matchMedia("(max-width: 639px)");
    const sync = () => { setIsTouchDevice(media.matches); setIsMobile(mobileMedia.matches); };
    sync();
    media.addEventListener("change", sync);
    mobileMedia.addEventListener("change", sync);
    return () => { media.removeEventListener("change", sync); mobileMedia.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      if (!isTouchDevice) return;
      if (!rootRef.current?.contains(e.target as Node)) setSelectedZone(null);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [isTouchDevice]);

  const zonesInView = useMemo(() => view === "front" ? FRONT_ZONES : BACK_ZONES, [view]);
  const vpInView    = useMemo(() => view === "front" ? VP_FRONT : VP_BACK, [view]);
  const hitInView   = useMemo(() => view === "front" ? HIT_FRONT : HIT_BACK, [view]);

  const activeZone = useMemo(() => {
    if (isTouchDevice) return selectedZone;
    return hoveredZone ?? focusedZone ?? selectedZone;
  }, [focusedZone, hoveredZone, isTouchDevice, selectedZone]);

  const hasFocusEffect = Boolean(activeZone);

  const switchView = (v: BodyView) => {
    setView(v);
    setHoveredZone(null);
    setFocusedZone(null);
    setSelectedZone(null);
  };

  const handleZoneClick = (zone: ZoneKey) => {
    if (isTouchDevice) setSelectedZone((c) => c === zone ? null : zone);
    else setSelectedZone(zone);
    onZoneClick?.(zone);
  };

  const handleKeyDown = (e: React.KeyboardEvent, zone: ZoneKey) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleZoneClick(zone); }
  };

  const tooltipContent = (zone: ZoneKey) => {
    const info = ZONE_DATA[zone];
    return (
      <>
        <div className="tpm-tooltip-title">{info.labelEs} / {info.label}</div>
        <div className="tpm-meta-line">
          <span>Dolor</span>
          <span className="tpm-drops" aria-label={`Nivel de dolor ${info.pain} de 5`}>
            {[1,2,3,4,5].map((n) => <InkDrop key={n} filled={n <= info.pain} />)}
          </span>
        </div>
        <div className="tpm-meta-line">
          <span>Cicatrización</span>
          <span>{info.healing}</span>
        </div>
        <button type="button" className="tpm-link" onClick={() => onZoneClick?.(zone)}>
          Ver trabajos en esta zona →
        </button>
      </>
    );
  };

  const renderTooltip = () => {
    if (!activeZone) return null;
    if (isMobile) {
      return (
        <div className="tpm-tooltip tpm-tooltip-mobile" role="tooltip" aria-live="polite">
          {tooltipContent(activeZone)}
        </div>
      );
    }
    const rootRect = rootRef.current?.getBoundingClientRect();
    const rw = rootRect?.width ?? 480;
    const rh = rootRect?.height ?? 380;
    const left = Math.min(Math.max(8, cursor.x + 18), rw - 230);
    const top  = Math.min(Math.max(28, cursor.y - 18), rh - 10);
    return (
      <div className="tpm-tooltip" role="tooltip" aria-live="polite"
        style={{ left, top, transform: "translateY(-100%)" }}>
        {tooltipContent(activeZone)}
      </div>
    );
  };

  return (
    <div ref={rootRef} className={className ? `tpm-root ${className}` : "tpm-root"}>

      <div className="tpm-view-toggle" role="group" aria-label="Selección de vista del cuerpo">
        <button type="button"
          className={`tpm-toggle-btn ${view === "front" ? "is-active" : ""}`}
          onClick={() => switchView("front")}>
          {lang === "es" ? "Frontal" : "Front"}
        </button>
        <button type="button"
          className={`tpm-toggle-btn ${view === "back" ? "is-active" : ""}`}
          onClick={() => switchView("back")}>
          {lang === "es" ? "Posterior" : "Back"}
        </button>
      </div>

      <svg key={view} viewBox="0 0 300 380"
        aria-label={`Mapa de zonas de tatuaje vista ${view === "front" ? "frontal" : "posterior"}`}
        className="tpm-svg tpm-svg-enter">
        <title>Mapa anatómico de zonas de tatuaje</title>

        {zonesInView.map((zone) => {
          const info     = ZONE_DATA[zone];
          const isActive = activeZone === zone;
          const isDimmed = hasFocusEffect && !isActive;
          // Hit path: bbox rectangular para shins/feet, path original para el resto
          const hitPath = hitInView[zone] ?? vpInView[zone];

          return (
            <g key={zone}>
              {/*
                VISUAL path — estética pura, sin pointer events.
                fill/stroke se controlan desde React (isActive/isDimmed).
                NO hay selector CSS sibling — eso requería orden DOM específico
                y era frágil. React maneja el estado directamente aquí.
              */}
              <path
                d={vpInView[zone]}
                aria-hidden="true"
                style={{
                  fill:          isActive ? "rgba(139,0,0,0.3)" : "rgba(0,0,0,0.001)",
                  stroke:        isActive ? "var(--faded-gold)" : "rgba(240,234,214,0.35)",
                  strokeWidth:   1.35,
                  vectorEffect:  "non-scaling-stroke",
                  pointerEvents: "none",
                  opacity:       isDimmed ? 0.5 : 1,
                  transition:    "fill 280ms var(--ease-out-strong), stroke 280ms var(--ease-out-strong), opacity 280ms var(--ease-out-strong)",
                } as React.CSSProperties}
              />
              {/*
                HIT path — invisible, maneja todos los eventos.
                fill="rgba(0,0,0,0.001)" es crítico: fill:transparent
                desactiva pointer-events en el interior del shape en SVG.
                strokeWidth:14 da margen de tolerancia en el borde.
              */}
              <path
                d={hitPath}
                data-zone={zone}
                role="button"
                tabIndex={0}
                aria-label={`${info.labelEs} / ${info.label}`}
                style={{
                  fill:          "rgba(0,0,0,0.001)",
                  stroke:        "transparent",
                  strokeWidth:   14,
                  vectorEffect:  "non-scaling-stroke",
                  pointerEvents: "all",
                  cursor:        "pointer",
                  outline:       "none",
                } as React.CSSProperties}
                onMouseEnter={() => { if (!isTouchDevice) setHoveredZone(zone); }}
                onMouseLeave={() => { if (!isTouchDevice) setHoveredZone((c) => c === zone ? null : c); }}
                onMouseMove={(e) => {
                  if (isTouchDevice) return;
                  const rect = rootRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onFocus={() => setFocusedZone(zone)}
                onBlur={() => setFocusedZone((c) => c === zone ? null : c)}
                onClick={() => handleZoneClick(zone)}
                onKeyDown={(e) => handleKeyDown(e, zone)}
              />
            </g>
          );
        })}
      </svg>

      {renderTooltip()}

      <style jsx>{`
        .tpm-root {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .tpm-view-toggle {
          display: flex;
          width: fit-content;
          align-items: center;
          gap: 0.35rem;
          margin: 0 auto 0.9rem;
          padding: 0.3rem;
          border: 1px solid rgba(200,169,110,0.35);
          background: rgba(10,10,10,0.55);
        }
        .tpm-toggle-btn {
          border: 0;
          background: transparent;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 0.34rem 0.56rem;
          cursor: pointer;
          transition: color 220ms ease, background-color 220ms ease;
        }
        .tpm-toggle-btn.is-active {
          color: var(--faded-gold);
          background: rgba(139,0,0,0.24);
        }
        .tpm-toggle-btn:focus-visible {
          outline: 1px solid var(--faded-gold);
          outline-offset: 1px;
        }
        .tpm-svg {
          width: 100%;
          height: auto;
          display: block;
          filter: sepia(0.2) contrast(1.1);
        }
        .tpm-svg-enter {
          animation: tpm-fade-in 220ms ease;
        }
        @keyframes tpm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tpm-tooltip {
          position: absolute;
          z-index: 50;
          min-width: 190px;
          max-width: 220px;
          padding: 0.7rem 0.75rem;
          background: rgba(10,10,10,0.92);
          border: 1px solid rgba(200,169,110,0.3);
          color: var(--parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          line-height: 1.5;
          backdrop-filter: blur(2px);
          pointer-events: auto;
          transition: opacity 280ms var(--ease-out-strong);
        }
        .tpm-tooltip-mobile {
          position: fixed;
          left: 0.75rem;
          right: 0.75rem;
          bottom: 0.75rem;
          top: auto;
          max-width: none;
          transform: none;
        }
        .tpm-tooltip-title {
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          margin-bottom: 0.45rem;
          color: var(--faded-gold);
        }
        .tpm-meta-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .tpm-drops {
          display: inline-flex;
          align-items: center;
          gap: 0.17rem;
        }
        .tpm-link {
          display: block;
          margin-top: 0.45rem;
          border: 0;
          background: transparent;
          color: var(--faded-gold);
          text-decoration: underline;
          text-underline-offset: 0.16rem;
          font: inherit;
          letter-spacing: 0.14em;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }
        .tpm-link:hover,
        .tpm-link:focus-visible {
          color: var(--parchment);
          outline: none;
        }
        @media (max-width: 639px) {
          .tpm-root { padding-bottom: 7.5rem; }
        }
      `}</style>
    </div>
  );
}

/* USAGE EXAMPLE
import TattooPlacementMap from "@/components/TattooPlacementMap";

const [zoneFilter, setZoneFilter] = useState<string | null>(null);

<TattooPlacementMap
  onZoneClick={(zone) => setZoneFilter(zone)}
  className="mx-auto"
  lang="es"
/>
*/