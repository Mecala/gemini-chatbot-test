// Vercel Serverless Function: api/chat.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, password, history } = req.body;

    // Simple password check (matching frontend)
    if (password !== '123456') {
        return res.status(401).json({ error: 'Unauthorized: Sai mật khẩu.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel.' });
    }

    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Map history to Gemini format
        const contents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }));

        // Add latest message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "Bạn là Chuyên gia về AI và AI Agent. Hãy trả lời một cách chuyên nghiệp, thông minh và chỉ tập trung vào các chủ đề liên quan đến Trí tuệ nhân tạo (AI), AI Agents, Tự động hóa và Công nghệ. Nếu người dùng hỏi về chủ đề khác, hãy khéo léo từ chối và hướng họ quay lại chủ đề AI." }]
                },
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
            console.error('Gemini API Error:', data);
            res.status(500).json({ error: data.error?.message || 'Lỗi khi gọi Gemini API.' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
}
