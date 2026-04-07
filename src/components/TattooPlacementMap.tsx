"use client";

import React, { useMemo, useState } from "react";

interface TattooPlacementMapProps {
  onZoneClick?: (zone: string) => void;
  className?: string;
  lang?: "es" | "en";
}

interface BodyZone {
  id: string;
  label: string;
  cx: number;
  cy: number;
  pain: number;
  healing: string;
  works: string[];
  painLabel: string;
  description: string;
  mirrorId?: string;
}

const painColors: Record<string, string> = {
  "Very Low": "#22c55e",
  Low: "#86efac",
  Moderate: "#facc15",
  High: "#f97316",
  "Very High": "#ef4444",
  Extreme: "#dc2626",
};

const painLabels: Record<"es" | "en", Record<string, string>> = {
  es: {
    "Very Low": "Muy bajo",
    Low: "Bajo",
    Moderate: "Moderado",
    High: "Alto",
    "Very High": "Muy alto",
    Extreme: "Extremo",
  },
  en: {
    "Very Low": "Very Low",
    Low: "Low",
    Moderate: "Moderate",
    High: "High",
    "Very High": "Very High",
    Extreme: "Extreme",
  },
};

const frontZones: BodyZone[] = [
  {
    id: "head",
    label: "Head / Scalp",
    cx: 100,
    cy: 32,
    pain: 9,
    healing: "2-3 weeks",
    works: ["Lettering", "Geometric"],
    painLabel: "Extreme",
    description:
      "Very sensitive area. Thin skin over bone. Requires experienced artist.",
  },
  {
    id: "neck",
    label: "Neck",
    cx: 100,
    cy: 74,
    pain: 8,
    healing: "2-3 weeks",
    works: ["Fine Line", "Lettering"],
    painLabel: "Very High",
    description:
      "Sensitive with lots of nerve endings. Heals well but fades faster.",
  },
  {
    id: "chest-left",
    label: "Chest",
    cx: 80,
    cy: 118,
    pain: 7,
    healing: "2-3 weeks",
    works: ["Blackwork", "Realism", "Neo-Traditional"],
    painLabel: "High",
    description:
      "Flat surface ideal for large pieces. Sternum area is very painful.",
    mirrorId: "chest-right",
  },
  {
    id: "chest-right",
    label: "Chest",
    cx: 120,
    cy: 118,
    pain: 7,
    healing: "2-3 weeks",
    works: ["Blackwork", "Realism", "Neo-Traditional"],
    painLabel: "High",
    description:
      "Flat surface ideal for large pieces. Sternum area is very painful.",
    mirrorId: "chest-left",
  },
  {
    id: "ribs-left",
    label: "Ribs",
    cx: 60,
    cy: 152,
    pain: 10,
    healing: "3-4 weeks",
    works: ["Fine Line", "Blackwork"],
    painLabel: "Extreme",
    description:
      "The most painful area. Thin skin over bone. Serbero has stunning rib pieces.",
    mirrorId: "ribs-right",
  },
  {
    id: "ribs-right",
    label: "Ribs",
    cx: 140,
    cy: 152,
    pain: 10,
    healing: "3-4 weeks",
    works: ["Fine Line", "Blackwork"],
    painLabel: "Extreme",
    description:
      "The most painful area. Thin skin over bone. Serbero has stunning rib pieces.",
    mirrorId: "ribs-left",
  },
  {
    id: "stomach",
    label: "Stomach",
    cx: 100,
    cy: 175,
    pain: 6,
    healing: "2-3 weeks",
    works: ["Blackwork", "Geometric"],
    painLabel: "Moderate",
    description:
      "Soft tissue means more movement. Heals well with proper aftercare.",
  },
  {
    id: "upper-arm-left",
    label: "Upper Arm",
    cx: 44,
    cy: 130,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism", "Neo-Traditional"],
    painLabel: "Low",
    description:
      "One of the best spots. Fleshy, flat, and heals beautifully. Perfect for sleeves.",
    mirrorId: "upper-arm-right",
  },
  {
    id: "upper-arm-right",
    label: "Upper Arm",
    cx: 156,
    cy: 130,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism", "Neo-Traditional"],
    painLabel: "Low",
    description:
      "One of the best spots. Fleshy, flat, and heals beautifully. Perfect for sleeves.",
    mirrorId: "upper-arm-left",
  },
  {
    id: "forearm-left",
    label: "Forearm",
    cx: 35,
    cy: 192,
    pain: 3,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Lettering"],
    painLabel: "Very Low",
    description:
      "Excellent visibility and healing. Serbero's most requested placement.",
    mirrorId: "forearm-right",
  },
  {
    id: "forearm-right",
    label: "Forearm",
    cx: 165,
    cy: 192,
    pain: 3,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Lettering"],
    painLabel: "Very Low",
    description:
      "Excellent visibility and healing. Serbero's most requested placement.",
    mirrorId: "forearm-left",
  },
  {
    id: "hand-left",
    label: "Hand / Wrist",
    cx: 34,
    cy: 242,
    pain: 7,
    healing: "3-4 weeks",
    works: ["Geometric", "Lettering", "Fine Line"],
    painLabel: "High",
    description:
      "High fade rate due to constant use. Requires touch-ups. Bold designs recommended.",
    mirrorId: "hand-right",
  },
  {
    id: "hand-right",
    label: "Hand / Wrist",
    cx: 166,
    cy: 242,
    pain: 7,
    healing: "3-4 weeks",
    works: ["Geometric", "Lettering", "Fine Line"],
    painLabel: "High",
    description:
      "High fade rate due to constant use. Requires touch-ups. Bold designs recommended.",
    mirrorId: "hand-left",
  },
  {
    id: "thigh-left",
    label: "Thigh",
    cx: 68,
    cy: 272,
    pain: 3,
    healing: "2 weeks",
    works: ["Large Pieces", "Realism", "Blackwork", "Neo-Traditional"],
    painLabel: "Very Low",
    description:
      "Large fleshy area perfect for big, detailed work. Heals very well.",
    mirrorId: "thigh-right",
  },
  {
    id: "thigh-right",
    label: "Thigh",
    cx: 132,
    cy: 272,
    pain: 3,
    healing: "2 weeks",
    works: ["Large Pieces", "Realism", "Blackwork", "Neo-Traditional"],
    painLabel: "Very Low",
    description:
      "Large fleshy area perfect for big, detailed work. Heals very well.",
    mirrorId: "thigh-left",
  },
  {
    id: "knee-left",
    label: "Knee",
    cx: 67,
    cy: 326,
    pain: 8,
    healing: "3 weeks",
    works: ["Geometric", "Blackwork"],
    painLabel: "Very High",
    description:
      "Bony and sensitive. Constant movement affects healing. Bold designs work best.",
    mirrorId: "knee-right",
  },
  {
    id: "knee-right",
    label: "Knee",
    cx: 133,
    cy: 326,
    pain: 8,
    healing: "3 weeks",
    works: ["Geometric", "Blackwork"],
    painLabel: "Very High",
    description:
      "Bony and sensitive. Constant movement affects healing. Bold designs work best.",
    mirrorId: "knee-left",
  },
  {
    id: "calf-left",
    label: "Calf",
    cx: 66,
    cy: 375,
    pain: 4,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Realism"],
    painLabel: "Low",
    description:
      "Fleshy and forgiving. Great for medium to large pieces. Heals consistently well.",
    mirrorId: "calf-right",
  },
  {
    id: "calf-right",
    label: "Calf",
    cx: 134,
    cy: 375,
    pain: 4,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Realism"],
    painLabel: "Low",
    description:
      "Fleshy and forgiving. Great for medium to large pieces. Heals consistently well.",
    mirrorId: "calf-left",
  },
  {
    id: "ankle-left",
    label: "Ankle / Foot",
    cx: 63,
    cy: 440,
    pain: 8,
    healing: "4-6 weeks",
    works: ["Fine Line", "Geometric", "Lettering"],
    painLabel: "Very High",
    description:
      "Thin skin over bone. Slow healing due to circulation. Delicate designs recommended.",
    mirrorId: "ankle-right",
  },
  {
    id: "ankle-right",
    label: "Ankle / Foot",
    cx: 137,
    cy: 440,
    pain: 8,
    healing: "4-6 weeks",
    works: ["Fine Line", "Geometric", "Lettering"],
    painLabel: "Very High",
    description:
      "Thin skin over bone. Slow healing due to circulation. Delicate designs recommended.",
    mirrorId: "ankle-left",
  },
];

