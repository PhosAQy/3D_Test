// src/core/Config.js
const configs = {
  // 默认配置（安全后备值）
  defaults: {
    scene: {
      camera: {
        position: [0, 1e8, 5e8],  // 默认相机位置
        lookAt: [0, 0, 0]         // 默认观察点
      },
      renderQuality: 'medium',
      physics: {
        gravity: true,
        relativity: false
      }
    }
  }
};

// 配置文件映射表
const configStructure = {
  base: ['celestial', 'scene', 'physics'],
  development: ['debug'],
  production: ['optimization']
};

// 当前环境检测（通过URL参数或默认值）
const getCurrentEnv = () => {
  const urlParams = new URLSearchParams(location.search);
  return urlParams.get('env') || 'development'; // ?env=production 切换环境
};

// 异步加载配置
async function loadConfigs() {
  try {
    const env = getCurrentEnv();
    
    // 1. 加载基础配置
    await loadConfigGroup('base');
    
    // 2. 加载环境特定配置
    if (env === 'development') {
      await loadConfigGroup('development');
    } else {
      await loadConfigGroup('production');
    }

    // 3. 合并默认配置
    mergeConfigs(configs, configs.defaults);

    console.log('配置加载完成:', configs);
    return configs;
  } catch (error) {
    console.error('配置加载失败，使用默认值:', error);
    return configs.defaults;
  }
}

// 加载配置组
async function loadConfigGroup(groupName) {
  const files = configStructure[groupName] || [];
  
  for (const file of files) {
    const path = `/src/config/${groupName}/${file}.json`;
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      mergeConfigs(configs, data);
    } catch (error) {
      console.warn(`[Config] 加载 ${path} 失败:`, error.message);
    }
  }
}

// 深度合并配置
function mergeConfigs(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeConfigs(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

export { loadConfigs, configs };