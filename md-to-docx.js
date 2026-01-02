import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import MarkdownIt from 'markdown-it';

// 初始化Markdown解析器
const md = new MarkdownIt();

// 读取Markdown文件
const readMarkdownFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

// 将Markdown转换为HTML
const convertMdToHtml = (mdContent) => {
  return md.render(mdContent);
};

// 将HTML转换为Word文档内容
const convertHtmlToDocx = (htmlContent, fileName) => {
  // 创建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: fileName.replace('.md', ''),
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '\n',
              }),
            ],
          }),
          // 简单处理HTML，提取文本内容
          new Paragraph({
            children: [
              new TextRun({
                text: htmlContent.replace(/<[^>]*>/g, ''),
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
};

// 保存Word文档
const saveDocxFile = async (doc, outputPath) => {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ 已生成Word文档: ${outputPath}`);
};

// 主函数
const main = async () => {
  // 获取当前目录下的所有Markdown文件
  const markdownFiles = fs
    .readdirSync('.')
    .filter((file) => path.extname(file) === '.md')
    .filter((file) => !file.startsWith('.')); // 排除隐藏文件

  console.log(
    `找到 ${markdownFiles.length} 个Markdown文件:\n${markdownFiles.join('\n')}\n`
  );

  // 转换每个Markdown文件
  for (const mdFile of markdownFiles) {
    try {
      const mdContent = readMarkdownFile(mdFile);
      const htmlContent = convertMdToHtml(mdContent);
      const doc = convertHtmlToDocx(htmlContent, mdFile);
      const outputPath = mdFile.replace('.md', '.docx');
      await saveDocxFile(doc, outputPath);
    } catch (error) {
      console.error(`✗ 转换失败 ${mdFile}: ${error.message}`);
    }
  }

  console.log('\n✅ 所有文件转换完成!');
};

// 执行主函数
main();
