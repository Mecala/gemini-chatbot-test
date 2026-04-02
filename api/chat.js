// Multi-Model Auto-Retry Chat Logic

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

    // List of models to try in order of preference
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    let lastError = "";

    for (const modelName of modelsToTry) {
        try {
            // Using v1beta for widest availability of newer models
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const contents = history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            }));

            contents.push({
                role: 'user',
                parts: [{ text: `Bạn là Chuyên gia về AI và AI Agent. Hãy trả lời câu hỏi sau bằng tiếng Việt: ${message}` }],
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
                // Success! Return the response and exit the handler
                return res.status(200).json({ reply });
            } else {
                lastError = data.error?.message || "Unknown error";
                console.error(`Attempt with model ${modelName} failed: ${lastError}`);
                // Continue to the next model in the list
            }
        } catch (error) {
            lastError = error.message;
            console.error(`Network error with model ${modelName}: ${lastError}`);
        }
    }

    // If we reach here, all models have failed
    res.status(500).json({ 
        error: `Tất cả các mô hình AI đều không phản hồi. Lỗi cuối cùng: ${lastError}. Vui lòng kiểm tra lại API Key hoặc khu vực khả dụng của tài khoản Google.` 
    });
}
