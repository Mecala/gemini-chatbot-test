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
        
        // Use the stable 'v1' API version without 'systemInstruction' to avoid 400 errors
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });

        // Manually inject the persona into the conversation start
        const contents = [
            {
                role: 'user',
                parts: [{ text: "Bạn là Chuyên gia về AI và AI Agent. Hãy trả lời một cách chuyên nghiệp, thông minh và chỉ tập trung vào các chủ đề liên quan đến AI. Nếu lạc đề, hãy khéo léo dẫn dắt người dùng quay lại chủ đề chính." }]
            },
            {
                role: 'model',
                parts: [{ text: "Tôi đã hiểu. Với tư cách là chuyên gia về AI và AI Agent, tôi sẵn sàng hỗ trợ bạn ngay bây giờ về các chủ đề liên quan đến trí tuệ nhân tạo." }]
            }
        ];

        // Append the actual user chat history
        history.forEach(h => {
            contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            });
        });

        // Initialize chat with the manually constructed content (effectively setting the system instruction)
        const chat = model.startChat({ contents: contents });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Gemini SDK Error:', error);
        res.status(500).json({ error: "Lỗi kết nối AI: " + error.message });
    }
}
