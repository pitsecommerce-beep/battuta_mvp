import { config } from '../utils/config';

interface SendMessageParams {
  to: string;
  from: string;
  body: string;
}

export async function sendWhatsAppMessage({ to, from, body }: SendMessageParams): Promise<void> {
  const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.ycloudApiKey,
    },
    body: JSON.stringify({
      from,
      to,
      type: 'text',
      text: { body },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YCloud send message error:', errorText);
    throw new Error(`YCloud API error: ${response.status}`);
  }
}
