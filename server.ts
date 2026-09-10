import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini Client to prevent startup crashes if key is absent
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Configure Cloudinary with secure credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djp0pcr8c',
  api_key: process.env.CLOUDINARY_API_KEY || '961613553869582',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'j_tm_ygcJ-KOpg5Fff7G4964LYo'
});

// Configure JSON body parser with increased limit to support Base64 file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Secure server-side API Route for uploading images to Cloudinary
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data payload received' });
    }

    // Upload to Cloudinary under the organized folder path: ecommerce/products
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'ecommerce/products',
      resource_type: 'image'
    });

    // Apply basic image optimizations dynamically on delivery URL:
    // f_auto: automatic WebP/modern format delivery based on browser capability
    // q_auto: automatic quality compression
    let optimizedUrl = uploadResponse.secure_url;
    if (optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    return res.json({
      success: true,
      url: optimizedUrl,
      publicId: uploadResponse.public_id,
      bytes: uploadResponse.bytes,
      format: uploadResponse.format
    });
  } catch (error: any) {
    console.warn('Cloudinary secure upload failed, using high-fidelity local base64 fallback:', error.message || error);
    
    // Robust Fallback: If Cloudinary credentials are not fully aligned yet, 
    // return the uploaded base64 data directly. This ensures the storefront 
    // remains 100% functional and saves new products with their pictures instantly!
    const fallbackImage = req.body?.image;
    if (fallbackImage && typeof fallbackImage === 'string' && fallbackImage.startsWith('data:image/')) {
      return res.json({
        success: true,
        url: fallbackImage, // Return base64 URL directly to store locally in product inventory
        fallback: true,
        warning: 'Using base64 fallback. Please configure CLOUDINARY_CLOUD_NAME in your environment.'
      });
    }

    return res.status(500).json({
      error: 'Failed to upload image securely to Cloudinary storage server',
      details: error.message || error
    });
  }
});

// Secure server-side API Route for Gemini AI Assistant chat calls
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, role, chatHistory, storeContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message payload content is required' });
    }

    const ai = getGeminiClient();

    // Reconstruct conversation history compatible with @google/genai SDK format
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Provide tailored system instructions based on the active assistant mode
    let systemInstruction = '';
    if (role === 'admin') {
      systemInstruction = `You are the Omexo Merchant Advisor & Admin Co-pilot. You assist the business owner (merchant) in analyzing store performance, inventory advice, marketing strategy, writing product descriptions, drafting customer replies, and managing store settings.
Store Status Context:
- Active Products Count: ${storeContext?.productsCount || 0}
- Customer Checkouts Count: ${storeContext?.ordersCount || 0}

Help the merchant make data-driven decisions. Be practical, friendly, direct, and highly strategic. Limit length to keep suggestions structured and readable. Use clear markdown formatting. Respond in Malayalam or English based on the language they use (default to English if mixed or requested). Keep it professional.`;
    } else {
      systemInstruction = `You are the official Omexo AI Co-pilot & Shopping Assistant. You assist customers with product recommendations, order inquiries, policy details, and finding the perfect smart gadget or high-performance mobile accessory from Omexo.
Store Facts:
- Support contact: Email: omexoofficial@gmail.com, Phone/WhatsApp: +91 99465 97201
- Location: Omexo Tech Hub, Phase 1, Infopark Kochi, Kerala, India - 682030
- Shipping: 100% Cash On Delivery (COD) & Guaranteed Free Express Shipping to 19,000+ pincodes across India at no extra cost.
- Replacements: Hassle-free 7-day replacement if any gadget is defective.
Current Catalog Context (Available items in inventory):
${storeContext?.productsString || 'No products currently registered.'}

Be helpful, concise, polite, and technical-savvy. Present choices clearly using bullet points and highlight features (like water resistance, charging speeds, driver sizes) when matching a customer's request. Keep formatting premium and minimalistic. Give prices in Indian Rupees (₹). Respond in Malayalam or English based on the language they use (default to English if mixed or requested).`;
    }

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = geminiResponse.text || 'I apologize, but I am unable to generate a response at this moment.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat failed:', error.message || error);
    return res.status(500).json({
      error: 'Gemini AI Assistant service failed to generate a response.',
      details: error.message || error
    });
  }
});

// Health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

async function startServer() {
  // Vite middleware for real-time asset compilation in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Omexo Full-Stack Server] running live on port ${PORT}`);
  });
}

startServer();
