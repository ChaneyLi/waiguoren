// 获取页面元素
const nameInput = document.getElementById('englishName');
const resultDiv = document.getElementById('result');

// 调用后端服务的函数
async function callGenerateAPI(name) {
    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ englishName: name })
        });
        return await response.json();
    } catch (error) {
        console.error('API调用失败:', error);
        return { error: '服务暂时不可用，请稍后再试' };
    }
}

// 生成名字的主函数
function generateNames() {
    const englishName = nameInput.value.trim();
    
    // 简单输入校验
    if (!englishName) {
        alert('请输入英文名');
        return;
    }

    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading">正在生成...</div>';

    // 调用后端API
    callGenerateAPI(englishName)
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `<div class="error">${data.error}</div>`;
            } else {
                displayResults(data.names);
            }
        });
}

// 显示生成结果
function displayResults(names) {
    resultDiv.innerHTML = names.map(name => `
        <div class="name-card">
            <h3>${name.chinese}</h3>
            <p>中文寓意：${name.meaning_zh}</p>
            <p>English Meaning：${name.meaning_en}</p>
            <p class="meme">${name.meme_explanation}</p>
        </div>
    `).join('');
}