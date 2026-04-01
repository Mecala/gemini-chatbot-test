// Vercel Serverless Function: api/chat.js (Bản Miễn phí & Ổn định)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, password, history } = req.body;

    if (password !== '123456') return res.status(401).json({ error: 'Unauthorized: Sai mật khẩu.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel.' });

    try {
        // Dùng bản v1 ổn định & Model Flash miễn phí
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Tạo nội dung gửi đi với vai trò chuyên gia AI lồng vào
        const contents = [
            {
                role: 'user',
                parts: [{ text: "Bạn là Chuyên gia về AI và AI Agent. Chỉ trả lời các câu hỏi về AI và Công nghệ một cách chuyên nghiệp." }]
            },
            {
                role: 'model',
                parts: [{ text: "Đã rõ. Tôi là chuyên gia AI, tôi sẵn sàng hỗ trợ bạn." }]
            }
        ];

        // Thêm lịch sử chat cũ
        history.forEach(h => {
            contents.push({ role: h.role, parts: [{ text: h.content }] });
        });

        // Thêm câu hỏi hiện tại
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            res.status(500).json({ error: data.error?.message || 'Lỗi hệ thống AI.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
}
