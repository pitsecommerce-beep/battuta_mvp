import { BotConfig, Product, Message } from '@prisma/client';
import { openai } from '../utils/openai';

interface GenerateResponseParams {
  botConfig: BotConfig;
  messages: Message[];
  products: Product[];
  userMessage: string;
}

export async function generateAIResponse({
  botConfig,
  messages,
  products,
  userMessage,
}: GenerateResponseParams): Promise<string> {
  const productList = products.length
    ? products
        .map(
          (p) =>
            `- ${p.name} (SKU: ${p.sku}) - $${p.price} - Stock: ${p.stock} - ${p.description}`
        )
        .join('\n')
    : 'No se encontraron productos relevantes.';

  const faqs = Array.isArray(botConfig.faqs)
    ? (botConfig.faqs as Array<{ question: string; answer: string }>)
        .map((f) => `P: ${f.question}\nR: ${f.answer}`)
        .join('\n\n')
    : '';

  const toneInstructions: Record<string, string> = {
    FORMAL: 'Responde de manera formal y profesional.',
    FRIENDLY: 'Responde de manera amigable y cercana.',
    TECHNICAL: 'Responde con precisión técnica y detalles específicos.',
  };

  const systemPrompt = `${botConfig.systemPrompt || 'Eres un asistente de ventas de autopartes por WhatsApp.'}

${toneInstructions[botConfig.tone] || toneInstructions.FRIENDLY}

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${botConfig.businessName}
- Dirección: ${botConfig.address}
- Horario: ${botConfig.hours}
- Métodos de pago: ${botConfig.paymentMethods}
- Política de envío: ${botConfig.shippingPolicy}

${faqs ? `PREGUNTAS FRECUENTES:\n${faqs}` : ''}

PRODUCTOS DISPONIBLES:
${productList}

INSTRUCCIONES:
- Responde siempre en español
- Ofrece productos relevantes cuando sea apropiado
- Si el cliente pregunta por un producto que no tienes, dilo amablemente
- Puedes generar cotizaciones cuando el cliente lo pida
- Sé conciso, los mensajes de WhatsApp deben ser cortos`;

  const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history (last 15 messages)
  for (const msg of messages) {
    if (msg.role === 'USER') {
      chatMessages.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'ASSISTANT') {
      chatMessages.push({ role: 'assistant', content: msg.content });
    }
  }

  chatMessages.push({ role: 'user', content: userMessage });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    max_tokens: 800,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
}
