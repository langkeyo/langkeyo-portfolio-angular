import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HuggingFaceService } from '../../services/hugging-face.service';

@Component({
  selector: 'app-ai-text-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-text-generator.component.html',
  styleUrls: ['./ai-text-generator.component.scss']
})
export class AiTextGeneratorComponent implements OnInit {
  prompt: string = '';
  generatedText: string = '';
  isGenerating: boolean = false;
  selectedType: 'creative' | 'code' | 'poem' | 'story' | 'article' = 'creative';
  maxLength: number = 200;
  temperature: number = 0.7;

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

  constructor(private huggingFaceService: HuggingFaceService) {}

  ngOnInit(): void {}

  generateText(): void {
    if (!this.prompt.trim() || this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.generatedText = '';

    const options = {
      maxLength: this.maxLength,
      temperature: this.temperature,
      type: this.selectedType
    };

    this.huggingFaceService.generateText(this.prompt, options).subscribe({
      next: (text) => {
        this.generatedText = text;
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('文本生成失败:', error);
        this.generatedText = '抱歉，文本生成失败，请稍后重试。';
        this.isGenerating = false;
      }
    });
  }

  useExamplePrompt(prompt: string): void {
    this.prompt = prompt;
  }

  copyToClipboard(): void {
    if (this.generatedText) {
      navigator.clipboard.writeText(this.generatedText).then(() => {
        // 可以添加一个提示消息
        console.log('文本已复制到剪贴板');
      });
    }
  }

  clearAll(): void {
    this.prompt = '';
    this.generatedText = '';
  }

  getSelectedTypeInfo() {
    return this.textTypes.find(type => type.value === this.selectedType);
  }
}
