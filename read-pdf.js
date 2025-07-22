const fs = require('fs');
const pdf = require('pdf-parse');

async function readPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error reading PDF:', error);
        return null;
    }
}

// 读取蒙古三大部PDF
const pdfPath = 'd:\\Mirrors\\inbox\\蒙古三大部 (孛儿只斤·苏和，孛儿只斤·苏日娜，娜仁高娃编著, Beierzhijin Suhe etc.) (Z-Library).pdf';

readPDF(pdfPath).then(text => {
    if (text) {
        // 保存PDF内容到文件
        fs.writeFileSync('pdf-content.txt', text, 'utf8');
        console.log('PDF内容已保存到 pdf-content.txt');
        console.log('PDF内容长度:', text.length);
        console.log('前1000个字符:', text.substring(0, 1000));
    } else {
        console.log('无法读取PDF内容');
    }
}).catch(error => {
    console.error('读取PDF时出错:', error);
});