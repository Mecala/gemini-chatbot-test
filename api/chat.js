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
        
        // Use the most legacy and stable model 'gemini-pro' to avoid 404 errors found with gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: 'v1' });

        // Manually inject the persona into the conversation start for maximum compatibility
        const contents = [
            {
                role: 'user',
                parts: [{ text: "Bạn là Chuyên gia về AI và AI Agent. Chỉ trả lời các câu hỏi về công nghệ AI và Tự động hóa." }]
            },
            {
                role: 'model',
                parts: [{ text: "Tôi hiểu. Tôi là Chuyên gia về AI và AI Agent, tôi sẵn sàng giải đáp các thắc mắc của bạn." }]
            }
        ];

        // Append the actual user chat history
        history.forEach(h => {
            contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            });
        });

        // Initialize chat
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
