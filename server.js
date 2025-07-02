require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin');

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
                const { englishName, style, gender, length } = JSON.parse(body);
                
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
                const prompt = `Please generate three interesting Chinese names based on the English name "${englishName}".
Requirements:
1. The Chinese name should align with Chinese culture.
2. Each name needs a Chinese and English explanation of its meaning.
3. Incorporate humor or internet memes.
4. Filter by: Style - ${style}, Gender - ${gender}, Length - ${length === 'any' ? 'any' : length + ' characters'}.
5. Return in JSON format: {names: [{chinese: '', meaning_zh: '', meaning_en: '', meme_explanation: ''}]}`;

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
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        let extname = path.extname(filePath);
        let contentType = 'text/html';

        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpeg';
                break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code == 'ENOENT'){
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File not found');
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

// 解析AI返回的文本
// 在 parseAIResponse 函数中添加拼音转换
function parseAIResponse(response) {
    try {
        const content = response.choices[0].message.content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        const names = JSON.parse(content.slice(jsonStart, jsonEnd)).names;
        
        // 为每个名字添加拼音
        return names.map(name => ({
            ...name,
            pinyin: pinyin(name.chinese, {
                style: pinyin.STYLE_TONE, // 带声调的拼音
                segment: true // 分词
            }).map(p => p.join(' ')).join(' ')
        }));
    } catch (e) {
        console.error('解析AI响应失败:', e);
        return [];
    }
}

// 启动服务器
server.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});