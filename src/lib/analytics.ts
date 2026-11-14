export type TrackingEvent = 'click_whatsapp' | 'click_agendar' | 'view_procedimento' | 'click_instagram' | 'click_telefone';
declare global { interface Window { gtag?: (...args: unknown[]) => void; } }
export function track(event: TrackingEvent, data: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('lumina:analytics', { detail: { event, ...data } }));
  // Somente encaminhar a uma integração instalada após consentimento explícito.
  if (localStorage.getItem('lumina-analytics-consent') === 'granted' && process.env.NEXT_PUBLIC_GA_ID) window.gtag?.('event', event, data);
}
