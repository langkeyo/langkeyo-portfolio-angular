import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// 尝试导入本地配置（如果存在）
let localConfig: any = null;
try {
  localConfig = require('../../environments/environment.local.ts').localConfig;
} catch (e) {
  // 本地配置文件不存在，使用默认配置
}

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

  constructor(private http: HttpClient) {}

  /**
   * 生成图像
   */
  generateImage(prompt: string, style: string = 'realistic'): Observable<ImageGenerationResult> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE') {
      return throwError(() => new Error('请先配置Hugging Face API Token'));
    }

    const fullPrompt = this.buildPromptWithStyle(prompt, style);
    const url = `${this.baseUrl}/${this.models.imageGeneration}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
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
          return from(error.error.text()).pipe(
            map(text => {
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
   * 文本生成
   */
  generateText(prompt: string, maxLength: number = 100): Observable<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_HUGGING_FACE_TOKEN_HERE') {
      return throwError(() => new Error('请先配置Hugging Face API Token'));
    }

    const url = `${this.baseUrl}/${this.models.textGeneration}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const requestBody = {
      inputs: prompt,
      parameters: {
        max_length: maxLength,
        temperature: 0.7,
        do_sample: true
      }
    };

    return this.http.post<any>(url, requestBody, { headers }).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0].generated_text || '';
        }
        return '';
      }),
      catchError(error => {
        console.error('文本生成失败:', error);
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
      'Content-Type': 'application/json'
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
    const stylePrompts = {
      'realistic': 'photorealistic, high quality, detailed, 8k resolution',
      'cartoon': 'cartoon style, colorful, fun, animated',
      'anime': 'anime style, manga, japanese art, detailed',
      'oil-painting': 'oil painting, classical art, brushstrokes, artistic',
      'watercolor': 'watercolor painting, soft colors, artistic, flowing',
      'digital-art': 'digital art, modern, vibrant colors, high quality'
    };

    const styleText = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['realistic'];
    return `${prompt}, ${styleText}`;
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
}
