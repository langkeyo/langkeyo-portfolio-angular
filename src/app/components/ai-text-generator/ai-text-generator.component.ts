import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  contentType: 'creative' | 'code' | 'poem' | 'story' | 'article';
  timestamp: string;
  liked?: boolean;
}

@Component({
  selector: 'app-ai-text-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-text-generator.component.html',
  styleUrls: ['./ai-text-generator.component.scss']
})
export class AiTextGeneratorComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef;

  prompt: string = '';
  isGenerating: boolean = false;
  selectedType: 'creative' | 'code' | 'poem' | 'story' | 'article' = 'creative';
  maxLength: number = 1000;
  temperature: number = 0.7;

  messages: ChatMessage[] = [];
  showExamples: boolean = false;
  showAdvancedSettings: boolean = false;
  currentTime: string = '';
  private shouldScrollToBottom: boolean = false;

  textTypes = [
    { value: 'creative', label: '创意写作', icon: '✨', description: '创造性和引人入胜的内容' },
    { value: 'code', label: '代码生成', icon: '💻', description: '生成干净、有注释的代码' },
    { value: 'poem', label: '诗歌创作', icon: '🎭', description: '优美的诗歌和韵律' },
    { value: 'story', label: '故事创作', icon: '📚', description: '有趣的故事和情节' },
    { value: 'article', label: '文章写作', icon: '📝', description: '信息丰富的文章内容' }
  ];

  examplePrompts = {
    creative: ['未来的智能城市', '时间旅行的冒险', '神秘的森林'],
    code: ['React组件', 'Python爬虫', 'API接口设计'],
    poem: ['春天的花朵', '夜空中的星星', '友谊的力量'],
    story: ['勇敢的小猫', '魔法学院', '太空探险'],
    article: ['人工智能的发展', '环保的重要性', '健康生活方式']
  };

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateCurrentTime();
    // 每分钟更新一次时间，使用 setTimeout 避免变更检测错误
    this.scheduleTimeUpdate();
  }

  private updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scheduleTimeUpdate(): void {
    setTimeout(() => {
      this.updateCurrentTime();
      this.cdr.detectChanges();
      this.scheduleTimeUpdate();
    }, 60000);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  setSelectedType(value: string): void {
    this.selectedType = value as 'creative' | 'code' | 'poem' | 'story' | 'article';
  }

  onTypeChange(): void {
    // 类型改变时的处理
  }

  sendMessage(): void {
    if (!this.prompt.trim() || this.isGenerating) {
      return;
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      type: 'user',
      content: this.prompt,
      contentType: this.selectedType,
      timestamp: this.getFixedTimestamp()
    };

    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    // 保存用户输入并清空
    const userPrompt = this.prompt;
    this.prompt = '';
    this.isGenerating = true;

    const options = {
      maxTokens: this.maxLength,
      temperature: this.temperature,
      type: this.selectedType
    };

    console.log('🎯 组件调用参数:', { userPrompt, options });
    this.geminiService.generateText(userPrompt, options).subscribe({
      next: (text) => {
        const aiMessage: ChatMessage = {
          type: 'ai',
          content: text,
          contentType: this.selectedType,
          timestamp: this.getFixedTimestamp()
        };

        this.messages.push(aiMessage);
        this.isGenerating = false;
        this.shouldScrollToBottom = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('文本生成失败:', error);
        const errorMessage: ChatMessage = {
          type: 'ai',
          content: '抱歉，生成失败了，请稍后重试。',
          contentType: this.selectedType,
          timestamp: this.getFixedTimestamp()
        };

        this.messages.push(errorMessage);
        this.isGenerating = false;
        this.shouldScrollToBottom = true;
        this.cdr.detectChanges();
      }
    });
  }

  useExamplePrompt(prompt: string): void {
    this.prompt = prompt;
    this.hideExamples();
    // 自动聚焦到输入框
    setTimeout(() => {
      if (this.chatInput) {
        this.chatInput.nativeElement.focus();
      }
    }, 100);
  }

  selectTypeAndShowExamples(type: string): void {
    this.setSelectedType(type);
    this.showExamples = true;
  }

  hideExamples(): void {
    this.showExamples = false;
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getCurrentTime(): string {
    // 使用固定的时间戳避免变更检测错误
    const now = new Date();
    // 将秒数设为0，避免频繁变化导致的检测错误
    now.setSeconds(0, 0);
    return now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFixedTimestamp(): string {
    // 生成一个固定的时间戳，避免Angular变更检测错误
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatMessage(content: string, contentType: string): string {
    if (contentType === 'code') {
      return `<pre><code>${this.escapeHtml(content)}</code></pre>`;
    } else if (contentType === 'poem') {
      return `<div class="poem-content">${this.formatPoem(content)}</div>`;
    } else {
      return this.formatText(content);
    }
  }

  private formatText(text: string): string {
    // 处理换行和段落
    return text
      .split('\n\n')
      .map(paragraph => `<p>${this.escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  private formatPoem(text: string): string {
    // 诗歌格式化
    return text
      .split('\n')
      .map(line => `<div class="poem-line">${this.escapeHtml(line)}</div>`)
      .join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  copyMessage(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('消息已复制到剪贴板');
      // 可以添加一个临时的成功提示
    });
  }

  regenerateMessage(index: number): void {
    if (index > 0 && this.messages[index - 1]?.type === 'user') {
      const userMessage = this.messages[index - 1];
      // 移除AI回复消息
      this.messages.splice(index, 1);

      // 重新生成
      this.isGenerating = true;
      const options = {
        maxTokens: this.maxLength,
        temperature: this.temperature,
        type: userMessage.contentType
      };

      this.geminiService.generateText(userMessage.content, options).subscribe({
        next: (text) => {
          const aiMessage: ChatMessage = {
            type: 'ai',
            content: text,
            contentType: userMessage.contentType,
            timestamp: this.getFixedTimestamp()
          };

          this.messages.splice(index, 0, aiMessage);
          this.isGenerating = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('重新生成失败:', error);
          this.isGenerating = false;
        }
      });
    }
  }

  likeMessage(index: number): void {
    if (this.messages[index]) {
      this.messages[index].liked = !this.messages[index].liked;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessages) {
        const element = this.chatMessages.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('滚动失败:', err);
    }
  }

  getSelectedTypeInfo() {
    return this.textTypes.find(type => type.value === this.selectedType);
  }
}
