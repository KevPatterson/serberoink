'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/lib/content';

const POLLING_INTERVAL_MS = 5000;

interface VersionResponse {
  version: number;
  lastUpdated: string;
}

export function useContentPolling(initialContent: SiteContent, initialVersion: number): SiteContent {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [version, setVersion] = useState<number>(initialVersion);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setContent(initialContent);
    setVersion(initialVersion);
  }, [initialContent, initialVersion]);

  useEffect(() => {
    let isMounted = true;

    const checkForUpdates = async () => {
      if (isFetchingRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      isFetchingRef.current = true;
      try {
        const versionRes = await fetch('/api/cms/version', { cache: 'no-store' });
        if (!versionRes.ok) return;

        const versionPayload = (await versionRes.json()) as VersionResponse;
        const remoteVersion = Number(versionPayload.version ?? 0);
        if (!Number.isFinite(remoteVersion) || remoteVersion <= version) return;

        const contentRes = await fetch('/api/cms/content', { cache: 'no-store' });
        if (!contentRes.ok) return;

        const nextContent = (await contentRes.json()) as SiteContent;
        if (!isMounted) return;

        setContent(nextContent);
        setVersion(remoteVersion);
      } catch {
        // Network hiccups should not interrupt the homepage experience.
      } finally {
        isFetchingRef.current = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, POLLING_INTERVAL_MS);

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [version]);

  return content;
}