const backZones: BodyZone[] = [
  {
    id: "back-head",
    label: "Back of Head",
    cx: 100,
    cy: 32,
    pain: 9,
    healing: "2-3 weeks",
    works: ["Geometric", "Lettering"],
    painLabel: "Extreme",
    description:
      "Thin skin over skull. Requires shaving. Very painful but striking results.",
  },
  {
    id: "back-neck",
    label: "Nape of Neck",
    cx: 100,
    cy: 74,
    pain: 7,
    healing: "2-3 weeks",
    works: ["Fine Line", "Lettering", "Geometric"],
    painLabel: "High",
    description:
      "Popular placement, highly visible. Heals well but can fade with sun exposure.",
  },
  {
    id: "shoulder-left",
    label: "Shoulder",
    cx: 54,
    cy: 104,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Rounded surface, great for wrapping designs. Heals beautifully.",
    mirrorId: "shoulder-right",
  },
  {
    id: "shoulder-right",
    label: "Shoulder",
    cx: 146,
    cy: 104,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Rounded surface, great for wrapping designs. Heals beautifully.",
    mirrorId: "shoulder-left",
  },
  {
    id: "upper-back",
    label: "Upper Back",
    cx: 100,
    cy: 128,
    pain: 5,
    healing: "2-3 weeks",
    works: ["Large Pieces", "Blackwork", "Realism", "Neo-Traditional"],
    painLabel: "Moderate",
    description:
      "Large flat canvas. Ideal for back pieces and wings. Heals very well.",
  },
  {
    id: "back-ribs-left",
    label: "Back Ribs",
    cx: 60,
    cy: 160,
    pain: 9,
    healing: "3-4 weeks",
    works: ["Fine Line", "Blackwork"],
    painLabel: "Extreme",
    description:
      "Extremely painful. Thin skin over ribs. Stunning placement for large work.",
    mirrorId: "back-ribs-right",
  },
  {
    id: "back-ribs-right",
    label: "Back Ribs",
    cx: 140,
    cy: 160,
    pain: 9,
    healing: "3-4 weeks",
    works: ["Fine Line", "Blackwork"],
    painLabel: "Extreme",
    description:
      "Extremely painful. Thin skin over ribs. Stunning placement for large work.",
    mirrorId: "back-ribs-left",
  },
  {
    id: "lower-back",
    label: "Lower Back",
    cx: 100,
    cy: 196,
    pain: 6,
    healing: "2-3 weeks",
    works: ["Blackwork", "Geometric", "Tribal"],
    painLabel: "Moderate",
    description:
      "Classic placement. Flat surface, heals well. Great for symmetrical designs.",
  },
  {
    id: "back-upper-arm-left",
    label: "Tricep",
    cx: 44,
    cy: 130,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Tricep area. Fleshy and flat. Excellent for sleeve continuation.",
    mirrorId: "back-upper-arm-right",
  },
  {
    id: "back-upper-arm-right",
    label: "Tricep",
    cx: 156,
    cy: 130,
    pain: 4,
    healing: "2 weeks",
    works: ["Sleeve", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Tricep area. Fleshy and flat. Excellent for sleeve continuation.",
    mirrorId: "back-upper-arm-left",
  },
  {
    id: "back-forearm-left",
    label: "Forearm (Back)",
    cx: 35,
    cy: 192,
    pain: 3,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Lettering"],
    painLabel: "Very Low",
    description:
      "Outer forearm. Very visible, heals well. One of the easiest placements.",
    mirrorId: "back-forearm-right",
  },
  {
    id: "back-forearm-right",
    label: "Forearm (Back)",
    cx: 165,
    cy: 192,
    pain: 3,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Lettering"],
    painLabel: "Very Low",
    description:
      "Outer forearm. Very visible, heals well. One of the easiest placements.",
    mirrorId: "back-forearm-left",
  },
  {
    id: "back-thigh-left",
    label: "Back Thigh",
    cx: 68,
    cy: 272,
    pain: 3,
    healing: "2 weeks",
    works: ["Large Pieces", "Realism", "Blackwork"],
    painLabel: "Very Low",
    description: "Hamstring area. Large fleshy canvas. Heals very well, low pain.",
    mirrorId: "back-thigh-right",
  },
  {
    id: "back-thigh-right",
    label: "Back Thigh",
    cx: 132,
    cy: 272,
    pain: 3,
    healing: "2 weeks",
    works: ["Large Pieces", "Realism", "Blackwork"],
    painLabel: "Very Low",
    description: "Hamstring area. Large fleshy canvas. Heals very well, low pain.",
    mirrorId: "back-thigh-left",
  },
  {
    id: "back-knee-left",
    label: "Back of Knee",
    cx: 67,
    cy: 326,
    pain: 9,
    healing: "3-4 weeks",
    works: ["Small Pieces", "Fine Line"],
    painLabel: "Extreme",
    description:
      "Ditch of the knee. One of the most painful spots. Constant movement slows healing.",
    mirrorId: "back-knee-right",
  },
  {
    id: "back-knee-right",
    label: "Back of Knee",
    cx: 133,
    cy: 326,
    pain: 9,
    healing: "3-4 weeks",
    works: ["Small Pieces", "Fine Line"],
    painLabel: "Extreme",
    description:
      "Ditch of the knee. One of the most painful spots. Constant movement slows healing.",
    mirrorId: "back-knee-left",
  },
  {
    id: "back-calf-left",
    label: "Calf (Back)",
    cx: 66,
    cy: 375,
    pain: 4,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Great canvas for detailed work. Heals consistently well.",
    mirrorId: "back-calf-right",
  },
  {
    id: "back-calf-right",
    label: "Calf (Back)",
    cx: 134,
    cy: 375,
    pain: 4,
    healing: "2 weeks",
    works: ["Fine Line", "Blackwork", "Realism"],
    painLabel: "Low",
    description: "Great canvas for detailed work. Heals consistently well.",
    mirrorId: "back-calf-left",
  },
  {
    id: "back-ankle-left",
    label: "Achilles / Heel",
    cx: 63,
    cy: 440,
    pain: 8,
    healing: "4-6 weeks",
    works: ["Fine Line", "Geometric"],
    painLabel: "Very High",
    description: "Thin skin over tendon. Slow healing. Minimal designs recommended.",
    mirrorId: "back-ankle-right",
  },
  {
    id: "back-ankle-right",
    label: "Achilles / Heel",
    cx: 137,
    cy: 440,
    pain: 8,
    healing: "4-6 weeks",
    works: ["Fine Line", "Geometric"],
    painLabel: "Very High",
    description: "Thin skin over tendon. Slow healing. Minimal designs recommended.",
    mirrorId: "back-ankle-left",
  },
];

function FrontSilhouette() {
  const fill = "#1c1917";
  const stroke = "#44403c";
  const sw = "1.2";
  return (
    <g>
      <ellipse cx="100" cy="32" rx="26" ry="30" fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="74" cy="34" rx="5" ry="8" fill={fill} stroke={stroke} strokeWidth="1" />
      <ellipse cx="126" cy="34" rx="5" ry="8" fill={fill} stroke={stroke} strokeWidth="1" />
      <path d="M 91 60 L 88 80 L 112 80 L 109 60 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 88 80 Q 70 82 56 96 L 60 100 Q 74 88 90 88 L 110 88 Q 126 88 140 100 L 144 96 Q 130 82 112 80 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 60 100 Q 54 108 54 120 L 54 200 Q 54 210 62 214 L 80 218 Q 90 222 100 222 Q 110 222 120 218 L 128 214 Q 138 210 146 200 L 146 120 Q 146 108 140 100 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 68 108 Q 84 116 100 112 Q 116 116 132 108" fill="none" stroke="#2a2520" strokeWidth="1" />
      <line x1="100" y1="130" x2="100" y2="210" stroke="#2a2520" strokeWidth="0.8" />
      <path d="M 72 148 Q 100 152 128 148" fill="none" stroke="#2a2520" strokeWidth="0.7" />
      <path d="M 72 166 Q 100 170 128 166" fill="none" stroke="#2a2520" strokeWidth="0.7" />
      <path d="M 74 184 Q 100 188 126 184" fill="none" stroke="#2a2520" strokeWidth="0.7" />
      <circle cx="100" cy="198" r="2.5" fill="#2a2520" />
      <path d="M 54 100 Q 36 106 32 130 Q 30 148 34 162 Q 38 170 44 170 Q 50 170 54 162 Q 58 148 56 120 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 146 100 Q 164 106 168 130 Q 170 148 166 162 Q 162 170 156 170 Q 150 170 146 162 Q 142 148 144 120 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 34 162 Q 28 172 26 192 Q 24 210 28 226 Q 30 232 36 232 Q 42 232 44 226 Q 46 210 44 192 Q 44 172 36 172 Q 32 172 28 172 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 166 162 Q 172 172 174 192 Q 176 210 172 226 Q 170 232 164 232 Q 158 232 156 226 Q 154 210 156 192 Q 156 172 156 162 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 28 226 Q 24 234 24 244 Q 24 252 30 254 Q 36 256 42 252 Q 46 248 44 240 Q 44 232 36 232 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 172 226 Q 176 234 176 244 Q 176 252 170 254 Q 164 256 158 252 Q 154 248 156 240 Q 156 232 164 232 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 62 214 Q 54 218 52 228 L 56 232 Q 62 224 72 222 L 80 220 Q 90 222 100 222 Q 110 222 120 220 L 128 222 Q 138 224 144 232 L 148 228 Q 146 218 138 214 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 56 232 Q 50 240 50 260 Q 50 290 54 310 Q 56 318 64 320 Q 72 322 78 316 Q 84 308 84 290 Q 84 264 82 244 Q 80 232 72 228 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 144 232 Q 150 240 150 260 Q 150 290 146 310 Q 144 318 136 320 Q 128 322 122 316 Q 116 308 116 290 Q 116 264 118 244 Q 120 232 128 228 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 54 310 Q 50 320 52 332 Q 54 340 62 342 Q 70 344 78 340 Q 84 336 84 326 Q 84 316 78 316 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 146 310 Q 150 320 148 332 Q 146 340 138 342 Q 130 344 122 340 Q 116 336 116 326 Q 116 316 122 316 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 52 332 Q 48 346 50 368 Q 52 388 56 402 Q 60 410 66 412 Q 74 414 80 408 Q 86 400 86 382 Q 86 360 84 344 Q 82 336 78 340 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 148 332 Q 152 346 150 368 Q 148 388 144 402 Q 140 410 134 412 Q 126 414 120 408 Q 114 400 114 382 Q 114 360 116 344 Q 118 336 122 340 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 56 402 Q 52 412 52 422 Q 52 430 58 434 Q 64 438 72 436 Q 78 432 80 424 Q 80 412 80 408 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 144 402 Q 148 412 148 422 Q 148 430 142 434 Q 136 438 128 436 Q 122 432 120 424 Q 120 412 120 408 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 52 422 Q 44 428 40 438 Q 38 446 44 450 Q 52 454 66 452 Q 76 450 80 444 Q 82 436 72 436 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 148 422 Q 156 428 160 438 Q 162 446 156 450 Q 148 454 134 452 Q 124 450 120 444 Q 118 436 128 436 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

function BackSilhouette() {
  const fill = "#1c1917";
  const stroke = "#44403c";
  const sw = "1.2";
  return (
    <g>
      <ellipse cx="100" cy="32" rx="26" ry="30" fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="74" cy="34" rx="5" ry="8" fill={fill} stroke={stroke} strokeWidth="1" />
      <ellipse cx="126" cy="34" rx="5" ry="8" fill={fill} stroke={stroke} strokeWidth="1" />
      <path d="M 80 10 Q 100 4 120 10" fill="none" stroke="#2a2520" strokeWidth="1.5" />
      <path d="M 91 60 L 88 80 L 112 80 L 109 60 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 88 80 Q 68 82 54 96 L 58 100 Q 72 88 90 88 L 110 88 Q 128 88 142 100 L 146 96 Q 132 82 112 80 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 58 100 Q 52 110 52 124 L 52 200 Q 52 212 60 216 L 78 220 Q 90 224 100 224 Q 110 224 122 220 L 140 216 Q 148 212 148 200 L 148 124 Q 148 110 142 100 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <line x1="100" y1="100" x2="100" y2="216" stroke="#252220" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M 62 112 Q 58 128 62 144 Q 66 152 76 150 Q 86 148 88 136 Q 90 122 84 112 Z" fill="none" stroke="#2a2520" strokeWidth="1" />
      <path d="M 138 112 Q 142 128 138 144 Q 134 152 124 150 Q 114 148 112 136 Q 110 122 116 112 Z" fill="none" stroke="#2a2520" strokeWidth="1" />
      <path d="M 64 168 Q 100 174 136 168" fill="none" stroke="#2a2520" strokeWidth="0.7" />
      <path d="M 66 186 Q 100 192 134 186" fill="none" stroke="#2a2520" strokeWidth="0.7" />
      <path d="M 52 100 Q 34 106 30 130 Q 28 148 32 162 Q 36 170 42 170 Q 48 170 52 162 Q 56 148 54 120 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 148 100 Q 166 106 170 130 Q 172 148 168 162 Q 164 170 158 170 Q 152 170 148 162 Q 144 148 146 120 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 32 162 Q 26 172 24 192 Q 22 210 26 226 Q 28 232 34 232 Q 40 232 42 226 Q 44 210 42 192 Q 42 172 42 162 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 168 162 Q 174 172 176 192 Q 178 210 174 226 Q 172 232 166 232 Q 160 232 158 226 Q 156 210 158 192 Q 158 172 158 162 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 26 226 Q 22 234 22 244 Q 22 252 28 254 Q 34 256 40 252 Q 44 248 42 240 Q 42 232 34 232 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 174 226 Q 178 234 178 244 Q 178 252 172 254 Q 166 256 160 252 Q 156 248 158 240 Q 158 232 166 232 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 60 216 Q 52 220 50 230 L 54 234 Q 60 226 70 224 L 80 222 Q 90 224 100 224 Q 110 224 120 222 L 130 224 Q 140 226 146 234 L 150 230 Q 148 220 140 216 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 54 234 Q 48 242 48 262 Q 48 292 52 312 Q 54 320 62 322 Q 70 324 76 318 Q 82 310 82 292 Q 82 266 80 246 Q 78 234 70 230 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 146 234 Q 152 242 152 262 Q 152 292 148 312 Q 146 320 138 322 Q 130 324 124 318 Q 118 310 118 292 Q 118 266 120 246 Q 122 234 130 230 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 52 312 Q 48 322 50 334 Q 52 342 60 344 Q 68 346 76 342 Q 82 338 82 328 Q 82 318 76 318 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 148 312 Q 152 322 150 334 Q 148 342 140 344 Q 132 346 124 342 Q 118 338 118 328 Q 118 318 124 318 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 50 334 Q 46 348 48 370 Q 50 390 54 404 Q 58 412 64 414 Q 72 416 78 410 Q 84 402 84 384 Q 84 362 82 346 Q 80 338 76 342 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 150 334 Q 154 348 152 370 Q 150 390 146 404 Q 142 412 136 414 Q 128 416 122 410 Q 116 402 116 384 Q 116 362 118 346 Q 120 338 124 342 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 54 404 Q 50 414 50 424 Q 50 432 56 436 Q 62 440 70 438 Q 78 436 80 428 Q 82 420 78 410 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 146 404 Q 150 414 150 424 Q 150 432 144 436 Q 138 440 130 438 Q 122 436 120 428 Q 118 420 122 410 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 50 424 Q 42 430 38 440 Q 36 448 42 452 Q 50 456 64 454 Q 74 452 78 446 Q 80 438 70 438 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M 150 424 Q 158 430 162 440 Q 164 448 158 452 Q 150 456 136 454 Q 126 452 122 446 Q 120 438 130 438 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

interface BodyMapProps {
  zones: BodyZone[];
  hoveredIds: Set<string>;
  activeIds: Set<string>;
  onHover: (id: string | null) => void;
  onClick: (zone: BodyZone) => void;
  isFront: boolean;
}

function BodySVGMirrored({
  zones,
  hoveredIds,
  activeIds,
  onHover,
  onClick,
  isFront,
}: BodyMapProps) {
  return (
    <svg
      viewBox="0 0 200 480"
      className="tpm-body"
      style={{ filter: "drop-shadow(0 0 32px rgba(200,56,42,0.18))" }}
      aria-label={isFront ? "Body front map" : "Body back map"}
    >
      {isFront ? <FrontSilhouette /> : <BackSilhouette />}

      {zones.map((zone) => {
        const isActive = activeIds.has(zone.id) || hoveredIds.has(zone.id);
        const color = painColors[zone.painLabel] ?? "#f97316";
        return (
          <g key={zone.id}>
            <circle
              cx={zone.cx}
              cy={zone.cy}
              r={12}
              fill={isActive ? `${color}30` : "rgba(200,56,42,0.08)"}
              stroke={isActive ? color : "rgba(200,56,42,0.4)"}
              strokeWidth="1.5"
              className="tpm-dot"
              onMouseEnter={() => onHover(zone.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(zone)}
            />
            <circle
              cx={zone.cx}
              cy={zone.cy}
              r={4}
              fill={isActive ? color : "rgba(200,56,42,0.7)"}
              className="tpm-dot-inner"
            />
            {isActive && (
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={17}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.35"
                className="tpm-dot-inner"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const labels = {
  es: {
    title: "Guía de ubicación del tatuaje",
    subtitle:
      "Explora zonas del cuerpo para ver dolor, cicatrizacion y estilos recomendados.",
    front: "Frontal",
    back: "Posterior",
    hint: "Toca una zona para explorar",
    selected: "Zona seleccionada",
    pain: "Dolor",
    healing: "Cicatrizacion",
    bestStyles: "Mejores estilos",
    cta: "Ver trabajos de esta zona",
    emptyTitle: "Selecciona una zona",
    emptyText:
      "Pasa el cursor o toca cualquier punto destacado para ver detalles.",
  },
  en: {
    title: "Tattoo Placement Guide",
    subtitle:
      "Explore body zones to compare pain, healing time, and best fitting styles.",
    front: "Front",
    back: "Back",
    hint: "Tap a zone to explore",
    selected: "Selected zone",
    pain: "Pain",
    healing: "Healing",
    bestStyles: "Best styles",
    cta: "View work in this zone",
    emptyTitle: "Select a body zone",
    emptyText:
      "Hover or tap any highlighted point on the body map to see details.",
  },
};

export default function TattooPlacementMap({
  onZoneClick,
  className,
  lang = "es",
}: TattooPlacementMapProps) {
  const t = labels[lang];
  const translatePainLabel = (value: string) => painLabels[lang][value] ?? value;
  const [hoveredFrontIds, setHoveredFrontIds] = useState<Set<string>>(new Set());
  const [activeFrontIds, setActiveFrontIds] = useState<Set<string>>(new Set());
  const [hoveredBackIds, setHoveredBackIds] = useState<Set<string>>(new Set());
  const [activeBackIds, setActiveBackIds] = useState<Set<string>>(new Set());

  const getDisplayZone = (
    zones: BodyZone[],
    activeIds: Set<string>,
    hoveredIds: Set<string>
  ): BodyZone | null => {
    for (const id of activeIds) {
      const zone = zones.find((z) => z.id === id);
      if (zone) return zone;
    }
    for (const id of hoveredIds) {
      const zone = zones.find((z) => z.id === id);
      if (zone) return zone;
    }
    return null;
  };

  const displayZone = useMemo(
    () =>
      getDisplayZone(frontZones, activeFrontIds, hoveredFrontIds) ??
      getDisplayZone(backZones, activeBackIds, hoveredBackIds),
    [activeBackIds, activeFrontIds, hoveredBackIds, hoveredFrontIds]
  );

  const legend = useMemo(
    () =>
      Object.entries(painColors).map(([label, color]) => ({
        label,
        translatedLabel: translatePainLabel(label),
        color,
      })),
    [lang]
  );

  const getMirroredIds = (zones: BodyZone[], id: string): Set<string> => {
    const zone = zones.find((z) => z.id === id);
    const ids = new Set<string>([id]);
    if (zone?.mirrorId) ids.add(zone.mirrorId);
    return ids;
  };

  const handleFrontHover = (id: string | null) => {
    if (!id) {
      setHoveredFrontIds(new Set());
      return;
    }
    setHoveredFrontIds(getMirroredIds(frontZones, id));
  };

  const handleBackHover = (id: string | null) => {
    if (!id) {
      setHoveredBackIds(new Set());
      return;
    }
    setHoveredBackIds(getMirroredIds(backZones, id));
  };

  const handleFrontClick = (zone: BodyZone) => {
    const ids = getMirroredIds(frontZones, zone.id);
    const alreadyActive = activeFrontIds.has(zone.id);
    setActiveBackIds(new Set());
    setActiveFrontIds(alreadyActive ? new Set() : ids);
  };

  const handleBackClick = (zone: BodyZone) => {
    const ids = getMirroredIds(backZones, zone.id);
    const alreadyActive = activeBackIds.has(zone.id);
    setActiveFrontIds(new Set());
    setActiveBackIds(alreadyActive ? new Set() : ids);
  };

  return (
    <section className={className ? `tpm-root ${className}` : "tpm-root"}>
      <div className="tpm-bg" aria-hidden="true" />
      <div className="tpm-shell">
        <div className="tpm-header">
          <p className="tpm-kicker">004 - Interactive Map</p>
          <h2 className="tpm-title">{t.title}</h2>
          <p className="tpm-subtitle">{t.subtitle}</p>
        </div>

        <div className="tpm-layout">
          <div className="tpm-maps">
            <div className="tpm-map-col">
              <span className="tpm-map-label">{t.front}</span>
              <BodySVGMirrored
                zones={frontZones}
                hoveredIds={hoveredFrontIds}
                activeIds={activeFrontIds}
                onHover={handleFrontHover}
                onClick={handleFrontClick}
                isFront
              />
              <p className="tpm-hint">{t.hint}</p>
            </div>

            <div className="tpm-map-col">
              <span className="tpm-map-label">{t.back}</span>
              <BodySVGMirrored
                zones={backZones}
                hoveredIds={hoveredBackIds}
                activeIds={activeBackIds}
                onHover={handleBackHover}
                onClick={handleBackClick}
                isFront={false}
              />
              <p className="tpm-hint">{t.hint}</p>
            </div>
          </div>

          <div className="tpm-panel-wrap">
            {displayZone ? (
              <div className="tpm-panel tpm-enter">
                <div className="tpm-panel-head">
                  <div>
                    <p className="tpm-meta-label">{t.selected}</p>
                    <h3 className="tpm-zone-title">{displayZone.label}</h3>
                  </div>
                  <span
                    className="tpm-pill"
                    style={{
                      backgroundColor: `${painColors[displayZone.painLabel]}22`,
                      color: painColors[displayZone.painLabel],
                      borderColor: `${painColors[displayZone.painLabel]}44`,
                    }}
                  >
                    {translatePainLabel(displayZone.painLabel)}
                  </span>
                </div>

                <div className="tpm-meter-wrap">
                  <div className="tpm-meter-head">
                    <span>{t.pain}</span>
                    <span>{displayZone.pain}/10</span>
                  </div>
                  <div className="tpm-meter-track">
                    <div
                      className="tpm-meter-fill"
                      style={{
                        width: `${displayZone.pain * 10}%`,
                        backgroundColor: painColors[displayZone.painLabel],
                      }}
                    />
                  </div>
                </div>

                <p className="tpm-desc">{displayZone.description}</p>

                <div className="tpm-grid">
                  <div className="tpm-card">
                    <p className="tpm-meta-label">{t.healing}</p>
                    <p className="tpm-card-value">{displayZone.healing}</p>
                  </div>
                  <div className="tpm-card">
                    <p className="tpm-meta-label">{t.bestStyles}</p>
                    <div className="tpm-tags">
                      {displayZone.works.map((work) => (
                        <span key={work} className="tpm-tag">
                          {work}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="tpm-cta"
                  onClick={() => onZoneClick?.(displayZone.id)}
                >
                  {t.cta}
                </button>
              </div>
            ) : (
              <div className="tpm-panel tpm-empty">
                <p className="tpm-zone-title">{t.emptyTitle}</p>
                <p className="tpm-desc">{t.emptyText}</p>
                <div className="tpm-legend">
                  {legend.map(({ label, translatedLabel, color }) => (
                    <div key={label} className="tpm-legend-item">
                      <span className="tpm-legend-dot" style={{ backgroundColor: color }} />
                      <span>{translatedLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .tpm-root {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.25rem;
          background: radial-gradient(circle at 15% 20%, rgba(139, 0, 0, 0.2), transparent 40%),
            linear-gradient(180deg, #0b0a09 0%, #12100f 100%);
        }
        .tpm-bg {
          position: absolute;
          inset: -20% auto auto 50%;
          width: min(720px, 90vw);
          height: min(720px, 90vw);
          transform: translateX(-50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(200, 169, 110, 0.12), rgba(200, 169, 110, 0));
          filter: blur(18px);
          pointer-events: none;
        }
        .tpm-shell {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }
        .tpm-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .tpm-kicker {
          margin: 0 0 0.75rem;
          color: var(--faded-gold);
          font-family: "DM Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }
        .tpm-title {
          margin: 0;
          color: var(--parchment);
          font-family: "Fraunces", serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(1.8rem, 5.5vw, 3.1rem);
        }
        .tpm-subtitle {
          margin: 0.9rem auto 0;
          max-width: 740px;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          line-height: 1.7;
          text-transform: uppercase;
        }
        .tpm-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.2rem;
          align-items: stretch;
        }
        .tpm-maps {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .tpm-map-col {
          border: 1px solid rgba(200, 169, 110, 0.2);
          background: rgba(12, 11, 10, 0.72);
          padding: 0.95rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tpm-map-label {
          margin-bottom: 0.45rem;
          color: var(--faded-gold);
          font-family: "DM Mono", monospace;
          font-size: 0.66rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .tpm-body {
          width: 100%;
          max-width: 250px;
          height: auto;
        }
        .tpm-dot {
          cursor: pointer;
          transition: all 200ms ease;
        }
        .tpm-dot-inner {
          pointer-events: none;
        }
        .tpm-hint {
          margin: 0.5rem 0 0;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-align: center;
        }
        .tpm-panel-wrap {
          min-width: 0;
        }
        .tpm-panel {
          height: 100%;
          border: 1px solid rgba(200, 169, 110, 0.25);
          background: rgba(10, 10, 10, 0.84);
          padding: 1rem;
        }
        .tpm-enter {
          animation: fadeIn 220ms ease;
        }
        .tpm-panel-head {
          display: flex;
          justify-content: space-between;
          gap: 0.7rem;
          align-items: flex-start;
          margin-bottom: 0.9rem;
        }
        .tpm-meta-label {
          margin: 0 0 0.25rem;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .tpm-zone-title {
          margin: 0;
          color: var(--parchment);
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 1.45rem;
          line-height: 1.2;
        }
        .tpm-pill {
          border: 1px solid;
          border-radius: 999px;
          padding: 0.25rem 0.55rem;
          font-family: "DM Mono", monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .tpm-meter-wrap {
          margin-bottom: 0.9rem;
        }
        .tpm-meter-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.35rem;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .tpm-meter-track {
          height: 8px;
          background: rgba(240, 234, 214, 0.12);
          overflow: hidden;
        }
        .tpm-meter-fill {
          height: 100%;
          transition: width 600ms ease;
        }
        .tpm-desc {
          margin: 0 0 0.9rem;
          color: var(--parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          line-height: 1.65;
          opacity: 0.9;
          text-transform: uppercase;
        }
        .tpm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.6rem;
          margin-bottom: 0.95rem;
        }
        .tpm-card {
          border: 1px solid rgba(200, 169, 110, 0.18);
          background: rgba(22, 20, 18, 0.85);
          padding: 0.55rem;
        }
        .tpm-card-value {
          margin: 0;
          color: var(--parchment);
          font-family: "Fraunces", serif;
          font-size: 1rem;
          line-height: 1.2;
        }
        .tpm-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .tpm-tag {
          border: 1px solid rgba(139, 0, 0, 0.45);
          background: rgba(139, 0, 0, 0.18);
          color: #f8d6d2;
          font-family: "DM Mono", monospace;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.18rem 0.36rem;
        }
        .tpm-cta {
          width: 100%;
          border: 1px solid rgba(200, 169, 110, 0.4);
          background: rgba(139, 0, 0, 0.22);
          color: var(--faded-gold);
          padding: 0.6rem 0.75rem;
          font-family: "DM Mono", monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 180ms ease;
        }
        .tpm-cta:hover,
        .tpm-cta:focus-visible {
          background: rgba(139, 0, 0, 0.35);
          color: var(--parchment);
          outline: none;
        }
        .tpm-empty {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tpm-legend {
          margin-top: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem 0.7rem;
        }
        .tpm-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.32rem;
          color: var(--muted-parchment);
          font-family: "DM Mono", monospace;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .tpm-legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 1024px) {
          .tpm-layout {
            grid-template-columns: 1fr;
          }
          .tpm-panel {
            min-height: 260px;
          }
        }
        @media (max-width: 720px) {
          .tpm-root {
            padding: 4rem 0.8rem;
          }
          .tpm-maps {
            grid-template-columns: 1fr;
          }
          .tpm-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
