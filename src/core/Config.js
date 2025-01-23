// src/core/Config.js

// 配置对象
const configs = {};

// 预定义配置文件列表
// 这个列表需要手动维护，列出所有需要加载的配置文件
const configFiles = [
  'celestial.json',
  'scene.json',
  // ... 添加其他配置文件
];

// 异步加载所有配置文件
async function loadConfigs() {
  for (const file of configFiles) {
    try {
      const response = await fetch(`/src/config/${file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.json();
      const fileName = file.replace(/\.json$/, '');
      configs[fileName] = content;
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
  return configs;
}

// 导出加载配置的函数和配置对象
export { loadConfigs, configs };