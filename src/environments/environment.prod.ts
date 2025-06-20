export const environment = {
  production: true,
  geminiApiKey: 'AIzaSyD5YKEgBZXtDV9dtG72bWe-EZnvaFlsSeY', // 生产环境的 Gemini API Key
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
      baseUrl: 'https://qq-music-proxy.onrender.com' // 生产环境的音乐API地址
    },
    huggingFace: {
      apiKey: '', // 生产环境使用环境变量或GitHub Secrets
      baseUrl: 'https://api-inference.huggingface.co/models',
      models: {
        imageGeneration: 'stabilityai/stable-diffusion-xl-base-1.0',
        textGeneration: 'microsoft/DialoGPT-medium',
        imageToText: 'Salesforce/blip-image-captioning-base'
      }
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
