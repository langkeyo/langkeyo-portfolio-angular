import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface DesignSuggestion {
  type: 'component' | 'color' | 'layout' | 'trend';
  title: string;
  description: string;
  code?: string;
  colors?: string[];
  preview?: string;
  tags: string[];
}

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  description: string;
}

interface LayoutSuggestion {
  name: string;
  description: string;
  code: string;
  preview: string;
  responsive: boolean;
}

@Component({
  selector: 'app-ai-design-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="ai-design-assistant-section py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <!-- 标题区域 -->
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-800 mb-6">
            🎨 AI 设计助手系统
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            智能UI组件生成、颜色搭配建议、布局优化和设计趋势分析
          </p>
        </div>

        <!-- 功能选择区域 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <button
            *ngFor="let tab of designTabs"
            (click)="setActiveTab(tab.key)"
            [class]="getTabClass(tab.key)"
            class="p-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <div class="text-3xl mb-3">{{ tab.icon }}</div>
            <h3 class="font-semibold text-lg mb-2">{{ tab.name }}</h3>
            <p class="text-sm opacity-80">{{ tab.description }}</p>
          </button>
        </div>

        <!-- 输入区域 -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <textarea
                [(ngModel)]="designPrompt"
                placeholder="描述您的设计需求..."
                class="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                [disabled]="isGenerating"
              ></textarea>
            </div>
            <div class="flex flex-col gap-4">
              <select
                [(ngModel)]="selectedFramework"
                class="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                [disabled]="isGenerating"
              >
                <option value="react">React</option>
                <option value="vue">Vue.js</option>
                <option value="angular">Angular</option>
                <option value="html">HTML/CSS</option>
                <option value="tailwind">Tailwind CSS</option>
              </select>
              <button
                (click)="generateDesignSuggestions()"
                [disabled]="!designPrompt.trim() || isGenerating"
                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <div *ngIf="isGenerating" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  生成中...
                </div>
                <span *ngIf="!isGenerating">✨ 生成设计建议</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 结果展示区域 -->
        <div *ngIf="suggestions.length > 0" class="space-y-8">
          <!-- 组件代码生成 -->
          <div *ngIf="activeTab === 'component'" class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-3xl mr-3">🧩</span>
              UI 组件代码生成
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div *ngFor="let suggestion of getFilteredSuggestions('component')" 
                   class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <h4 class="font-semibold text-lg mb-3">{{ suggestion.title }}</h4>
                <p class="text-gray-600 mb-4">{{ suggestion.description }}</p>
                <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre class="text-green-400 text-sm"><code>{{ suggestion.code }}</code></pre>
                </div>
                <div class="flex flex-wrap gap-2 mt-4">
                  <span *ngFor="let tag of suggestion.tags" 
                        class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 颜色搭配建议 -->
          <div *ngIf="activeTab === 'color'" class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-3xl mr-3">🎨</span>
              颜色搭配建议
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div *ngFor="let palette of colorPalettes" 
                   class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <h4 class="font-semibold text-lg mb-3">{{ palette.name }}</h4>
                <p class="text-gray-600 mb-4 text-sm">{{ palette.description }}</p>
                <div class="grid grid-cols-5 gap-2 mb-4">
                  <div class="h-12 rounded-lg" [style.background-color]="palette.primary" [title]="'Primary: ' + palette.primary"></div>
                  <div class="h-12 rounded-lg" [style.background-color]="palette.secondary" [title]="'Secondary: ' + palette.secondary"></div>
                  <div class="h-12 rounded-lg" [style.background-color]="palette.accent" [title]="'Accent: ' + palette.accent"></div>
                  <div class="h-12 rounded-lg" [style.background-color]="palette.background" [title]="'Background: ' + palette.background"></div>
                  <div class="h-12 rounded-lg" [style.background-color]="palette.text" [title]="'Text: ' + palette.text"></div>
                </div>
                <div class="space-y-1 text-xs text-gray-500">
                  <div>Primary: {{ palette.primary }}</div>
                  <div>Secondary: {{ palette.secondary }}</div>
                  <div>Accent: {{ palette.accent }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 布局优化建议 -->
          <div *ngIf="activeTab === 'layout'" class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-3xl mr-3">📐</span>
              布局优化建议
            </h3>
            <div class="space-y-6">
              <div *ngFor="let layout of layoutSuggestions" 
                   class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="font-semibold text-lg">{{ layout.name }}</h4>
                    <p class="text-gray-600">{{ layout.description }}</p>
                  </div>
                  <span *ngIf="layout.responsive" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    📱 响应式
                  </span>
                </div>
                <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                  <pre class="text-green-400 text-sm"><code>{{ layout.code }}</code></pre>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 mb-2">预览效果：</div>
                  <div class="text-sm" [innerHTML]="layout.preview"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 设计趋势分析 -->
          <div *ngIf="activeTab === 'trend'" class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-3xl mr-3">📈</span>
              2025 设计趋势分析
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div *ngFor="let trend of designTrends" 
                   class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <h4 class="font-semibold text-lg mb-3">{{ trend.title }}</h4>
                <p class="text-gray-600 mb-4">{{ trend.description }}</p>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of trend.tags" 
                        class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div *ngIf="suggestions.length === 0 && !isGenerating" class="text-center py-16">
          <div class="text-6xl mb-4">🎨</div>
          <h3 class="text-2xl font-semibold text-gray-700 mb-2">开始您的设计之旅</h3>
          <p class="text-gray-500">输入您的设计需求，让AI为您生成专业的设计建议</p>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./ai-design-assistant.component.scss']
})
export class AiDesignAssistantComponent implements OnInit {
  // 组件状态
  designPrompt = '';
  selectedFramework = 'react';
  activeTab = 'component';
  isGenerating = false;
  
  // 数据
  suggestions: DesignSuggestion[] = [];
  colorPalettes: ColorPalette[] = [];
  layoutSuggestions: LayoutSuggestion[] = [];
  designTrends: DesignSuggestion[] = [];

  // 功能标签
  designTabs = [
    {
      key: 'component',
      name: '组件生成',
      icon: '🧩',
      description: 'UI组件代码生成'
    },
    {
      key: 'color',
      name: '颜色搭配',
      icon: '🎨',
      description: '智能配色方案'
    },
    {
      key: 'layout',
      name: '布局优化',
      icon: '📐',
      description: '响应式布局建议'
    },
    {
      key: 'trend',
      name: '设计趋势',
      icon: '📈',
      description: '2025年设计趋势'
    }
  ];

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🎨 AI设计助手组件已初始化');
    this.loadDefaultTrends();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getTabClass(tab: string): string {
    const baseClass = 'text-center cursor-pointer';
    if (this.activeTab === tab) {
      return `${baseClass} bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg`;
    }
    return `${baseClass} bg-white text-gray-700 hover:bg-gray-50 border border-gray-200`;
  }

  getFilteredSuggestions(type: string): DesignSuggestion[] {
    return this.suggestions.filter(s => s.type === type);
  }

  generateDesignSuggestions() {
    if (!this.designPrompt.trim()) return;

    this.isGenerating = true;
    this.suggestions = [];
    this.colorPalettes = [];
    this.layoutSuggestions = [];

    // 根据当前选中的标签生成相应的建议
    switch (this.activeTab) {
      case 'component':
        this.generateComponentCode();
        break;
      case 'color':
        this.generateColorPalettes();
        break;
      case 'layout':
        this.generateLayoutSuggestions();
        break;
      case 'trend':
        this.generateTrendAnalysis();
        break;
    }
  }

  private generateComponentCode() {
    const prompt = `作为一个专业的UI/UX设计师和前端开发专家，请根据以下需求为${this.selectedFramework}框架生成3个不同的UI组件实现方案：

需求：${this.designPrompt}

请为每个方案提供：
1. 组件名称和简短描述
2. 完整的可运行代码（包含样式）
3. 使用说明和最佳实践
4. 适用场景标签

要求：
- 代码要现代化、可访问性友好
- 遵循2025年设计趋势
- 包含响应式设计
- 代码简洁易维护`;

    this.geminiService.generateText(prompt, {
      type: 'code',
      maxTokens: 3000,
      temperature: 0.3
    }).subscribe({
      next: (response) => {
        this.parseComponentResponse(response);
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 组件生成失败:', error);
        this.generateFallbackComponents();
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private generateColorPalettes() {
    const prompt = `作为一个专业的色彩设计师，请根据以下设计需求生成3-4个配色方案：

需求：${this.designPrompt}

请为每个配色方案提供：
1. 方案名称和设计理念
2. 主色、辅色、强调色、背景色、文字色的具体色值（HEX格式）
3. 适用场景和情感表达
4. 色彩心理学分析

要求：
- 符合2025年设计趋势
- 考虑可访问性（对比度）
- 提供明暗两种模式
- 色彩搭配和谐统一`;

    this.geminiService.generateText(prompt, {
      type: 'creative',
      maxTokens: 2000,
      temperature: 0.4
    }).subscribe({
      next: (response) => {
        this.parseColorResponse(response);
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 颜色生成失败:', error);
        this.generateFallbackColorPalettes();
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private generateLayoutSuggestions() {
    const prompt = `作为一个专业的UI/UX设计师，请根据以下需求生成3个响应式布局方案：

需求：${this.designPrompt}
框架：${this.selectedFramework}

请为每个布局方案提供：
1. 布局名称和设计理念
2. 完整的CSS/框架代码
3. 响应式断点设计
4. 可访问性考虑
5. 性能优化建议

要求：
- 遵循现代设计原则
- 支持移动优先设计
- 考虑用户体验
- 代码简洁高效
- 符合2025年布局趋势`;

    this.geminiService.generateText(prompt, {
      type: 'code',
      maxTokens: 2500,
      temperature: 0.3
    }).subscribe({
      next: (response) => {
        this.parseLayoutResponse(response);
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 布局生成失败:', error);
        this.generateFallbackLayouts();
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private generateTrendAnalysis() {
    const prompt = `作为一个设计趋势专家，请根据以下设计需求分析2025年相关的设计趋势：

需求：${this.designPrompt}

请提供：
1. 4-5个相关的2025年设计趋势
2. 每个趋势的详细说明和应用场景
3. 如何将这些趋势应用到当前项目
4. 趋势的技术实现要点
5. 未来发展预测

重点关注：
- 玻璃态设计 (Glassmorphism)
- 新拟态设计 (Neumorphism)
- 动态渐变和流体设计
- 微交互和动画
- 可持续设计理念
- AI驱动的个性化设计
- 无障碍设计趋势`;

    this.geminiService.generateText(prompt, {
      type: 'creative',
      maxTokens: 2000,
      temperature: 0.5
    }).subscribe({
      next: (response) => {
        this.parseTrendResponse(response);
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 趋势分析失败:', error);
        this.loadDefaultTrends();
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private parseComponentResponse(response: string) {
    // 解析AI响应并生成组件建议
    try {
      // 简单的文本解析，实际项目中可以使用更复杂的解析逻辑
      const suggestions: DesignSuggestion[] = [];

      // 尝试从响应中提取组件信息
      const lines = response.split('\n');
      let currentComponent: Partial<DesignSuggestion> = {};
      let codeBlock = '';
      let inCodeBlock = false;

      for (const line of lines) {
        if (line.includes('```')) {
          if (inCodeBlock) {
            currentComponent.code = codeBlock.trim();
            codeBlock = '';
            inCodeBlock = false;
          } else {
            inCodeBlock = true;
          }
        } else if (inCodeBlock) {
          codeBlock += line + '\n';
        } else if (line.trim() && !currentComponent.title) {
          currentComponent.title = line.trim().replace(/^\d+\.\s*/, '');
          currentComponent.type = 'component';
          currentComponent.tags = ['AI生成', this.selectedFramework];
        } else if (line.trim() && currentComponent.title && !currentComponent.description) {
          currentComponent.description = line.trim();
        }

        // 如果收集到完整信息，添加到建议列表
        if (currentComponent.title && currentComponent.description && currentComponent.code) {
          suggestions.push(currentComponent as DesignSuggestion);
          currentComponent = {};
        }
      }

      if (suggestions.length > 0) {
        this.suggestions = suggestions;
      } else {
        this.generateFallbackComponents();
      }
    } catch (error) {
      console.error('解析响应失败:', error);
      this.generateFallbackComponents();
    }
  }

  private parseColorResponse(response: string) {
    try {
      // 解析颜色方案响应
      const palettes: ColorPalette[] = [];

      // 简单的文本解析逻辑
      const sections = response.split(/\d+\./);

      for (const section of sections) {
        if (section.trim()) {
          const lines = section.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            const palette: ColorPalette = {
              name: lines[0].trim(),
              primary: this.extractColor(section, '主色') || '#8B5CF6',
              secondary: this.extractColor(section, '辅色') || '#3B82F6',
              accent: this.extractColor(section, '强调色') || '#06B6D4',
              background: this.extractColor(section, '背景色') || '#F8FAFC',
              text: this.extractColor(section, '文字色') || '#1E293B',
              description: lines.slice(1).join(' ').substring(0, 100) + '...'
            };
            palettes.push(palette);
          }
        }
      }

      if (palettes.length > 0) {
        this.colorPalettes = palettes;
      } else {
        this.generateFallbackColorPalettes();
      }
    } catch (error) {
      console.error('解析颜色响应失败:', error);
      this.generateFallbackColorPalettes();
    }
  }

  private parseLayoutResponse(response: string) {
    try {
      // 解析布局建议响应
      const layouts: LayoutSuggestion[] = [];

      const sections = response.split(/\d+\./);

      for (const section of sections) {
        if (section.trim()) {
          const lines = section.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            const codeMatch = section.match(/```[\s\S]*?```/);
            const layout: LayoutSuggestion = {
              name: lines[0].trim(),
              description: lines.slice(1, 3).join(' '),
              code: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').trim() : '/* 代码示例 */',
              preview: '响应式布局预览',
              responsive: section.includes('响应式') || section.includes('mobile')
            };
            layouts.push(layout);
          }
        }
      }

      if (layouts.length > 0) {
        this.layoutSuggestions = layouts;
      } else {
        this.generateFallbackLayouts();
      }
    } catch (error) {
      console.error('解析布局响应失败:', error);
      this.generateFallbackLayouts();
    }
  }

  private parseTrendResponse(response: string) {
    try {
      // 解析趋势分析响应
      const trends: DesignSuggestion[] = [];

      const sections = response.split(/\d+\./);

      for (const section of sections) {
        if (section.trim()) {
          const lines = section.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            const trend: DesignSuggestion = {
              type: 'trend',
              title: lines[0].trim(),
              description: lines.slice(1).join(' ').substring(0, 200) + '...',
              tags: this.extractTags(section)
            };
            trends.push(trend);
          }
        }
      }

      if (trends.length > 0) {
        this.designTrends = trends;
      } else {
        this.loadDefaultTrends();
      }
    } catch (error) {
      console.error('解析趋势响应失败:', error);
      this.loadDefaultTrends();
    }
  }

  private extractColor(text: string, colorType: string): string | null {
    const regex = new RegExp(`${colorType}[：:][\\s]*([#][0-9A-Fa-f]{6})`, 'i');
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  private extractTags(text: string): string[] {
    const tags = [];
    if (text.includes('玻璃态') || text.includes('Glassmorphism')) tags.push('玻璃态');
    if (text.includes('新拟态') || text.includes('Neumorphism')) tags.push('新拟态');
    if (text.includes('渐变')) tags.push('渐变');
    if (text.includes('动画')) tags.push('动画');
    if (text.includes('响应式')) tags.push('响应式');
    if (text.includes('可访问性')) tags.push('可访问性');
    return tags.length > 0 ? tags : ['2025趋势'];
  }

  private generateFallbackComponents() {
    this.suggestions = [
      {
        type: 'component',
        title: '现代卡片组件',
        description: '具有悬停效果和阴影的现代化卡片设计',
        code: `const Card = ({ title, content, image }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
};`,
        tags: ['React', '卡片', '悬停效果', '现代化']
      },
      {
        type: 'component',
        title: '渐变按钮组件',
        description: '支持多种状态的渐变按钮设计',
        code: `const GradientButton = ({ children, variant = 'primary', size = 'md', onClick, disabled }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${variants[variant]} \${sizes[size]} text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none\`}
    >
      {children}
    </button>
  );
};`,
        tags: ['React', '按钮', '渐变', '交互']
      }
    ];
  }

  private generateFallbackColorPalettes() {
    this.colorPalettes = [
      {
        name: '现代紫蓝',
        primary: '#8B5CF6',
        secondary: '#3B82F6',
        accent: '#06B6D4',
        background: '#F8FAFC',
        text: '#1E293B',
        description: '现代化的紫蓝色调，适合科技和创新类产品'
      },
      {
        name: '温暖橙红',
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#F97316',
        background: '#FFFBEB',
        text: '#92400E',
        description: '温暖活力的橙红配色，适合创意和娱乐类应用'
      },
      {
        name: '自然绿调',
        primary: '#10B981',
        secondary: '#059669',
        accent: '#34D399',
        background: '#F0FDF4',
        text: '#064E3B',
        description: '清新自然的绿色系，适合健康和环保主题'
      }
    ];
  }

  private generateFallbackLayouts() {
    this.layoutSuggestions = [
      {
        name: '网格布局',
        description: '响应式网格布局，适合展示卡片内容',
        code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}`,
        preview: '自适应网格，在不同屏幕尺寸下自动调整列数',
        responsive: true
      },
      {
        name: 'Flexbox 居中布局',
        description: '完美居中的Flexbox布局',
        code: `.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.content {
  max-width: 800px;
  width: 100%;
  text-align: center;
}`,
        preview: '内容在页面中完美居中显示',
        responsive: true
      }
    ];
  }

  private loadDefaultTrends() {
    this.designTrends = [
      {
        type: 'trend',
        title: '玻璃态设计 (Glassmorphism)',
        description: '半透明背景配合模糊效果，创造出玻璃质感的现代UI设计',
        tags: ['透明度', '模糊效果', '现代感', '层次感']
      },
      {
        type: 'trend',
        title: '新拟态设计 (Neumorphism)',
        description: '软阴影和高光效果模拟真实物理材质，创造出柔和的3D效果',
        tags: ['软阴影', '3D效果', '材质感', '柔和']
      },
      {
        type: 'trend',
        title: '动态渐变背景',
        description: '使用CSS动画创建流动的渐变背景，增强视觉吸引力',
        tags: ['动画', '渐变', '流动感', '视觉冲击']
      },
      {
        type: 'trend',
        title: '微交互动画',
        description: '细致的交互反馈动画，提升用户体验和界面活力',
        tags: ['微交互', '用户体验', '反馈', '细节']
      }
    ];
  }
}
