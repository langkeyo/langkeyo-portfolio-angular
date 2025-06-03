import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

@Component({
  selector: 'app-ai-image-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-image-generator">
      <div class="generator-header">
        <h3>🎨 AI图像生成器</h3>
        <p>输入描述，AI为你创造独特的图像</p>
      </div>

      <div class="input-section">
        <div class="prompt-input">
          <textarea 
            [(ngModel)]="prompt" 
            placeholder="描述你想要的图像，例如：一只可爱的猫咪在花园里玩耍，卡通风格，明亮的色彩"
            rows="3"
            [disabled]="isGenerating">
          </textarea>
        </div>
        
        <div class="style-options">
          <label>风格选择：</label>
          <select [(ngModel)]="selectedStyle" [disabled]="isGenerating">
            <option value="realistic">写实风格</option>
            <option value="cartoon">卡通风格</option>
            <option value="anime">动漫风格</option>
            <option value="oil-painting">油画风格</option>
            <option value="watercolor">水彩风格</option>
            <option value="digital-art">数字艺术</option>
          </select>
        </div>

        <button 
          class="generate-btn" 
          (click)="generateImage()" 
          [disabled]="!prompt.trim() || isGenerating">
          <span *ngIf="!isGenerating">🎨 生成图像</span>
          <span *ngIf="isGenerating">
            <span class="loading-spinner"></span>
            生成中...
          </span>
        </button>
      </div>

      <div class="result-section" *ngIf="generatedImage || error">
        <div class="image-result" *ngIf="generatedImage && !error">
          <img [src]="generatedImage" alt="AI生成的图像" (load)="onImageLoad()">
          <div class="image-actions">
            <button class="download-btn" (click)="downloadImage()">
              📥 下载图像
            </button>
            <button class="share-btn" (click)="shareImage()">
              🔗 分享
            </button>
          </div>
        </div>

        <div class="error-message" *ngIf="error">
          <p>❌ {{ error }}</p>
          <button (click)="retryGeneration()">🔄 重试</button>
        </div>
      </div>

      <div class="gallery-section" *ngIf="imageHistory.length > 0">
        <h4>🖼️ 历史生成</h4>
        <div class="image-gallery">
          <div 
            class="gallery-item" 
            *ngFor="let item of imageHistory; let i = index"
            (click)="selectHistoryImage(item)">
            <img [src]="item.imageUrl" [alt]="item.prompt">
            <div class="gallery-overlay">
              <p>{{ item.prompt | slice:0:50 }}{{ item.prompt.length > 50 ? '...' : '' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <h4>💡 生成技巧</h4>
        <ul>
          <li>详细描述场景、颜色、风格</li>
          <li>使用形容词让图像更生动</li>
          <li>指定艺术风格获得更好效果</li>
          <li>避免过于复杂的描述</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./ai-image-generator.component.scss']
})
export class AiImageGeneratorComponent {
  prompt: string = '';
  selectedStyle: string = 'realistic';
  isGenerating: boolean = false;
  generatedImage: string | null = null;
  error: string | null = null;
  imageHistory: Array<{prompt: string, imageUrl: string, timestamp: Date}> = [];

  // Hugging Face API配置
  private readonly HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
  private readonly HF_API_KEY = 'hf_your_api_key_here'; // 需要替换为真实的API Key

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.loadImageHistory();
  }

  async generateImage() {
    if (!this.prompt.trim()) return;

    this.isGenerating = true;
    this.error = null;
    this.generatedImage = null;

    try {
      // 构建完整的提示词
      const fullPrompt = this.buildFullPrompt();
      
      // 调用Hugging Face API
      const result = await this.callHuggingFaceAPI(fullPrompt);
      
      if (result.success && result.imageUrl) {
        this.generatedImage = result.imageUrl;
        this.addToHistory(this.prompt, result.imageUrl);
      } else {
        this.error = result.error || '生成失败，请重试';
      }
    } catch (error) {
      console.error('图像生成错误:', error);
      this.error = '网络错误，请检查连接后重试';
    } finally {
      this.isGenerating = false;
      this.cdr.markForCheck();
    }
  }

  private buildFullPrompt(): string {
    const stylePrompts = {
      'realistic': 'photorealistic, high quality, detailed',
      'cartoon': 'cartoon style, colorful, fun',
      'anime': 'anime style, manga, japanese art',
      'oil-painting': 'oil painting, classical art, brushstrokes',
      'watercolor': 'watercolor painting, soft colors, artistic',
      'digital-art': 'digital art, modern, vibrant colors'
    };

    const styleText = stylePrompts[this.selectedStyle as keyof typeof stylePrompts] || '';
    return `${this.prompt}, ${styleText}`;
  }

  private async callHuggingFaceAPI(prompt: string): Promise<GenerationResult> {
    try {
      // 由于免费API限制，这里使用模拟数据
      // 实际使用时需要替换为真实的Hugging Face API调用
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 返回示例图像（实际应该是API生成的图像）
      return {
        success: true,
        imageUrl: `https://picsum.photos/512/512?random=${Date.now()}`
      };
      
      /* 真实API调用代码（需要API Key）:
      const response = await this.http.post(this.HF_API_URL, 
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      ).toPromise();

      const imageUrl = URL.createObjectURL(response);
      return { success: true, imageUrl };
      */
      
    } catch (error) {
      return {
        success: false,
        error: '生成失败，请重试'
      };
    }
  }

  onImageLoad() {
    console.log('图像加载完成');
  }

  downloadImage() {
    if (this.generatedImage) {
      const link = document.createElement('a');
      link.href = this.generatedImage;
      link.download = `ai-generated-${Date.now()}.png`;
      link.click();
    }
  }

  shareImage() {
    if (this.generatedImage && navigator.share) {
      navigator.share({
        title: 'AI生成的图像',
        text: `我用AI生成了这张图像：${this.prompt}`,
        url: this.generatedImage
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(this.generatedImage || '');
      alert('图像链接已复制到剪贴板');
    }
  }

  retryGeneration() {
    this.generateImage();
  }

  selectHistoryImage(item: any) {
    this.generatedImage = item.imageUrl;
    this.prompt = item.prompt;
    this.error = null;
  }

  private addToHistory(prompt: string, imageUrl: string) {
    const historyItem = {
      prompt,
      imageUrl,
      timestamp: new Date()
    };
    
    this.imageHistory.unshift(historyItem);
    
    // 限制历史记录数量
    if (this.imageHistory.length > 6) {
      this.imageHistory = this.imageHistory.slice(0, 6);
    }
    
    this.saveImageHistory();
  }

  private loadImageHistory() {
    const saved = localStorage.getItem('ai-image-history');
    if (saved) {
      try {
        this.imageHistory = JSON.parse(saved);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }
  }

  private saveImageHistory() {
    localStorage.setItem('ai-image-history', JSON.stringify(this.imageHistory));
  }
}
