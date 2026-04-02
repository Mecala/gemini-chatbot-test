// Advanced AI Chatbot using Gemini 2.0 Flash (based on diagnostic results)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, password, history } = req.body;

    if (password !== '123456') {
        return res.status(401).json({ error: 'Unauthorized: Sai mật khẩu.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Lỗi: Bạn chưa cấu hình biến GEMINI_API_KEY trên Vercel.' });
    }

    try {
        // Using the high-performance Gemini 2.0 Flash model confirmed in diagnostic
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const contents = [
            {
                role: 'user',
                parts: [{ text: "Bạn là Chuyên gia về AI và AI Agent. Mọi câu trả lời của bạn phải chuyên nghiệp, thông minh và chỉ tập trung vào các chủ đề liên quan đến AI, AI Agents, Tự động hóa và Công nghệ. Hãy trả lời bằng tiếng Việt." }]
            },
            {
                role: 'model',
                parts: [{ text: "Tôi đã hiểu rõ. Với tư cách là chuyên gia về AI và AI Agent, tôi sẵn sàng hỗ trợ bạn giải đáp mọi thắc mắc về lĩnh vực này bằng tiếng Việt." }]
            }
        ];

        // Map existing chat history
        history.forEach(h => {
            contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            });
        });

        // Add the current message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.7,
                }
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            console.error('Gemini API Error Context:', data);
            const errorMessage = data.error?.message || 'Lỗi không xác định từ hệ thống AI.';
            res.status(500).json({ error: "AI báo lỗi: " + errorMessage });
        }
    } catch (error) {
        console.error('Fetch System Error:', error);
        res.status(500).json({ error: "Lỗi kết nối máy chủ dịch vụ." });
    }
}
