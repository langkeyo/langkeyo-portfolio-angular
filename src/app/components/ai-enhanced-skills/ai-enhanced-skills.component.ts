import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, SkillInsight } from '../../services/gemini.service';
import { Observable, BehaviorSubject } from 'rxjs';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'design' | 'ai';
  icon: string;
  level: number; // 1-5
  description: string;
  color: string;
}

@Component({
  selector: 'app-ai-enhanced-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="ai-skills" class="py-20 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-800 mb-6">
            🤖 AI 增强技能展示
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            点击任意技能卡片，获取 Gemini AI 提供的深度洞察和未来发展建议
          </p>
          <!-- 测试按钮 -->
          <button
            (click)="testModal()"
            class="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
          >
            🧪 测试模态框
          </button>
        </div>

        <!-- 技能分类标签 -->
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button 
            *ngFor="let category of skillCategories" 
            (click)="setActiveCategory(category.key)"
            [class]="getCategoryButtonClass(category.key)"
            class="px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            {{ category.icon }} {{ category.name }}
          </button>
        </div>

        <!-- 技能网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div
            *ngFor="let skill of getFilteredSkills()"
            class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            (click)="$event.stopPropagation()"
          >
            <!-- 技能卡片内容 -->
            <div class="p-6">
              <!-- 技能图标和等级 -->
              <div class="flex items-center justify-between mb-4">
                <div [class]="'text-4xl p-3 rounded-xl ' + skill.color">
                  {{ skill.icon }}
                </div>
                <div class="flex space-x-1">
                  <div 
                    *ngFor="let i of getStarArray(skill.level)" 
                    class="w-3 h-3 bg-yellow-400 rounded-full"
                  ></div>
                  <div 
                    *ngFor="let i of getStarArray(5 - skill.level)" 
                    class="w-3 h-3 bg-gray-200 rounded-full"
                  ></div>
                </div>
              </div>

              <!-- 技能名称和描述 -->
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ skill.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ skill.description }}</p>

              <!-- AI 洞察按钮 -->
              <button
                (click)="getSkillInsights(skill); $event.stopPropagation()"
                (mousedown)="onButtonMouseDown(skill.name)"
                [disabled]="loadingSkillId === skill.id"
                [class]="getInsightButtonClass(skill.id)"
                class="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer hover:cursor-pointer relative z-10"
                [style.cursor]="loadingSkillId === skill.id ? 'not-allowed' : 'pointer'"
                type="button"
              >
                <div *ngIf="loadingSkillId === skill.id" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span *ngIf="loadingSkillId !== skill.id">✨</span>
                <span>{{ loadingSkillId === skill.id ? '分析中...' : 'AI 深度洞察' }}</span>
              </button>
            </div>

            <!-- 悬停效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <!-- AI 洞察模态框 -->
      <div 
        *ngIf="showInsightModal && currentInsight" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="closeModal($event)"
      >
        <div 
          class="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
          (click)="$event.stopPropagation()"
        >
          <!-- 关闭按钮 -->
          <button
            (click)="closeModal()"
            class="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors duration-200"
          >
            &times;
          </button>

          <!-- 模态框标题 -->
          <div class="flex items-center mb-8">
            <div class="text-4xl mr-4">🤖</div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ currentInsight.skillName }}</h3>
              <p class="text-lg text-purple-600 font-semibold">Gemini AI 深度分析</p>
            </div>
          </div>

          <!-- 洞察内容 -->
          <div class="space-y-8">
            <!-- 技能解释 -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-purple-700 mb-4 flex items-center">
                <span class="mr-2">📚</span> 技能解释
              </h4>
              <p class="text-gray-700 leading-relaxed">{{ currentInsight.explanation }}</p>
            </div>

            <!-- 未来重要性 -->
            <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-teal-700 mb-4 flex items-center">
                <span class="mr-2">🚀</span> 未来重要性
              </h4>
              <p class="text-gray-700 leading-relaxed">{{ currentInsight.futureImportance }}</p>
            </div>

            <!-- Gemini Vision Pro 能力 -->
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-orange-700 mb-4 flex items-center">
                <span class="mr-2">✨</span> Gemini Vision Pro 能力模拟
              </h4>
              <ul class="space-y-3">
                <li 
                  *ngFor="let capability of currentInsight.geminiVisionProCapabilities" 
                  class="flex items-start space-x-3"
                >
                  <span class="text-orange-500 mt-1">🔮</span>
                  <span class="text-gray-700">{{ capability }}</span>
                </li>
              </ul>
            </div>

            <!-- 相关概念 -->
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-rose-700 mb-4 flex items-center">
                <span class="mr-2">🔗</span> 相关概念
              </h4>
              <div class="flex flex-wrap gap-3">
                <span 
                  *ngFor="let concept of currentInsight.relatedConcepts" 
                  class="bg-rose-100 text-rose-700 text-sm font-medium px-4 py-2 rounded-full border border-rose-200 hover:bg-rose-200 transition-colors duration-200"
                >
                  {{ concept }}
                </span>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="flex justify-center mt-8 space-x-4">
            <button
              (click)="shareInsight()"
              class="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>📤</span>
              <span>分享洞察</span>
            </button>
            <button
              (click)="saveInsight()"
              class="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>💾</span>
              <span>保存洞察</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .group:hover .animate-float {
      animation: float 2s ease-in-out infinite;
    }
  `]
})
export class AiEnhancedSkillsComponent implements OnInit {
  // 技能数据
  skills: Skill[] = [
    {
      id: 'angular',
      name: 'Angular',
      category: 'technical',
      icon: '🅰️',
      level: 5,
      description: '现代化前端框架，构建高性能单页应用',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'technical',
      icon: '📘',
      level: 5,
      description: '强类型JavaScript超集，提升代码质量',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      category: 'design',
      icon: '🎨',
      level: 4,
      description: '实用优先的CSS框架，快速构建现代UI',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'technical',
      icon: '🟢',
      level: 4,
      description: '服务端JavaScript运行时环境',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'ai-integration',
      name: 'AI 集成',
      category: 'ai',
      icon: '🤖',
      level: 4,
      description: '人工智能API集成和智能功能开发',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'problem-solving',
      name: '问题解决',
      category: 'soft',
      icon: '🧩',
      level: 5,
      description: '分析复杂问题并提供创新解决方案',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'team-collaboration',
      name: '团队协作',
      category: 'soft',
      icon: '🤝',
      level: 4,
      description: '高效团队合作和跨部门沟通',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'ui-ux-design',
      name: 'UI/UX 设计',
      category: 'design',
      icon: '🎯',
      level: 4,
      description: '用户界面和用户体验设计',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  // 技能分类
  skillCategories = [
    { key: 'all', name: '全部技能', icon: '🌟' },
    { key: 'technical', name: '技术技能', icon: '💻' },
    { key: 'design', name: '设计技能', icon: '🎨' },
    { key: 'soft', name: '软技能', icon: '🧠' },
    { key: 'ai', name: 'AI 技能', icon: '🤖' }
  ];

  // 组件状态
  activeCategory = 'all';
  loadingSkillId: string | null = null;
  showInsightModal = false;
  currentInsight: SkillInsight | null = null;

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🎯 AI增强技能组件已初始化');
  }

  // 设置活动分类
  setActiveCategory(category: string) {
    this.activeCategory = category;
  }

  // 获取过滤后的技能
  getFilteredSkills(): Skill[] {
    if (this.activeCategory === 'all') {
      return this.skills;
    }
    return this.skills.filter(skill => skill.category === this.activeCategory);
  }

  // 获取分类按钮样式
  getCategoryButtonClass(category: string): string {
    const baseClass = 'px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105';
    if (this.activeCategory === category) {
      return `${baseClass} bg-purple-600 text-white shadow-lg`;
    }
    return `${baseClass} bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 shadow-md`;
  }

  // 获取洞察按钮样式
  getInsightButtonClass(skillId: string): string {
    const baseClass = 'w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2';
    if (this.loadingSkillId === skillId) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
    }
    return `${baseClass} bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg transform hover:scale-105`;
  }

  // 获取星级数组
  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  // 调试方法 - 按钮鼠标按下事件
  onButtonMouseDown(skillName: string) {
    console.log('🖱️ 按钮被点击:', skillName);
  }

  // 获取技能洞察
  getSkillInsights(skill: Skill) {
    console.log('🎯 点击技能洞察按钮:', skill.name);
    console.log('🎯 当前组件状态:', {
      loadingSkillId: this.loadingSkillId,
      showInsightModal: this.showInsightModal,
      currentInsight: this.currentInsight
    });

    this.loadingSkillId = skill.id;

    console.log('🎯 调用 GeminiService...');
    this.geminiService.getSkillInsights(skill.name, true).subscribe({
      next: (insight) => {
        console.log('✨ 组件收到技能洞察:', insight);
        // 使用 setTimeout 和 ChangeDetectorRef 避免变更检测错误
        setTimeout(() => {
          this.currentInsight = insight;
          this.showInsightModal = true;
          this.loadingSkillId = null;
          this.cdr.detectChanges();
          console.log('🎯 更新后状态:', {
            showInsightModal: this.showInsightModal,
            currentInsight: this.currentInsight,
            loadingSkillId: this.loadingSkillId
          });
        }, 0);
      },
      error: (error) => {
        console.error('❌ 组件获取技能洞察失败:', error);
        setTimeout(() => {
          this.loadingSkillId = null;
        }, 0);
        // 可以显示错误提示
      }
    });
  }

  // 测试方法 - 用于调试
  testModal() {
    console.log('🧪 测试模态框');
    setTimeout(() => {
      this.currentInsight = {
        skillName: '测试技能',
        explanation: '这是一个测试解释',
        futureImportance: '这是测试的未来重要性',
        geminiVisionProCapabilities: ['测试能力1', '测试能力2'],
        relatedConcepts: ['测试概念1', '测试概念2']
      };
      this.showInsightModal = true;
      console.log('🧪 测试模态框状态:', this.showInsightModal);
    }, 0);
  }

  // 关闭模态框
  closeModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.showInsightModal = false;
    this.currentInsight = null;
  }

  // 分享洞察
  shareInsight() {
    if (this.currentInsight) {
      const shareText = `🤖 AI洞察: ${this.currentInsight.skillName}\n\n${this.currentInsight.explanation}`;
      if (navigator.share) {
        navigator.share({
          title: `${this.currentInsight.skillName} - AI洞察`,
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('洞察内容已复制到剪贴板！');
      }
    }
  }

  // 保存洞察
  saveInsight() {
    if (this.currentInsight) {
      const insightData = JSON.stringify(this.currentInsight, null, 2);
      const blob = new Blob([insightData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentInsight.skillName}-insight.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
