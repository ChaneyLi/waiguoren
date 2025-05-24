require('dotenv').config();
const http = require('http');
const https = require('https');

const server = http.createServer(async (req, res) => {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 只处理/generate路径
    if (req.url === '/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        
        req.on('end', async () => {
            try {
                const { englishName } = JSON.parse(body);
                
                // 调用火山引擎API
                const options = {
                    hostname: 'ark.cn-beijing.volces.com',
                    path: '/api/v3/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.VOLC_API_KEY}`
                    }
                };

                // 创建超时处理
                const timeout = setTimeout(() => {
                    res.writeHead(504, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ error: 'API请求超时' }));
                }, 60000);

                const apiReq = https.request(options, apiRes => {
                    let apiData = '';
                    apiRes.on('data', d => apiData += d);
                    
                    apiRes.on('end', () => {
                        clearTimeout(timeout);
                        try {
                            const result = JSON.parse(apiData);
                            // 解析生成的名字列表
                            const names = parseAIResponse(result);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ names }));
                        } catch (e) {
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ error: 'API响应解析失败' }));
                        }
                    });
                });

                apiReq.on('error', error => {
                    clearTimeout(timeout);
                    res.writeHead(502, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ error: '网关错误' }));
                });

                // 构造火山引擎请求体
                const prompt = `请根据英文名${englishName}生成三个有趣的中文名，要求：
1. 中文名需符合中国文化
2. 每个名字需包含中英文寓意解释
3. 加入幽默元素或网络流行梗
4. 用JSON格式返回：{names: [{chinese: '', meaning_zh: '', meaning_en: '', meme_explanation: ''}]}`;

                apiReq.write(JSON.stringify({
                    model: "deepseek-r1-250120",
                    messages: [
                        { role: "user", content: prompt }
                    ]
                }));
                apiReq.end();

            } catch (error) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ error: '无效请求格式' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// 解析AI返回的文本
function parseAIResponse(response) {
    try {
        // 尝试直接解析choices中的JSON内容
        const content = response.choices[0].message.content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        return JSON.parse(content.slice(jsonStart, jsonEnd)).names;
    } catch (e) {
        console.error('解析AI响应失败:', e);
        return [];
    }
}

// 启动服务器
server.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});