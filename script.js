// 获取页面元素
const nameInput = document.getElementById('englishName');
const resultDiv = document.getElementById('result');
const styleSelect = document.getElementById('style');
const genderSelect = document.getElementById('gender');
const lengthSelect = document.getElementById('length');

// 调用后端服务的函数
async function callGenerateAPI(name, style, gender, length) {
    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                englishName: name,
                style: style,
                gender: gender,
                length: length
            })
        });
        return await response.json();
    } catch (error) {
        console.error('API调用失败:', error);
        return { error: 'Service is temporarily unavailable. Please try again later.' };
    }
}

// 生成名字的主函数
function generateNames() {
    const englishName = nameInput.value.trim();
    const style = styleSelect.value;
    const gender = genderSelect.value;
    const length = lengthSelect.value;
    
    // 简单输入校验
    if (!englishName) {
        alert('Please enter an English name.');
        return;
    }

    // 显示加载状态
    resultDiv.innerHTML = '<div class="loading">Generating...</div>';

    // 调用后端API
    callGenerateAPI(englishName, style, gender, length)
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `<div class="error">${data.error}</div>`;
            } else {
                displayResults(data.names);
            }
        });
}

// 显示生成结果
// 添加语音合成功能
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN'; // 设置为中文
        speechSynthesis.speak(utterance);
    }
}

// 更新显示结果的函数
function displayResults(names) {
    resultDiv.innerHTML = names.map(name => `
        <div class="name-card">
            <h3>${name.chinese} <span class="pinyin">${name.pinyin}</span></h3>
            <button onclick="speakText('${name.chinese}')">🔊 Listen</button>
            <p>Chinese Meaning: ${name.meaning_zh}</p>
            <p>English Meaning: ${name.meaning_en}</p>
            <p class="meme">Cultural Note: ${name.meme_explanation}</p>
        </div>
    `).join('');
}