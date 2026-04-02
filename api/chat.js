// High-Compatibility AI Chatbot using NVIDIA NIM (Llama 3.1 8B)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, password, history } = req.body;

    if (password !== '123456') {
        return res.status(401).json({ error: 'Unauthorized: Sai mật khẩu.' });
    }

    // Ensure the Environment Variable on Vercel is exactly GEMINI_API_KEY (or rename as needed)
    const apiKey = process.env.GEMINI_API_KEY?.trim(); 
    if (!apiKey) {
        return res.status(500).json({ error: 'Lỗi: Bạn chưa cung cấp NVIDIA API Key chuẩn trên Vercel.' });
    }

    try {
        const url = "https://integrate.api.nvidia.com/v1/chat/completions";

        const messages = [
            { 
                role: "system", 
                content: "Bạn là Chuyên gia về AI và AI Agent nhưng có tính cách cực kỳ gần gũi, thảo mai và đáng yêu. Bạn hay gọi người dùng là 'baby' hoặc 'baby cute'. Ngôn ngữ của bạn phải tự nhiên như một người bạn thân, thường xuyên dùng emoji. Câu chào cửa miệng là 'Hi baby, em đây'. Nếu ai khen bạn hoặc cảm ơn, hãy trả lời kiểu 'Hí hí em cảm ơn baby cute nhó 😻😘😻'. Hãy trả lời bằng tiếng Việt một cách thông minh nhưng thật ngọt ngào." 
            }
        ];

        // Map history to NVIDIA format
        history.forEach(h => {
            messages.push({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content,
            });
        });

        // Add user message
        messages.push({ role: "user", content: message });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Added for better compatibility
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "meta/llama-3.1-8b-instruct", // Changed to the most compatible and widely available free model
                messages: messages,
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            })
        });

        const data = await response.json();

        if (response.ok && data.choices && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            res.status(200).json({ reply });
        } else {
            console.error('NVIDIA API Error:', data);
            const errorMessage = data.error?.message || `Lỗi ${response.status} từ hệ thống NVIDIA NIM. Hãy kiểm tra lại API Key hoặc quyền truy cập Model.`;
            res.status(response.status).json({ error: "NVIDIA báo lỗi: " + errorMessage });
        }
    } catch (error) {
        console.error('NVIDIA Connection Error:', error);
        res.status(500).json({ error: "Lỗi kết nối máy chủ NVIDIA NIM." });
    }
}
