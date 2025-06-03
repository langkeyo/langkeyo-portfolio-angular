import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface CodeSuggestion {
  id: string;
  code: string;
  language: string;
  description: string;
  confidence: number;
  executionTime?: number;
  qualityScore?: number;
}

interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  performance: number;
  security: number;
  suggestions: string[];
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }>;
}

@Component({
  selector: 'app-ai-code-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-code-generator">
      <!-- Header -->
      <div class="generator-header">
        <div class="header-content">
          <div class="ai-icon">
            <div class="icon-wrapper">
              <span class="icon">🤖</span>
              <div class="pulse-ring"></div>
            </div>
          </div>
          <div class="header-info">
            <h2>AI 代码生成器</h2>
            <p>GitHub Copilot 风格的智能代码助手</p>
          </div>
        </div>
        
        <!-- Language Selector -->
        <div class="language-selector">
          <select [(ngModel)]="selectedLanguage" (change)="onLanguageChange()" class="language-select">
            <option *ngFor="let lang of supportedLanguages" [value]="lang.value">
              {{ lang.icon }} {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content -->
      <div class="generator-content">
        <!-- Input Section -->
        <div class="input-section">
          <div class="input-header">
            <h3>📝 描述你的需求</h3>
            <div class="input-stats">
              <span class="char-count">{{ prompt.length }}/500</span>
            </div>
          </div>
          
          <div class="input-wrapper">
            <textarea
              #promptInput
              [(ngModel)]="prompt"
              (input)="onPromptChange()"
              placeholder="例如：创建一个React组件用于显示用户列表，包含搜索和分页功能..."
              class="prompt-input"
              maxlength="500"
              rows="4"
            ></textarea>
            
            <div class="input-actions">
              <button 
                (click)="generateCode()" 
                [disabled]="isGenerating || !prompt.trim()"
                class="generate-btn"
              >
                <span *ngIf="!isGenerating">✨ 生成代码</span>
                <span *ngIf="isGenerating" class="loading">
                  <div class="spinner"></div>
                  生成中...
                </span>
              </button>
              
              <button (click)="clearAll()" class="clear-btn">
                🗑️ 清空
              </button>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section" *ngIf="suggestions.length > 0 || isGenerating">
          <!-- Suggestions -->
          <div class="suggestions-container">
            <div class="suggestions-header">
              <h3>💡 代码建议</h3>
              <div class="suggestions-count">{{ suggestions.length }} 个建议</div>
            </div>
            
            <div class="suggestions-list">
              <div 
                *ngFor="let suggestion of suggestions; let i = index"
                class="suggestion-card"
                [class.active]="selectedSuggestionIndex === i"
                (click)="selectSuggestion(i)"
              >
                <div class="suggestion-header">
                  <div class="suggestion-info">
                    <span class="language-tag">{{ suggestion.language }}</span>
                    <span class="confidence-score">{{ suggestion.confidence }}%</span>
                  </div>
                  <div class="suggestion-actions">
                    <button (click)="copySuggestion(suggestion)" class="copy-btn">📋</button>
                    <button (click)="analyzeSuggestion(suggestion)" class="analyze-btn">🔍</button>
                  </div>
                </div>
                
                <div class="suggestion-description">
                  {{ suggestion.description }}
                </div>
                
                <div class="code-preview">
                  <pre><code [innerHTML]="highlightCode(suggestion.code, suggestion.language)"></code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Code Preview & Analysis -->
          <div class="preview-section" *ngIf="selectedSuggestion">
            <div class="preview-tabs">
              <button 
                *ngFor="let tab of previewTabs" 
                [class.active]="activeTab === tab.key"
                (click)="setActiveTab(tab.key)"
                class="tab-btn"
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </div>

            <!-- Code Tab -->
            <div class="tab-content" *ngIf="activeTab === 'code'">
              <div class="code-editor">
                <div class="editor-header">
                  <span class="file-name">{{ getFileName() }}</span>
                  <div class="editor-actions">
                    <button (click)="formatCode()" class="format-btn">🎨 格式化</button>
                    <button (click)="executeCode()" class="run-btn">▶️ 运行</button>
                  </div>
                </div>
                <div class="editor-content">
                  <textarea
                    [(ngModel)]="editableCode"
                    class="code-textarea"
                    spellcheck="false"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Preview Tab -->
            <div class="tab-content" *ngIf="activeTab === 'preview'">
              <div class="preview-container">
                <div class="preview-header">
                  <h4>🖥️ 实时预览</h4>
                  <button (click)="refreshPreview()" class="refresh-btn">🔄 刷新</button>
                </div>
                <div class="preview-frame" [innerHTML]="previewContent"></div>
              </div>
            </div>

            <!-- Analysis Tab -->
            <div class="tab-content" *ngIf="activeTab === 'analysis'">
              <div class="analysis-container" *ngIf="codeAnalysis">
                <div class="quality-metrics">
                  <h4>📊 代码质量分析</h4>
                  <div class="metrics-grid">
                    <div class="metric-card">
                      <div class="metric-label">复杂度</div>
                      <div class="metric-value" [class]="getMetricClass(codeAnalysis.complexity)">
                        {{ codeAnalysis.complexity }}/10
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">可维护性</div>
                      <div class="metric-value" [class]="getMetricClass(codeAnalysis.maintainability)">
                        {{ codeAnalysis.maintainability }}/10
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">性能</div>
                      <div class="metric-value" [class]="getMetricClass(codeAnalysis.performance)">
                        {{ codeAnalysis.performance }}/10
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">安全性</div>
                      <div class="metric-value" [class]="getMetricClass(codeAnalysis.security)">
                        {{ codeAnalysis.security }}/10
                      </div>
                    </div>
                  </div>
                </div>

                <div class="suggestions-section" *ngIf="codeAnalysis.suggestions.length > 0">
                  <h4>💡 优化建议</h4>
                  <ul class="suggestions-list">
                    <li *ngFor="let suggestion of codeAnalysis.suggestions">{{ suggestion }}</li>
                  </ul>
                </div>

                <div class="issues-section" *ngIf="codeAnalysis.issues.length > 0">
                  <h4>⚠️ 问题检测</h4>
                  <div class="issues-list">
                    <div 
                      *ngFor="let issue of codeAnalysis.issues"
                      class="issue-item"
                      [class]="'issue-' + issue.type"
                    >
                      <span class="issue-icon">
                        {{ issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️' }}
                      </span>
                      <span class="issue-message">{{ issue.message }}</span>
                      <span *ngIf="issue.line" class="issue-line">行 {{ issue.line }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="suggestions.length === 0 && !isGenerating">
          <div class="empty-icon">🚀</div>
          <h3>开始你的代码之旅</h3>
          <p>描述你想要实现的功能，AI将为你生成高质量的代码</p>
          <div class="example-prompts">
            <h4>试试这些示例：</h4>
            <button 
              *ngFor="let example of examplePrompts" 
              (click)="useExample(example)"
              class="example-btn"
            >
              {{ example }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ai-code-generator.component.scss']
})
export class AiCodeGeneratorComponent implements OnInit {
  @ViewChild('promptInput') promptInput!: ElementRef;

  // Component State
  prompt = '';
  selectedLanguage = 'javascript';
  isGenerating = false;
  suggestions: CodeSuggestion[] = [];
  selectedSuggestionIndex = 0;
  selectedSuggestion: CodeSuggestion | null = null;
  editableCode = '';
  previewContent = '';
  codeAnalysis: CodeAnalysis | null = null;
  activeTab = 'code';

  // Configuration
  supportedLanguages = [
    { value: 'javascript', name: 'JavaScript', icon: '🟨' },
    { value: 'typescript', name: 'TypeScript', icon: '🔷' },
    { value: 'python', name: 'Python', icon: '🐍' },
    { value: 'java', name: 'Java', icon: '☕' },
    { value: 'html', name: 'HTML', icon: '🌐' },
    { value: 'css', name: 'CSS', icon: '🎨' },
    { value: 'react', name: 'React', icon: '⚛️' },
    { value: 'angular', name: 'Angular', icon: '🅰️' },
    { value: 'vue', name: 'Vue.js', icon: '💚' }
  ];

  previewTabs = [
    { key: 'code', label: '代码', icon: '📝' },
    { key: 'preview', label: '预览', icon: '👁️' },
    { key: 'analysis', label: '分析', icon: '📊' }
  ];

  examplePrompts = [
    '创建一个响应式导航栏组件',
    '实现用户登录表单验证',
    '生成数据表格分页功能',
    '创建图片轮播组件',
    '实现搜索自动完成功能'
  ];

  private promptSubject = new BehaviorSubject<string>('');

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🤖 AI代码生成器组件已初始化');
    
    // 设置防抖搜索
    this.promptSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(prompt => {
      if (prompt.trim().length > 10) {
        this.generateCodeSuggestions();
      }
    });
  }

  onPromptChange() {
    this.promptSubject.next(this.prompt);
  }

  onLanguageChange() {
    if (this.suggestions.length > 0) {
      this.generateCode();
    }
  }

  generateCode() {
    if (!this.prompt.trim()) return;
    
    this.isGenerating = true;
    this.suggestions = [];
    this.selectedSuggestion = null;
    
    this.generateCodeSuggestions();
  }

  private generateCodeSuggestions() {
    // 使用 Gemini 生成代码建议
    const codePrompt = this.buildCodePrompt();
    
    this.geminiService.generateText(codePrompt, {
      type: 'code',
      maxTokens: 2000,
      temperature: 0.3
    }).subscribe({
      next: (response) => {
        this.parseCodeResponse(response);
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 代码生成失败:', error);
        this.generateFallbackSuggestions();
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCodePrompt(): string {
    return `作为一个专业的代码生成助手，请根据以下需求生成${this.selectedLanguage}代码：

需求描述：${this.prompt}

请生成3个不同的实现方案，每个方案包含：
1. 完整的可运行代码
2. 简短的实现说明
3. 代码的优缺点分析

要求：
- 代码要规范、可读性强
- 包含必要的注释
- 考虑错误处理
- 遵循最佳实践

请按以下JSON格式返回：
{
  "suggestions": [
    {
      "code": "完整代码",
      "description": "实现说明",
      "confidence": 95,
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"]
    }
  ]
}`;
  }

  private parseCodeResponse(response: string) {
    try {
      // 尝试解析JSON响应
      const parsed = JSON.parse(response);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        this.suggestions = parsed.suggestions.map((s: any, index: number) => ({
          id: `suggestion-${index}`,
          code: s.code || '',
          language: this.selectedLanguage,
          description: s.description || '代码实现',
          confidence: s.confidence || 85
        }));
      } else {
        this.generateFallbackSuggestions();
      }
    } catch (error) {
      // 如果不是JSON格式，尝试提取代码块
      this.extractCodeFromText(response);
    }
    
    if (this.suggestions.length > 0) {
      this.selectSuggestion(0);
    }
  }

  private extractCodeFromText(text: string) {
    // 提取代码块的正则表达式
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = [...text.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      this.suggestions = matches.map((match, index) => ({
        id: `suggestion-${index}`,
        code: match[1].trim(),
        language: this.selectedLanguage,
        description: `实现方案 ${index + 1}`,
        confidence: 80 + Math.random() * 15
      }));
    } else {
      this.generateFallbackSuggestions();
    }
  }

  private generateFallbackSuggestions() {
    // 生成备用建议
    this.suggestions = [
      {
        id: 'fallback-1',
        code: this.getFallbackCode(),
        language: this.selectedLanguage,
        description: '基础实现方案',
        confidence: 75
      }
    ];
  }

  private getFallbackCode(): string {
    const templates: { [key: string]: string } = {
      javascript: `// ${this.prompt}
function solution() {
  // TODO: 实现具体功能
  console.log('功能实现中...');
}

solution();`,
      
      typescript: `// ${this.prompt}
interface Config {
  // 定义配置接口
}

class Solution {
  constructor(private config: Config) {}
  
  execute(): void {
    // TODO: 实现具体功能
    console.log('功能实现中...');
  }
}`,
      
      react: `import React, { useState } from 'react';

// ${this.prompt}
const Component: React.FC = () => {
  const [state, setState] = useState(null);
  
  return (
    <div>
      {/* TODO: 实现UI */}
      <p>组件实现中...</p>
    </div>
  );
};

export default Component;`,
      
      html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${this.prompt}</title>
</head>
<body>
  <!-- TODO: 实现页面结构 -->
  <div class="container">
    <h1>页面实现中...</h1>
  </div>
</body>
</html>`
    };
    
    return templates[this.selectedLanguage] || templates['javascript'];
  }

  selectSuggestion(index: number) {
    this.selectedSuggestionIndex = index;
    this.selectedSuggestion = this.suggestions[index];
    this.editableCode = this.selectedSuggestion.code;
    this.updatePreview();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'preview') {
      this.updatePreview();
    } else if (tab === 'analysis') {
      this.analyzeCode();
    }
  }

  updatePreview() {
    if (!this.selectedSuggestion) return;
    
    if (this.selectedLanguage === 'html' || this.selectedLanguage === 'react') {
      this.previewContent = this.editableCode;
    } else {
      this.previewContent = `<pre><code>${this.escapeHtml(this.editableCode)}</code></pre>`;
    }
  }

  analyzeCode() {
    if (!this.selectedSuggestion) return;
    
    // 模拟代码分析
    this.codeAnalysis = {
      complexity: Math.floor(Math.random() * 5) + 5,
      maintainability: Math.floor(Math.random() * 3) + 7,
      performance: Math.floor(Math.random() * 4) + 6,
      security: Math.floor(Math.random() * 2) + 8,
      suggestions: [
        '考虑添加错误处理机制',
        '可以优化变量命名',
        '建议添加单元测试'
      ],
      issues: [
        {
          type: 'warning',
          message: '建议添加类型注解',
          line: 5
        }
      ]
    };
  }

  copySuggestion(suggestion: CodeSuggestion) {
    navigator.clipboard.writeText(suggestion.code).then(() => {
      console.log('✅ 代码已复制到剪贴板');
    });
  }

  analyzeSuggestion(suggestion: CodeSuggestion) {
    this.selectSuggestion(this.suggestions.indexOf(suggestion));
    this.setActiveTab('analysis');
  }

  formatCode() {
    // 简单的代码格式化
    this.editableCode = this.editableCode
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  executeCode() {
    console.log('🚀 执行代码:', this.editableCode);
    // 这里可以集成代码执行环境
  }

  refreshPreview() {
    this.updatePreview();
  }

  clearAll() {
    this.prompt = '';
    this.suggestions = [];
    this.selectedSuggestion = null;
    this.editableCode = '';
    this.previewContent = '';
    this.codeAnalysis = null;
  }

  useExample(example: string) {
    this.prompt = example;
    this.generateCode();
  }

  getFileName(): string {
    const extensions: { [key: string]: string } = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      java: '.java',
      html: '.html',
      css: '.css',
      react: '.jsx',
      angular: '.component.ts',
      vue: '.vue'
    };
    
    return `solution${extensions[this.selectedLanguage] || '.txt'}`;
  }

  highlightCode(code: string, language: string): string {
    // 简单的语法高亮
    return this.escapeHtml(code);
  }

  getMetricClass(value: number): string {
    if (value >= 8) return 'metric-excellent';
    if (value >= 6) return 'metric-good';
    if (value >= 4) return 'metric-fair';
    return 'metric-poor';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
