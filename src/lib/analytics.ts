'use client';

export type EventType = 'pageview' | 'section_visit' | 'cta_click';

export interface AnalyticsEvent {
  type: EventType;
  label: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface AnalyticsSummary {
  totalPageviews: number;
  totalSectionVisits: number;
  totalCtaClicks: number;
  topSections: { label: string; count: number }[];
  topCtas: { label: string; count: number }[];
  dailyViews: { date: string; count: number }[];
  recentEvents: AnalyticsEvent[];
}

const STORAGE_KEY = 'serbero_analytics';
const MAX_EVENTS = 2000;

function getEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the most recent MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function trackEvent(type: EventType, label: string): void {
  if (typeof window === 'undefined') return;
  const now = new Date();
  const event: AnalyticsEvent = {
    type,
    label,
    timestamp: now.getTime(),
    date: now.toISOString().split('T')[0],
  };
  const events = getEvents();
  events.push(event);
  saveEvents(events);
}

export function trackPageview(page: string): void {
  trackEvent('pageview', page);
}

export function trackSectionVisit(section: string): void {
  trackEvent('section_visit', section);
}

export function trackCtaClick(cta: string): void {
  trackEvent('cta_click', cta);
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getEvents();

  const pageviews = events.filter((e) => e.type === 'pageview');
  const sectionVisits = events.filter((e) => e.type === 'section_visit');
  const ctaClicks = events.filter((e) => e.type === 'cta_click');

  // Count by label
  const countByLabel = (arr: AnalyticsEvent[]) => {
    const map: Record<string, number> = {};
    arr.forEach((e) => { map[e.label] = (map[e.label] || 0) + 1; });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Daily views for last 14 days
  const today = new Date();
  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = pageviews.filter((e) => e.date === dateStr).length;
    dailyViews.push({ date: dateStr, count });
  }

  return {
    totalPageviews: pageviews.length,
    totalSectionVisits: sectionVisits.length,
    totalCtaClicks: ctaClicks.length,
    topSections: countByLabel(sectionVisits).slice(0, 6),
    topCtas: countByLabel(ctaClicks).slice(0, 6),
    dailyViews,
    recentEvents: events.slice(-20).reverse(),
  };
}

export function clearAnalytics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
