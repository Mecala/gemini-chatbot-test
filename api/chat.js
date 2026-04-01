import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, password, history } = req.body;

    // Simple password check
    if (password !== '123456') {
        return res.status(401).json({ error: 'Unauthorized: Sai mật khẩu.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Explicitly set apiVersion to 'v1' to avoid the v1beta 404 error
        const model = genAI.getGenerativeModel(
            { 
                model: "gemini-1.5-flash",
                systemInstruction: "Bạn là Chuyên gia về AI và AI Agent. Hãy trả lời một cách chuyên nghiệp, thông minh và chỉ tập trung vào các chủ đề liên quan đến AI. Nếu lạc đề, hãy khéo léo dẫn dắt người dùng quay lại chủ đề chính."
            },
            { apiVersion: 'v1' }
        );

        // Initialize chat with history
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Gemini SDK Error:', error);
        res.status(500).json({ error: "Lỗi kết nối AI: " + error.message });
    }
}
