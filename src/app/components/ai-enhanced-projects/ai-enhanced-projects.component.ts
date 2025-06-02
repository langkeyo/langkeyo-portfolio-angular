import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, ProjectInsight } from '../../services/gemini.service';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubLink: string;
  liveDemo?: string;
  image: string;
  category: 'web' | 'mobile' | 'ai' | 'fullstack';
  status: 'completed' | 'in-progress' | 'planned';
  featured: boolean;
}

@Component({
  selector: 'app-ai-enhanced-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <!-- 标题部分 -->
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-gray-800 mb-6">
            🚀 AI 增强项目展示
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            每个项目都经过 Gemini AI 分析，获取未来化改进建议和技术洞察
          </p>
        </div>

        <!-- 项目过滤器 -->
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button
            *ngFor="let filter of projectFilters"
            (click)="setActiveFilter(filter.key)"
            [class]="getFilterButtonClass(filter.key)"
            class="px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer select-none active:scale-95"
          >
            {{ filter.icon }} {{ filter.name }}
          </button>
        </div>

        <!-- 项目网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <div
            *ngFor="let project of getFilteredProjects()"
            class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100 hover:border-purple-200 h-full flex flex-col"
          >
            <!-- 项目图片 -->
            <div class="relative overflow-hidden h-48 cursor-pointer">
              <img
                [src]="project.image"
                [alt]="project.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                (error)="onImageError($event)"
              >
              <!-- 状态标签 -->
              <div [class]="getStatusBadgeClass(project.status)" class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 cursor-default">
                {{ getStatusText(project.status) }}
              </div>
              <!-- 特色标签 -->
              <div *ngIf="project.featured" class="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 hover:bg-yellow-300 cursor-default animate-pulse">
                ⭐ 特色
              </div>
            </div>

            <!-- 项目内容 -->
            <div class="p-6 flex-1 flex flex-col">
              <h3 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300 cursor-pointer hover:underline">
                {{ project.title }}
              </h3>
              <p class="text-gray-600 mb-4 line-clamp-3 flex-1 group-hover:text-gray-700 transition-colors duration-300">{{ project.description }}</p>

              <!-- 技术标签 -->
              <div class="flex flex-wrap gap-2 mb-6">
                <span
                  *ngFor="let tech of project.technologies.slice(0, 3)"
                  class="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 hover:bg-purple-200 hover:scale-105 cursor-default"
                >
                  {{ tech }}
                </span>
                <span
                  *ngIf="project.technologies.length > 3"
                  class="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-105 cursor-help"
                  [title]="'还有 ' + (project.technologies.length - 3) + ' 个技术: ' + project.technologies.slice(3).join(', ')"
                >
                  +{{ project.technologies.length - 3 }}
                </span>
              </div>

              <!-- 操作按钮 -->
              <div class="flex flex-wrap gap-2 mt-auto">
                <a
                  [href]="project.githubLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-github flex items-center space-x-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer relative z-10"
                >
                  <span class="btn-icon">📂</span>
                  <span>GitHub</span>
                </a>
                <a
                  *ngIf="project.liveDemo"
                  [href]="project.liveDemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-demo flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer relative z-10"
                >
                  <span class="btn-icon">🌐</span>
                  <span>演示</span>
                </a>
                <button
                  (click)="getProjectInsights(project)"
                  [disabled]="loadingProjectId === project.id"
                  [class]="getInsightButtonClass(project.id)"
                  class="btn-ai flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 relative z-10"
                >
                  <div *ngIf="loadingProjectId === project.id" class="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                  <span *ngIf="loadingProjectId !== project.id" class="btn-icon">✨</span>
                  <span>{{ loadingProjectId === project.id ? '分析中...' : 'AI 洞察' }}</span>
                </button>
              </div>
            </div>

            <!-- 悬停效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      <!-- AI 项目洞察模态框 -->
      <div
        *ngIf="showInsightModal && currentProjectInsight"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn cursor-pointer"
        (click)="closeModal($event)"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 animate-slideInUp cursor-default"
          (click)="$event.stopPropagation()"
        >
          <!-- 关闭按钮 -->
          <button
            (click)="closeModal()"
            class="absolute top-6 right-6 text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-3xl font-bold transition-all duration-200 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
          >
            &times;
          </button>

          <!-- 模态框标题 -->
          <div class="flex items-center mb-8">
            <div class="text-4xl mr-4">🚀</div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ currentProject?.title }}</h3>
              <p class="text-lg text-purple-600 font-semibold">Gemini AI 项目分析</p>
            </div>
          </div>

          <!-- 洞察内容网格 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 优化描述 -->
            <div class="lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-purple-700 mb-4 flex items-center">
                <span class="mr-2">📝</span> 优化项目描述
              </h4>
              <p class="text-gray-700 leading-relaxed">{{ currentProjectInsight.enhancedDescription }}</p>
            </div>

            <!-- 未来改进建议 -->
            <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-teal-700 mb-4 flex items-center">
                <span class="mr-2">🔮</span> 未来改进建议
              </h4>
              <ul class="space-y-3">
                <li 
                  *ngFor="let improvement of currentProjectInsight.futureImprovements" 
                  class="flex items-start space-x-3"
                >
                  <span class="text-teal-500 mt-1">💡</span>
                  <span class="text-gray-700">{{ improvement }}</span>
                </li>
              </ul>
            </div>

            <!-- Gemini Vision Pro 能力 -->
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-orange-700 mb-4 flex items-center">
                <span class="mr-2">🤖</span> Gemini Vision Pro 能力
              </h4>
              <ul class="space-y-3">
                <li 
                  *ngFor="let capability of currentProjectInsight.geminiVisionProCapabilities" 
                  class="flex items-start space-x-3"
                >
                  <span class="text-orange-500 mt-1">⚡</span>
                  <span class="text-gray-700">{{ capability }}</span>
                </li>
              </ul>
            </div>

            <!-- 技术栈分析 -->
            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                <span class="mr-2">🔧</span> 技术栈分析
              </h4>
              <ul class="space-y-3">
                <li 
                  *ngFor="let analysis of currentProjectInsight.techStackAnalysis" 
                  class="flex items-start space-x-3"
                >
                  <span class="text-indigo-500 mt-1">🛠️</span>
                  <span class="text-gray-700">{{ analysis }}</span>
                </li>
              </ul>
            </div>

            <!-- 未来关键词 -->
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6">
              <h4 class="text-xl font-bold text-rose-700 mb-4 flex items-center">
                <span class="mr-2">🏷️</span> 未来关键词
              </h4>
              <div class="flex flex-wrap gap-3">
                <span 
                  *ngFor="let keyword of currentProjectInsight.futureKeywords" 
                  class="bg-rose-100 text-rose-700 text-sm font-medium px-4 py-2 rounded-full border border-rose-200 hover:bg-rose-200 transition-colors duration-200"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="flex justify-center mt-8 space-x-4">
            <button
              (click)="exportInsight()"
              class="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 cursor-pointer hover:shadow-lg"
            >
              <span>📊</span>
              <span>导出分析</span>
            </button>
            <button
              (click)="shareProjectInsight()"
              class="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 cursor-pointer hover:shadow-lg"
            >
              <span>📤</span>
              <span>分享洞察</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* 自定义动画 */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slideInUp {
      animation: slideInUp 0.3s ease-out;
    }

    /* 悬浮效果增强 */
    .group:hover .group-hover\\:brightness-110 {
      filter: brightness(1.1);
    }

    /* 禁用状态的按钮样式 */
    button:disabled {
      cursor: not-allowed !important;
      opacity: 0.6;
    }

    button:disabled:hover {
      transform: none !important;
      scale: 1 !important;
    }

    /* 强烈的按钮交互效果 */
    .btn-github:hover {
      background-color: #374151 !important;
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
    }

    .btn-github:hover .btn-icon {
      animation: bounce 0.6s ease-in-out infinite;
    }

    .btn-demo:hover {
      background-color: #1d4ed8 !important;
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4) !important;
    }

    .btn-demo:hover .btn-icon {
      animation: spin 1s linear infinite;
    }

    .btn-ai:hover {
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4) !important;
    }

    .btn-ai:hover .btn-icon {
      animation: pulse 1s ease-in-out infinite;
    }

    /* 按钮点击效果 */
    .btn-github:active,
    .btn-demo:active,
    .btn-ai:active {
      transform: translateY(-1px) scale(0.98) !important;
    }

    /* 图标动画 */
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-3px);
      }
      60% {
        transform: translateY(-1px);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }
  `]
})
export class AiEnhancedProjectsComponent implements OnInit {
  // 项目数据
  projects: Project[] = [
    {
      id: 'current-portfolio',
      title: 'Langkeyo Design 作品集',
      description: '当前正在开发的 Angular 20 现代化作品集网站，集成 AI 增强功能、音乐播放器、天气组件等多种创新功能',
      technologies: ['Angular 20', 'TypeScript', 'Tailwind CSS', 'Gemini AI', 'QQ Music API'],
      githubLink: 'https://github.com/langkeyo/PersonalDesign',
      liveDemo: 'https://langkeyo.top',
      image: 'https://placehold.co/400x250/A0C4FF/333333?text=Langkeyo+Design',
      category: 'web',
      status: 'in-progress',
      featured: true
    },
    {
      id: 'music-player-component',
      title: '高级音乐播放器组件',
      description: '集成在作品集中的 QQ 音乐播放器组件，支持搜索、播放列表、VIP 音乐处理和现代化 UI 设计',
      technologies: ['Angular', 'QQ Music API', 'Web Audio API', 'RxJS', 'Tailwind CSS'],
      githubLink: 'https://github.com/langkeyo/PersonalDesign',
      image: 'https://placehold.co/400x250/FFC7A0/333333?text=Music+Player',
      category: 'web',
      status: 'completed',
      featured: true
    },
    {
      id: 'ai-enhanced-features',
      title: 'AI 增强功能套件',
      description: '基于 Gemini AI 的智能功能集合，包括技能分析、项目洞察、智能建议等 AI 驱动的交互体验',
      technologies: ['Gemini AI', 'Angular', 'TypeScript', 'RxJS', 'AI API Integration'],
      githubLink: 'https://github.com/langkeyo/PersonalDesign',
      image: 'https://placehold.co/400x250/C0F4C0/333333?text=AI+Features',
      category: 'ai',
      status: 'completed',
      featured: true
    },
    {
      id: 'weather-widget',
      title: '智能天气组件',
      description: '现代化天气显示组件，支持地理位置检测、多日预报、动态背景和交互式天气信息展示',
      technologies: ['Angular', 'Open-Meteo API', 'Geolocation API', 'CSS Animations'],
      githubLink: 'https://github.com/langkeyo/PersonalDesign',
      image: 'https://placehold.co/400x250/87CEEB/333333?text=Weather+Widget',
      category: 'web',
      status: 'completed',
      featured: false
    },
    {
      id: 'github-stats',
      title: 'GitHub 统计展示',
      description: '动态获取和展示 GitHub 用户统计信息，包括仓库数据、贡献图表和项目展示',
      technologies: ['GitHub API', 'Angular', 'Chart.js', 'Data Visualization'],
      githubLink: 'https://github.com/langkeyo/PersonalDesign',
      image: 'https://placehold.co/400x250/24292e/ffffff?text=GitHub+Stats',
      category: 'web',
      status: 'completed',
      featured: false
    }
  ];

  // 项目过滤器
  projectFilters = [
    { key: 'all', name: '全部项目', icon: '🌟' },
    { key: 'web', name: 'Web 应用', icon: '🌐' },
    { key: 'mobile', name: '移动应用', icon: '📱' },
    { key: 'ai', name: 'AI 项目', icon: '🤖' },
    { key: 'fullstack', name: '全栈项目', icon: '⚡' }
  ];

  // 组件状态
  activeFilter = 'all';
  loadingProjectId: string | null = null;
  showInsightModal = false;
  currentProjectInsight: ProjectInsight | null = null;
  currentProject: Project | null = null;

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🚀 AI增强项目组件已初始化');
  }

  // 设置活动过滤器
  setActiveFilter(filter: string) {
    this.activeFilter = filter;
  }

  // 获取过滤后的项目
  getFilteredProjects(): Project[] {
    if (this.activeFilter === 'all') {
      return this.projects;
    }
    return this.projects.filter(project => project.category === this.activeFilter);
  }

  // 获取过滤器按钮样式
  getFilterButtonClass(filter: string): string {
    const baseClass = 'px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer select-none active:scale-95';
    if (this.activeFilter === filter) {
      return `${baseClass} bg-purple-600 text-white shadow-lg hover:bg-purple-700`;
    }
    return `${baseClass} bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 shadow-md border border-gray-200 hover:border-purple-200`;
  }

  // 获取状态徽章样式
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-yellow-500 text-white';
      case 'planned':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  // 获取状态文本
  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      case 'planned':
        return '计划中';
      default:
        return '未知';
    }
  }

  // 获取洞察按钮样式
  getInsightButtonClass(projectId: string): string {
    const baseClass = 'flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300';
    if (this.loadingProjectId === projectId) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed opacity-60`;
    }
    return `${baseClass} bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer`;
  }

  // 获取项目洞察
  getProjectInsights(project: Project) {
    this.loadingProjectId = project.id;
    this.currentProject = project;

    this.geminiService.getProjectInsights(project.title, project.description, project.technologies).subscribe({
      next: (insight) => {
        // 使用 setTimeout 避免变更检测错误
        setTimeout(() => {
          this.currentProjectInsight = insight;
          this.showInsightModal = true;
          this.loadingProjectId = null;
          this.cdr.detectChanges();
          console.log('✨ 获取到项目洞察:', insight);
        }, 0);
      },
      error: (error) => {
        console.error('❌ 获取项目洞察失败:', error);
        setTimeout(() => {
          this.loadingProjectId = null;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // 关闭模态框
  closeModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.showInsightModal = false;
    this.currentProjectInsight = null;
    this.currentProject = null;
  }

  // 图片加载错误处理
  onImageError(event: any) {
    event.target.src = 'https://placehold.co/400x250/CCCCCC/333333?text=Project+Image';
  }

  // 导出洞察
  exportInsight() {
    if (this.currentProjectInsight && this.currentProject) {
      const exportData = {
        project: this.currentProject,
        insight: this.currentProjectInsight,
        exportDate: new Date().toISOString()
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentProject.title}-ai-analysis.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // 分享项目洞察
  shareProjectInsight() {
    if (this.currentProjectInsight && this.currentProject) {
      const shareText = `🚀 AI项目分析: ${this.currentProject.title}\n\n${this.currentProjectInsight.enhancedDescription}`;
      if (navigator.share) {
        navigator.share({
          title: `${this.currentProject.title} - AI项目分析`,
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('项目洞察已复制到剪贴板！');
      }
    }
  }


}
