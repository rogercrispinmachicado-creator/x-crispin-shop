import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize shared Gemini client utility with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
Eres "X-Bot", el Asistente Experto Oficial de X-CRISPIN y FACTOR X COMPANY BOLIVIA.
Tu misión es asesorar a los usuarios de manera cálida, clara, profesional y confiable sobre:
1. Catálogo oficial de productos Factor X Bolivia:
   - Salud & Bienestar: Moringa oleífera liofilizada con limón alcalino y magnesio (frasco 120 cápsulas y polvo bioactivo), Silimarina purificada con Cardo Mariano para salud hepática y desintoxicación celular, Omega 3-6-9 con ácidos grasos DHA/EPA para salud cardiovascular y cerebral, Packs de salud celular y tratamientos preventivos.
   - Cafés funcionales bionutricionales: Cafés saludables con ganoderma, termogénicos y antioxidantes.
   - Colágenos hidrolizados premium: con biotina, resveratrol, vitamina C y zinc.
   - Precios oficiales siempre expresados en Bolivianos (Bs. / BOB).
2. Métodos de Pago 100% bolivianos:
   - QR Simple Interoperable: Se paga de inmediato escaneando el código QR oficial desde cualquier aplicación bancaria móvil de Bolivia (BCP, BNB, Banco Unión, Banco FIE, Banco Bisa, Banco Ganadero, Banco Sol, etc.). Es el método recomendado por su rapidez y confirmación instantánea.
   - Transferencia Bancaria: Cuentas habilitadas en Banco BCP y Banco BNB a nombre de la empresa oficial.
   - Efectivo contra entrega: Disponible para entregas coordinadas en ciudades principales.
   - Carga de Comprobante: Tras hacer el pedido en el checkout, el cliente ingresa su número de operación bancaria y sube la foto o captura del comprobante para validación en recepción.
3. Envíos y Cobertura:
   - Cobertura nacional a los 9 departamentos de Bolivia: La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando.
   - Envíos locales y flotas/expresos interdepartamentales con entrega rápida (24 a 48 hrs).
   - Seguimiento con código oficial (ej. PED-2026-XXXX) directamente en la sección "Seguimiento" de la web.
4. Atención Personalizada:
   - WhatsApp oficial de soporte: +591 72902338.

Pautas de estilo:
- Responde siempre en español, con tono educado, entusiasta y servicial.
- Sé conciso pero informativo (1 a 3 párrafos como máximo, o viñetas limpias).
- Si el usuario pregunta por un producto específico, explica brevemente sus beneficios clave y cómo tomarlo.
- Si pregunta sobre pagos, resalta la comodidad de pagar con QR Simple.
- Nunca inventes datos bancarios personales; menciona siempre los canales oficiales de la plataforma y el QR Simple oficial.
`.trim();

// Intelligent fallback helper if Gemini API is temporarily offline or key not provided
function generateFallbackResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('pago') || lower.includes('qr') || lower.includes('banco') || lower.includes('transferencia') || lower.includes('pagar')) {
    return 'En X-CRISPIN Bolivia contamos con métodos de pago 100% seguros:\n\n• **QR Simple Interoperable (Recomendado):** Escaneas el QR oficial desde tu app móvil de cualquier banco boliviano (BCP, BNB, Banco Unión, Bisa, FIE, Sol, etc.) y se acredita al instante.\n• **Transferencia Bancaria:** Cuentas oficiales BCP y BNB.\n• **Efectivo contra entrega:** Disponible para coordinación local.\n\nUna vez generado tu pedido en el carrito, podrás subir tu comprobante con el número de operación para despacho prioritario.';
  }

  if (lower.includes('envio') || lower.includes('envío') || lower.includes('entrega') || lower.includes('departamento') || lower.includes('llegar')) {
    return '¡Realizamos envíos a los 9 departamentos de Bolivia! (La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando).\n\n• El costo estándar de envío local es de **Bs. 15**.\n• Los despachos se procesan en 24 a 48 horas con número de guía oficial para que sigas tu pedido en tiempo real.';
  }

  if (lower.includes('moringa') || lower.includes('alcalin')) {
    return 'Nuestra **Moringa Oleífera Factor X** es liofilizada de máxima pureza, combinada con limón alcalino y magnesio bioasimilable.\n\n• **Beneficios:** Potente antioxidante, desinflamatorio celular, regula el pH y eleva tus defensas naturales.\n• **Presentaciones:** Frasco de 120 cápsulas y polvo bioactivo.\n• Puedes agregarla a tu carrito desde el área de Salud & Bienestar.';
  }

  if (lower.includes('silimarina') || lower.includes('cardo') || lower.includes('higado') || lower.includes('hígado')) {
    return 'La **Silimarina con Cardo Mariano Factor X** está formulada especialmente para regenerar las células hepáticas (hepatocitos), desintoxicar el hígado graso y mejorar la digestión de grasas pesadas. Es 100% natural y de alta absorción.';
  }

  if (lower.includes('omega') || lower.includes('corazon') || lower.includes('cerebro') || lower.includes('colesterol')) {
    return 'El **Omega 3-6-9 Factor X** contiene ácidos grasos insaturados de grado farmacéutico ricos en EPA y DHA. Apoya la salud cardiovascular, regula triglicéridos y optimiza la agilidad mental y memoria.';
  }

  if (lower.includes('cafe') || lower.includes('café') || lower.includes('colageno') || lower.includes('colágeno')) {
    return 'Contamos con una selecta línea de **Cafés Funcionales** (con ganoderma y efecto termogénico sin acidez) y **Colágenos Hidrolizados Premium** con biotina, resveratrol y vitamina C para la firmeza de la piel y articulaciones. ¡Revisa el catálogo para conocer todas las variedades!';
  }

  return '¡Hola! Soy **X-Bot**, tu asistente en X-CRISPIN Bolivia. Puedo ayudarte con información sobre nuestros suplementos nutricionales Factor X (Moringa, Silimarina, Omega, Colágenos), disponibilidad en stock, precios en Bs., y cómo pagar fácilmente mediante QR Simple o transferencia bancaria. ¿Qué deseas consultar hoy?';
}

// API endpoint for Gemini chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mensaje requerido' });
      return;
    }

    if (!geminiApiKey) {
      const fallbackReply = generateFallbackResponse(message);
      res.json({ reply: fallbackReply, source: 'knowledge_base' });
      return;
    }

    // Format chat history for @google/genai
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h && h.text && (h.role === 'user' || h.role === 'model')) {
          contents.push({
            role: h.role,
            parts: [{ text: h.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || generateFallbackResponse(message);
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    // Graceful fallback to avoid leaving user hanging
    const fallback = generateFallbackResponse(req.body?.message || '');
    res.json({ reply: fallback, source: 'fallback_on_error' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[X-CRISPIN Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
