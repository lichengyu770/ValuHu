// 统计页面中所有按钮元素的数量
import { readFileSync } from 'fs';

// 读取HTML文件内容
const htmlContent = readFileSync('visual-index.html', 'utf8');

// 统计<button>标签的数量
const buttonCount = (htmlContent.match(/<button[^>]*>/g) || []).length;

// 统计具有按钮功能的<a>标签（带有button类或btn类）
const aButtonCount = (htmlContent.match(/<a[^>]*class=["'][^"']*(?:btn|button)[^"']*["'][^>]*>/g) || []).length;

// 统计具有按钮样式的div标签
const divButtonCount = (htmlContent.match(/<div[^>]*class=["'][^"']*(?:btn|button)[^"']*["'][^>]*>/g) || []).length;

// 总按钮数
const totalButtons = buttonCount + aButtonCount + divButtonCount;

console.log(`按钮元素统计：`);
console.log(`- <button>标签：${buttonCount}个`);
console.log(`- 具有按钮功能的<a>标签：${aButtonCount}个`);
console.log(`- 具有按钮样式的<div>标签：${divButtonCount}个`);
console.log(`总按钮数：${totalButtons}个`);
