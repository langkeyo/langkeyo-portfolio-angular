export const environment = {
  production: false,
  geminiApiKey: 'AIzaSyD5YKEgBZXtDV9dtG72bWe-EZnvaFlsSeY', // 在这里填入你的 Gemini API Key
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  
  // 其他 API 配置
  apis: {
    weather: {
      baseUrl: 'https://api.open-meteo.com/v1',
      geocoding: 'https://api.open-meteo.com/v1/geocoding'
    },
    quotes: {
      zenQuotes: 'https://zenquotes.io/api',
      adviceSlip: 'https://api.adviceslip.com/advice'
    },
    github: {
      baseUrl: 'https://api.github.com',
      username: 'langkeyo'
    },
    qqMusic: {
      baseUrl: 'http://localhost:3001'
    },
    huggingFace: {
      apiKey: '', // 在本地开发时手动设置，或使用环境变量
      baseUrl: 'https://api-inference.huggingface.co/models',
      models: {
        imageGeneration: 'stabilityai/stable-diffusion-xl-base-1.0',
        textGeneration: 'distilgpt2',
        imageToText: 'Salesforce/blip-image-captioning-base'
      }
    },
    gemini: {
      apiKey: 'AIzaSyD5YKEgBZXtDV9dtG72bWe-EZnvaFlsSeY', // 你的AI Studio API Key
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-1.5-flash-latest'
    }
  },
  
  // 功能开关
  features: {
    aiEnhanced: true,
    miniGames: true,
    musicPlayer: true,
    weatherWidget: true,
    githubStats: true
  },
  
  // 缓存配置
  cache: {
    geminiInsights: 30 * 60 * 1000, // 30分钟
    githubStats: 5 * 60 * 1000,     // 5分钟
    weatherData: 10 * 60 * 1000     // 10分钟
  }
};
