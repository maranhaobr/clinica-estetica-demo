import { clinic } from './config';

export function getWhatsAppUrl(procedure = '', number = clinic.whatsapp): string | null {
  if (!/^55\d{10,11}$/.test(number)) return null;
  const message = `Olá! Vim pelo site demonstrativo da Lumina e gostaria de conhecer a experiência de agendamento${procedure ? ` para ${procedure}` : ''}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
