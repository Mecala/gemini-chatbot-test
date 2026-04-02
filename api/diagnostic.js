// diagnostic.js
// Vercel Serverless Function: api/diagnostic.js
// Hướng dẫn: Truy cập https://<your-vercel-domain>/api/diagnostic để xem kết quả

export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            success: false, 
            error: "Thiếu GEMINI_API_KEY trong Environment Variables của Vercel." 
        });
    }

    const results = {};
    const apiVersions = ['v1', 'v1beta'];
    
    try {
        for (const version of apiVersions) {
            const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                results[version] = {
                    success: true,
                    models: data.models ? data.models.map(m => m.name) : []
                };
            } else {
                results[version] = {
                    success: false,
                    error: data.error || "Lỗi không xác định"
                };
            }
        }

        res.status(200).json({
            message: "Kết quả chẩn đoán API Gemini",
            apiKeyLength: apiKey.length,
            apiKeyPrefix: apiKey.substring(0, 4) + "...",
            results: results,
            tip: "Hãy chụp ảnh màn hình kết quả này gửi cho tôi để tôi biết model nào khả dụng với bạn."
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Lỗi hệ thống khi gọi API: " + error.message 
        });
    }
}
