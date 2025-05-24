
# 中文名生成器项目文档

## 项目概述
这是一个为外国人生成有趣中文名的网站应用，结合了中国传统文化元素和现代网络流行梗。项目采用前后端分离架构，前端使用HTML/CSS/JavaScript，后端使用Node.js原生模块。

## 功能特点
- **智能命名**：根据英文名生成3个中文名
- **文化融合**：每个名字包含中英文寓意解释
- **幽默元素**：加入网络流行梗增加趣味性
- **风格选择**：支持90后/00后不同代际风格
- **性别适配**：可生成中性/男生专用/女生专属名字

## 文件结构
```
d:\z-waiguoren
├── index.html    # 前端页面
├── style.css     # 样式表
├── script.js     # 前端交互逻辑
└── server.js     # 后端服务
```

## 核心代码说明

### 前端页面 (index.html)
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>中文名生成器</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- 标题和装饰元素 -->
        <div class="header">
            <h1>中文名字生成器</h1>
            <div class="subtitle">Chinese Name Generator</div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-group">
            <input type="text" id="englishName" placeholder="输入英文名（如elon musk）">
            <button onclick="generateNames()">🎄 立即生成</button>
        </div>
        
        <!-- 结果展示区 -->
        <div id="result" class="results"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

## 使用说明
1. 安装Node.js环境
2. 启动后端服务：
   ```bash
   node server.js
   ```
3. 在浏览器中打开index.html

## 设计风格
- **主色调**：中国红(#C91F37)与米白(#FFF9F0)
- **字体**：思源黑体/宋体为主
- **装饰元素**：传统云纹和圣诞主题图标
- **交互效果**：加载动画、错误提示和悬停效果

## 技术栈
- 前端：HTML5, CSS3, JavaScript ES6
- 后端：Node.js原生http/https模块
- API：火山引擎DeepSeek R1

## 后续优化方向
1. 增加名字收藏功能
2. 添加更多风格选项(如古风、现代等)
3. 实现名字发音播放功能
4. 增加社交分享按钮

        