'use client';

import { useEffect } from 'react';
import { useSiteContent } from '@/lib/site-content';

export function SchemaInjector() {
  const siteContent = useSiteContent();

  useEffect(() => {
    const instagramHandle = siteContent.bookingInstagram.replace(/^@/, '');

    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Serbero Ink',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/app_logo.png`,
      description: 'Serbero Ink offers permanent custom tattoo art in a dark, vintage style. Book a session with a serious artist who makes every line intentional.',
      sameAs: [`https://instagram.com/${instagramHandle}`],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: siteContent.bookingEmail,
      },
    };

    // WebPage Schema
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Serbero Ink — Custom Tattoo Art',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      description: 'Serbero Ink offers permanent custom tattoo art in a dark, vintage style. Book a session with a serious artist who makes every line intentional.',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Serbero Ink',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
    };

    // LocalBusiness Schema
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Serbero Ink',
      image: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/app_logo.png`,
      description: 'Custom tattoo studio specializing in dark, vintage style permanent tattoo art.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New York',
        addressRegion: 'NY',
        addressCountry: 'US',
      },
      telephone: `+${siteContent.whatsappNumber.replace(/\D+/g, '')}`,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      sameAs: [`https://instagram.com/${instagramHandle}`],
      priceRange: '$$',
      serviceType: 'Tattoo Studio',
    };

    // Inject Organization Schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.id = 'org-schema';
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head?.appendChild(orgScript);

    // Inject WebPage Schema
    const webPageScript = document.createElement('script');
    webPageScript.type = 'application/ld+json';
    webPageScript.id = 'webpage-schema';
    webPageScript.textContent = JSON.stringify(webPageSchema);
    document.head?.appendChild(webPageScript);

    // Inject LocalBusiness Schema
    const localBusinessScript = document.createElement('script');
    localBusinessScript.type = 'application/ld+json';
    localBusinessScript.id = 'localbusiness-schema';
    localBusinessScript.textContent = JSON.stringify(localBusinessSchema);
    document.head?.appendChild(localBusinessScript);

    return () => {
      // Cleanup
      const orgScriptEl = document.getElementById('org-schema');
      const webPageScriptEl = document.getElementById('webpage-schema');
      const localBusinessScriptEl = document.getElementById('localbusiness-schema');
      if (orgScriptEl) orgScriptEl?.remove();
      if (webPageScriptEl) webPageScriptEl?.remove();
      if (localBusinessScriptEl) localBusinessScriptEl?.remove();
    };
  }, [siteContent.bookingEmail, siteContent.bookingInstagram, siteContent.whatsappNumber]);

  return null;
}