// Final Diagnostic and High-Compatibility chat.js

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
        // Using the most widely available free model path: v1beta / gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const contents = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message + " (Trả lời bằng tiếng Việt, tư cách chuyên gia AI và AI Agent)" }],
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.7,
                }
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply });
        } else {
            // Detailed error reporting to help identify the root cause
            console.error('Google API Error Details:', data);
            const errorMessage = data.error?.message || 'Lỗi không xác định từ Google.';
            const errorCode = data.error?.status || response.status;
            res.status(500).json({ error: `[${errorCode}] AI báo lỗi: ${errorMessage}` });
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: "Lỗi kết nối server nội bộ: " + error.message });
    }
}
