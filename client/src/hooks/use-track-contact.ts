import { useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

type ButtonType = 'whatsapp' | 'call' | 'message' | 'consultation';

export const useTrackContactEvent = () => {
  const { user } = useAuth();

  const trackEvent = useCallback((buttonType: ButtonType, pageUrl?: string) => {
    // Send to backend
    fetch('/api/analytics/contact-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buttonType,
        pageUrl: pageUrl || window.location.pathname,
        userAgent: navigator.userAgent,
        ipAddress: 'auto',
        userId: user?.id,
        sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
      }),
    }).catch(console.error);

    // Send to GA4 if enabled
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_interaction', {
        button_type: buttonType,
        page_location: pageUrl || window.location.pathname,
      });
    }
  }, [user?.id]);

  return { trackEvent };
};
