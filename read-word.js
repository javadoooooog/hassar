const WordReaderTool = require('./.promptx/tool/word-reader.tool.js');
const fs = require('fs').promises;

async function readWordDocument() {
    const wordReader = new WordReaderTool();
    const filePath = 'd:\\Mirrors\\inbox\\乡村振兴历史地理分享（1）漠南蒙古.docx';
    
    try {
        const content = await wordReader.execute({ filePath });
        console.log('Word文档内容：');
        console.log(content);
        
        // 保存内容到文件
        await fs.writeFile('word-content.txt', content, 'utf8');
        console.log('\n内容已保存到 word-content.txt');
        
        return content;
    } catch (error) {
        console.error('读取Word文档时出错:', error.message);
    }
}

readWordDocument();