import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// 本地配置 - 在生产环境中你可以直接在这里设置API密钥
const localConfig = {
  huggingFaceApiKey: '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' // 你的真实HF token
};

export interface ImageGenerationRequest {
  inputs: string;
  parameters?: {
    negative_prompt?: string;
    num_inference_steps?: number;
    guidance_scale?: number;
    width?: number;
    height?: number;
  };
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HuggingFaceService {
  private readonly apiKey = localConfig?.huggingFaceApiKey || environment.apis.huggingFace.apiKey;
  private readonly baseUrl = environment.apis.huggingFace.baseUrl;
  private readonly models = environment.apis.huggingFace.models;

  constructor(private http: HttpClient) {
    console.log('🔑 HuggingFace API Key状态:', this.apiKey ? '已配置' : '未配置');
    console.log('🔑 API Key长度:', this.apiKey?.length || 0);
  }

  /**
   * 生成图像
   */
  generateImage(prompt: string, style: string = 'realistic'): Observable<ImageGenerationResult> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE' || this.apiKey === '') {
      // 演示模式 - 使用随机图片
      console.log('🎨 演示模式：使用随机图片代替AI生成');
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            imageUrl: `https://picsum.photos/512/512?random=${Date.now()}&blur=1`
          });
          observer.complete();
        }, 2000); // 模拟API延迟
      });
    }

    const fullPrompt = this.buildPromptWithStyle(prompt, style);
    const url = `${this.baseUrl}/${this.models.imageGeneration}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'image/png'
    });

    const requestBody: ImageGenerationRequest = {
      inputs: fullPrompt,
      parameters: {
        num_inference_steps: 20,
        guidance_scale: 7.5,
        width: 512,
        height: 512
      }
    };

    console.log('🎨 发送图像生成请求:', fullPrompt);

    return this.http.post(url, requestBody, { 
      headers, 
      responseType: 'blob' 
    }).pipe(
      map((blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        console.log('✅ 图像生成成功');
        return {
          success: true,
          imageUrl: imageUrl
        };
      }),
      catchError(error => {
        console.error('❌ 图像生成失败:', error);
        
        let errorMessage = '图像生成失败';
        
        if (error.status === 401) {
          errorMessage = 'API Token无效，请检查配置';
        } else if (error.status === 429) {
          errorMessage = 'API调用次数超限，请稍后重试';
        } else if (error.status === 503) {
          errorMessage = '模型正在加载中，请稍后重试';
        } else if (error.error instanceof Blob) {
          // 尝试解析错误信息
          return from(error.error.text() as Promise<string>).pipe(
            map((text: string) => {
              try {
                const errorData = JSON.parse(text);
                return {
                  success: false,
                  error: errorData.error || errorMessage
                };
              } catch {
                return {
                  success: false,
                  error: errorMessage
                };
              }
            })
          );
        }
        
        return throwError(() => ({
          success: false,
          error: errorMessage
        }));
      })
    );
  }

  /**
   * 文本生成 - 增强版
   */
  generateText(prompt: string, options: {
    maxLength?: number;
    temperature?: number;
    type?: 'creative' | 'code' | 'poem' | 'story' | 'article';
  } = {}): Observable<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE') {
      return throwError(() => new Error('请先配置Hugging Face API Token'));
    }

    const { maxLength = 200, temperature = 0.7, type = 'creative' } = options;

    // 根据类型优化提示词
    const enhancedPrompt = this.enhancePromptByType(prompt, type);

    const url = `${this.baseUrl}/${this.models.textGeneration}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const requestBody = {
      inputs: enhancedPrompt,
      parameters: {
        max_length: maxLength,
        temperature: temperature,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    };

    console.log('🤖 发送文本生成请求:', enhancedPrompt);

    return this.http.post<any>(url, requestBody, { headers }).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          const generatedText = response[0].generated_text || '';
          // 清理生成的文本，移除原始提示词
          const cleanedText = this.cleanGeneratedText(generatedText, enhancedPrompt);
          console.log('✅ 文本生成成功');
          return cleanedText;
        }
        return '';
      }),
      catchError(error => {
        console.error('❌ 文本生成失败:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 图像描述生成
   */
  describeImage(imageFile: File): Observable<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE') {
      return throwError(() => new Error('请先配置Hugging Face API Token'));
    }

    const url = `${this.baseUrl}/${this.models.imageToText}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`
    });

    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<any>(url, formData, { headers }).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0].generated_text || '无法识别图像内容';
        }
        return '无法识别图像内容';
      }),
      catchError(error => {
        console.error('图像描述生成失败:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 检查API状态
   */
  checkApiStatus(): Observable<boolean> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE') {
      return throwError(() => new Error('请先配置Hugging Face API Token'));
    }

    const url = `${this.baseUrl}/${this.models.imageGeneration}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'image/png'
    });

    // 发送一个简单的请求来检查API状态
    const testRequest = {
      inputs: "test",
      parameters: { num_inference_steps: 1 }
    };

    return this.http.post(url, testRequest, { headers, responseType: 'blob' }).pipe(
      map(() => true),
      catchError(error => {
        if (error.status === 503) {
          // 模型正在加载，这是正常的
          return throwError(() => new Error('模型正在加载中，请稍后重试'));
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * 根据风格构建完整提示词
   */
  private buildPromptWithStyle(prompt: string, style: string): string {
    // 简单的中英文映射
    const chineseToEnglish: { [key: string]: string } = {
      '兔子': 'rabbit, cute bunny',
      '猫': 'cat, cute kitten',
      '狗': 'dog, cute puppy',
      '鸟': 'bird, beautiful bird',
      '花': 'flower, beautiful flower',
      '树': 'tree, beautiful tree',
      '山': 'mountain, landscape',
      '海': 'ocean, sea',
      '天空': 'sky, clouds',
      '房子': 'house, building',
      '汽车': 'car, vehicle',
      '人': 'person, human',
      '女孩': 'girl, young woman',
      '男孩': 'boy, young man',
      '风景': 'landscape, scenery',
      '城市': 'city, urban landscape'
    };

    // 检查是否包含中文，如果有则尝试翻译
    let translatedPrompt = prompt;
    for (const [chinese, english] of Object.entries(chineseToEnglish)) {
      if (prompt.includes(chinese)) {
        translatedPrompt = translatedPrompt.replace(chinese, english);
      }
    }

    const stylePrompts = {
      'realistic': 'photorealistic, high quality, detailed, 8k resolution',
      'cartoon': 'cartoon style, colorful, fun, animated',
      'anime': 'anime style, manga, japanese art, detailed',
      'oil-painting': 'oil painting, classical art, brushstrokes, artistic',
      'watercolor': 'watercolor painting, soft colors, artistic, flowing',
      'digital-art': 'digital art, modern, vibrant colors, high quality'
    };

    const styleText = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['realistic'];
    return `${translatedPrompt}, ${styleText}`;
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4',
      'stabilityai/stable-diffusion-2-1'
    ];
  }

  /**
   * 根据类型增强提示词
   */
  private enhancePromptByType(prompt: string, type: string): string {
    const typePrompts = {
      'creative': `Write a creative and engaging text about: ${prompt}`,
      'code': `Generate clean, well-commented code for: ${prompt}`,
      'poem': `Write a beautiful poem about: ${prompt}`,
      'story': `Tell an interesting story about: ${prompt}`,
      'article': `Write an informative article about: ${prompt}`
    };

    return typePrompts[type as keyof typeof typePrompts] || `Write about: ${prompt}`;
  }

  /**
   * 清理生成的文本
   */
  private cleanGeneratedText(generatedText: string, originalPrompt: string): string {
    // 移除原始提示词
    let cleaned = generatedText.replace(originalPrompt, '').trim();

    // 移除多余的空行
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 确保文本不为空
    if (!cleaned) {
      return generatedText;
    }

    return cleaned;
  }
}
