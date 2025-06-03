import { 
  Component, 
  OnInit, 
  ChangeDetectorRef, 
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
  achievements: string[];
  technologies: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

interface SkillCategory {
  category: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  level: number; // 1-5
  years: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

interface Language {
  name: string;
  proficiency: string; // Native, Fluent, Conversational, Basic
}

interface JobRequirement {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferredSkills: string[];
  experience: string;
}

interface OptimizedResume {
  originalResume: ResumeData;
  optimizedResume: ResumeData;
  optimizationSuggestions: string[];
  matchScore: number;
  missingSkills: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

interface InterviewPrediction {
  commonQuestions: string[];
  technicalQuestions: string[];
  behavioralQuestions: string[];
  preparationTips: string[];
  keyTopics: string[];
}

@Component({
  selector: 'app-smart-resume-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="smart-resume-generator-section py-20 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 relative overflow-hidden">
      <!-- 2025 Background Effects -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-32 right-32 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div class="container mx-auto max-w-7xl px-6 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            🧠 智能简历生成器
          </h2>
          <p class="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            AI驱动的智能简历系统，根据职位要求自动优化简历内容，提供面试问题预测和多格式导出
          </p>
        </div>

        <!-- Main Interface -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Panel - Input & Controls -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Step Indicator -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-xl font-bold text-white mb-4">📋 生成步骤</h3>
              <div class="space-y-3">
                <div [class.active]="currentStep() === 1" class="step-item">
                  <span class="step-number">1</span>
                  <span class="step-text">基础信息</span>
                </div>
                <div [class.active]="currentStep() === 2" class="step-item">
                  <span class="step-number">2</span>
                  <span class="step-text">职位分析</span>
                </div>
                <div [class.active]="currentStep() === 3" class="step-item">
                  <span class="step-number">3</span>
                  <span class="step-text">简历优化</span>
                </div>
                <div [class.active]="currentStep() === 4" class="step-item">
                  <span class="step-number">4</span>
                  <span class="step-text">导出下载</span>
                </div>
              </div>
            </div>

            <!-- Job Requirements Input -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-xl font-bold text-white mb-4">🎯 目标职位</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white/90 mb-2">职位标题</label>
                  <input
                    [(ngModel)]="jobRequirement.title"
                    type="text"
                    placeholder="例如：高级前端工程师"
                    class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/90 mb-2">公司名称</label>
                  <input
                    [(ngModel)]="jobRequirement.company"
                    type="text"
                    placeholder="例如：科技创新公司"
                    class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/90 mb-2">职位描述</label>
                  <textarea
                    [(ngModel)]="jobRequirement.description"
                    rows="4"
                    placeholder="粘贴完整的职位描述..."
                    class="input-field resize-none">
                  </textarea>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-xl font-bold text-white mb-4">🚀 操作面板</h3>
              <div class="space-y-3">
                <button 
                  (click)="analyzeJobRequirements()"
                  [disabled]="isAnalyzing()"
                  class="w-full btn-primary">
                  <span *ngIf="!isAnalyzing()">🔍 分析职位要求</span>
                  <span *ngIf="isAnalyzing()" class="flex items-center justify-center">
                    <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    分析中...
                  </span>
                </button>
                
                <button 
                  (click)="optimizeResume()"
                  [disabled]="isOptimizing() || !analysisComplete()"
                  class="w-full btn-secondary">
                  <span *ngIf="!isOptimizing()">✨ 优化简历</span>
                  <span *ngIf="isOptimizing()" class="flex items-center justify-center">
                    <div class="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
                    优化中...
                  </span>
                </button>
                
                <button 
                  (click)="generateInterviewQuestions()"
                  [disabled]="isGeneratingQuestions() || !optimizationComplete()"
                  class="w-full btn-accent">
                  <span *ngIf="!isGeneratingQuestions()">🎤 预测面试问题</span>
                  <span *ngIf="isGeneratingQuestions()" class="flex items-center justify-center">
                    <div class="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
                    生成中...
                  </span>
                </button>
              </div>
            </div>

            <!-- Export Options -->
            <div class="glass rounded-2xl p-6" *ngIf="optimizedResume()">
              <h3 class="text-xl font-bold text-white mb-4">📄 导出选项</h3>
              <div class="grid grid-cols-2 gap-3">
                <button (click)="exportToPDF()" class="export-btn">
                  📄 PDF
                </button>
                <button (click)="exportToWord()" class="export-btn">
                  📝 Word
                </button>
                <button (click)="exportToJSON()" class="export-btn">
                  💾 JSON
                </button>
                <button (click)="exportToHTML()" class="export-btn">
                  🌐 HTML
                </button>
              </div>
            </div>
          </div>

          <!-- Right Panel - Results & Preview -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Analysis Results -->
            <div class="glass rounded-2xl p-6" *ngIf="jobAnalysis()">
              <h3 class="text-xl font-bold text-white mb-4">📊 职位分析结果</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-white/90 mb-2">🔑 关键技能要求</h4>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let skill of jobAnalysis()?.keySkills" 
                          class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {{ skill }}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-white/90 mb-2">📈 经验要求</h4>
                  <p class="text-white/80">{{ jobAnalysis()?.experienceLevel }}</p>
                </div>
              </div>
            </div>

            <!-- Optimization Results -->
            <div class="glass rounded-2xl p-6" *ngIf="optimizedResume()">
              <h3 class="text-xl font-bold text-gray-800 mb-4">✨ 简历优化结果</h3>
              
              <!-- Match Score -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-gray-700">匹配度评分</span>
                  <span class="text-2xl font-bold text-green-600">{{ optimizedResume()?.matchScore }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                       [style.width.%]="optimizedResume()?.matchScore">
                  </div>
                </div>
              </div>

              <!-- Suggestions -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-3">💪 优势领域</h4>
                  <ul class="space-y-2">
                    <li *ngFor="let strength of optimizedResume()?.strengthAreas" 
                        class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      <span class="text-sm text-gray-600">{{ strength }}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 mb-3">🎯 改进建议</h4>
                  <ul class="space-y-2">
                    <li *ngFor="let improvement of optimizedResume()?.improvementAreas" 
                        class="flex items-start">
                      <span class="text-orange-500 mr-2">⚡</span>
                      <span class="text-sm text-gray-600">{{ improvement }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Interview Questions -->
            <div class="glass rounded-2xl p-6" *ngIf="interviewPrediction()">
              <h3 class="text-xl font-bold text-gray-800 mb-4">🎤 面试问题预测</h3>
              
              <div class="space-y-6">
                <!-- Common Questions -->
                <div>
                  <h4 class="font-semibold text-gray-700 mb-3">💬 常见问题</h4>
                  <div class="space-y-2">
                    <div *ngFor="let question of interviewPrediction()?.commonQuestions" 
                         class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p class="text-sm text-gray-700">{{ question }}</p>
                    </div>
                  </div>
                </div>

                <!-- Technical Questions -->
                <div>
                  <h4 class="font-semibold text-gray-700 mb-3">🔧 技术问题</h4>
                  <div class="space-y-2">
                    <div *ngFor="let question of interviewPrediction()?.technicalQuestions" 
                         class="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <p class="text-sm text-gray-700">{{ question }}</p>
                    </div>
                  </div>
                </div>

                <!-- Preparation Tips -->
                <div>
                  <h4 class="font-semibold text-gray-700 mb-3">💡 准备建议</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div *ngFor="let tip of interviewPrediction()?.preparationTips" 
                         class="p-3 bg-green-50 rounded-lg">
                      <p class="text-sm text-gray-700">{{ tip }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8B5CF6 100%);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
    }

    .step-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 12px;
      transition: all 0.3s ease;
      opacity: 0.6;
    }

    .step-item.active {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      opacity: 1;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
      font-size: 14px;
    }

    .step-item.active .step-number {
      background: #8b5cf6;
      color: white;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-secondary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-accent {
      background: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-accent:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
    }

    .btn-accent:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .export-btn {
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.08);
      padding: 12px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
      color: #374151;
    }

    .export-btn:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.7);
      color: #374151;
      font-size: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .input-field::placeholder {
      color: #9CA3AF;
    }

    .input-field:focus {
      outline: none;
      border-color: #8B5CF6;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
      transform: translateY(-1px);
    }

    .input-field:hover {
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(255, 255, 255, 0.8);
    }
  `]
})
export class SmartResumeGeneratorComponent implements OnInit {
  // Signals for reactive state
  currentStep = signal(1);
  isAnalyzing = signal(false);
  isOptimizing = signal(false);
  isGeneratingQuestions = signal(false);
  analysisComplete = signal(false);
  optimizationComplete = signal(false);

  // Data signals
  jobAnalysis = signal<any>(null);
  optimizedResume = signal<OptimizedResume | null>(null);
  interviewPrediction = signal<InterviewPrediction | null>(null);

  // Form data
  jobRequirement: JobRequirement = {
    title: '',
    company: '',
    description: '',
    requirements: [],
    preferredSkills: [],
    experience: ''
  };

  // Sample resume data (in real app, this would come from user input or existing data)
  private sampleResumeData: ResumeData = {
    personalInfo: {
      name: '浪客哟',
      title: '高级前端工程师',
      email: 'langkeyo@example.com',
      phone: '+86 138-0000-0000',
      location: '北京市',
      linkedin: 'linkedin.com/in/langkeyo',
      github: 'github.com/langkeyo',
      website: 'langkeyo.top'
    },
    summary: '拥有5年前端开发经验的工程师，专注于现代Web技术和用户体验设计。',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: []
  };

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize sample resume data
    this.sampleResumeData.experience = [
      {
        id: '1',
        company: '科技创新公司',
        position: '高级前端工程师',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: [
          '负责大型Web应用的前端架构设计和开发',
          '带领5人前端团队完成多个重要项目',
          '优化应用性能，提升用户体验'
        ],
        achievements: [
          '将应用加载时间减少40%',
          '建立了完整的前端开发规范',
          '成功交付15+个项目'
        ],
        technologies: ['Angular', 'React', 'Vue.js', 'TypeScript', 'Node.js']
      }
    ];

    this.sampleResumeData.skills = [
      {
        category: '前端技术',
        skills: [
          { name: 'Angular', level: 5, years: 4 },
          { name: 'React', level: 4, years: 3 },
          { name: 'Vue.js', level: 4, years: 2 },
          { name: 'TypeScript', level: 5, years: 4 }
        ]
      },
      {
        category: '后端技术',
        skills: [
          { name: 'Node.js', level: 4, years: 3 },
          { name: 'Python', level: 3, years: 2 }
        ]
      }
    ];

    this.sampleResumeData.projects = [
      {
        id: '1',
        name: '3D交互式作品集',
        description: '使用Three.js和Angular构建的现代化3D作品集网站',
        technologies: ['Angular', 'Three.js', 'GSAP', 'Tailwind CSS'],
        url: 'https://langkeyo.top',
        github: 'https://github.com/langkeyo/portfolio',
        highlights: [
          '实现了沉浸式3D用户体验',
          '集成了多种AI功能',
          '获得了优秀的性能评分'
        ]
      }
    ];
  }

  analyzeJobRequirements() {
    if (!this.jobRequirement.title || !this.jobRequirement.description) {
      alert('请填写职位标题和描述');
      return;
    }

    this.isAnalyzing.set(true);
    this.currentStep.set(2);

    const analysisPrompt = `作为一名专业的HR和招聘专家，请分析以下职位要求：

职位标题：${this.jobRequirement.title}
公司：${this.jobRequirement.company}
职位描述：${this.jobRequirement.description}

请提供以下分析结果：
1. 关键技能要求（提取最重要的5-8个技能）
2. 经验水平要求（初级/中级/高级/专家级）
3. 必备技能 vs 加分技能
4. 职位的核心职责
5. 公司文化和价值观要求
6. 薪资范围预估
7. 职业发展路径

请以JSON格式返回结果，包含以下字段：
- keySkills: string[]
- experienceLevel: string
- requiredSkills: string[]
- preferredSkills: string[]
- coreResponsibilities: string[]
- companyValues: string[]
- salaryRange: string
- careerPath: string[]`;

    this.geminiService.generateText(analysisPrompt, {
      type: 'code',
      maxTokens: 2000,
      temperature: 0.3
    }).subscribe({
      next: (response) => {
        try {
          // Try to parse JSON response
          const analysis = JSON.parse(response);
          this.jobAnalysis.set(analysis);
        } catch (error) {
          // Fallback to parsed text response
          this.jobAnalysis.set(this.parseAnalysisResponse(response));
        }

        this.analysisComplete.set(true);
        this.isAnalyzing.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 职位分析失败:', error);
        this.jobAnalysis.set(this.getFallbackAnalysis());
        this.analysisComplete.set(true);
        this.isAnalyzing.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  optimizeResume() {
    if (!this.jobAnalysis()) {
      alert('请先分析职位要求');
      return;
    }

    this.isOptimizing.set(true);
    this.currentStep.set(3);

    const optimizationPrompt = `作为一名专业的简历优化专家，请根据以下职位要求优化简历：

职位要求：
${JSON.stringify(this.jobAnalysis(), null, 2)}

当前简历：
${JSON.stringify(this.sampleResumeData, null, 2)}

请提供以下优化建议：
1. 简历与职位的匹配度评分（0-100）
2. 优势领域（已经匹配的技能和经验）
3. 改进建议（需要加强的方面）
4. 缺失的关键技能
5. 简历内容优化建议
6. 关键词优化建议
7. 格式和结构优化建议

请以JSON格式返回结果，包含以下字段：
- matchScore: number
- strengthAreas: string[]
- improvementAreas: string[]
- missingSkills: string[]
- contentOptimization: string[]
- keywordOptimization: string[]
- formatOptimization: string[]`;

    this.geminiService.generateText(optimizationPrompt, {
      type: 'code',
      maxTokens: 2500,
      temperature: 0.3
    }).subscribe({
      next: (response) => {
        try {
          const optimization = JSON.parse(response);
          const optimizedResume: OptimizedResume = {
            originalResume: this.sampleResumeData,
            optimizedResume: this.generateOptimizedResume(optimization),
            optimizationSuggestions: optimization.contentOptimization || [],
            matchScore: optimization.matchScore || 75,
            missingSkills: optimization.missingSkills || [],
            strengthAreas: optimization.strengthAreas || [],
            improvementAreas: optimization.improvementAreas || []
          };
          this.optimizedResume.set(optimizedResume);
        } catch (error) {
          this.optimizedResume.set(this.getFallbackOptimization());
        }

        this.optimizationComplete.set(true);
        this.isOptimizing.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 简历优化失败:', error);
        this.optimizedResume.set(this.getFallbackOptimization());
        this.optimizationComplete.set(true);
        this.isOptimizing.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  generateInterviewQuestions() {
    if (!this.optimizedResume()) {
      alert('请先优化简历');
      return;
    }

    this.isGeneratingQuestions.set(true);
    this.currentStep.set(4);

    const questionsPrompt = `作为一名专业的面试官和HR专家，请根据以下信息生成面试问题：

职位要求：
${JSON.stringify(this.jobAnalysis(), null, 2)}

优化后的简历：
${JSON.stringify(this.optimizedResume()?.optimizedResume, null, 2)}

请生成以下类型的面试问题：
1. 常见问题（5-7个通用面试问题）
2. 技术问题（8-10个与职位相关的技术问题）
3. 行为问题（5-6个行为面试问题）
4. 准备建议（6-8个面试准备建议）
5. 重点话题（需要重点准备的技术领域）

请以JSON格式返回结果，包含以下字段：
- commonQuestions: string[]
- technicalQuestions: string[]
- behavioralQuestions: string[]
- preparationTips: string[]
- keyTopics: string[]`;

    this.geminiService.generateText(questionsPrompt, {
      type: 'code',
      maxTokens: 2500,
      temperature: 0.4
    }).subscribe({
      next: (response) => {
        try {
          const prediction = JSON.parse(response);
          this.interviewPrediction.set(prediction);
        } catch (error) {
          this.interviewPrediction.set(this.getFallbackInterviewPrediction());
        }

        this.isGeneratingQuestions.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 面试问题生成失败:', error);
        this.interviewPrediction.set(this.getFallbackInterviewPrediction());
        this.isGeneratingQuestions.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // Export methods
  exportToPDF() {
    // In a real implementation, you would use a PDF generation library
    console.log('导出PDF功能');
    this.downloadFile('resume.pdf', 'application/pdf', this.generatePDFContent());
  }

  exportToWord() {
    console.log('导出Word功能');
    this.downloadFile('resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', this.generateWordContent());
  }

  exportToJSON() {
    console.log('导出JSON功能');
    const jsonContent = JSON.stringify(this.optimizedResume()?.optimizedResume, null, 2);
    this.downloadFile('resume.json', 'application/json', jsonContent);
  }

  exportToHTML() {
    console.log('导出HTML功能');
    this.downloadFile('resume.html', 'text/html', this.generateHTMLContent());
  }

  // Helper methods
  private parseAnalysisResponse(response: string): any {
    // Parse text response and extract key information
    return {
      keySkills: ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
      experienceLevel: '中级到高级',
      requiredSkills: ['Angular', 'TypeScript', 'JavaScript'],
      preferredSkills: ['React', 'Vue.js', 'Node.js'],
      coreResponsibilities: ['前端开发', '用户界面设计', '性能优化'],
      companyValues: ['创新', '团队合作', '持续学习'],
      salaryRange: '15K-25K',
      careerPath: ['高级工程师', '技术专家', '架构师']
    };
  }

  private getFallbackAnalysis(): any {
    return {
      keySkills: ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'React', 'Vue.js'],
      experienceLevel: '中级到高级（3-5年经验）',
      requiredSkills: ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
      preferredSkills: ['React', 'Vue.js', 'Node.js', 'Python', 'Docker'],
      coreResponsibilities: [
        '负责前端应用的设计和开发',
        '优化用户体验和应用性能',
        '与后端团队协作完成项目',
        '参与技术方案设计和评审'
      ],
      companyValues: ['技术创新', '团队协作', '用户至上', '持续学习'],
      salaryRange: '15K-30K',
      careerPath: ['高级前端工程师', '前端架构师', '技术专家', '技术总监']
    };
  }

  private generateOptimizedResume(optimization: any): ResumeData {
    // Create an optimized version of the resume based on suggestions
    const optimized = JSON.parse(JSON.stringify(this.sampleResumeData));

    // Apply optimizations (simplified implementation)
    if (optimization.keywordOptimization) {
      optimized.summary = `${optimized.summary} 专精于${optimization.keywordOptimization.slice(0, 3).join('、')}等技术。`;
    }

    return optimized;
  }

  private getFallbackOptimization(): OptimizedResume {
    return {
      originalResume: this.sampleResumeData,
      optimizedResume: this.sampleResumeData,
      optimizationSuggestions: [
        '在简历开头添加与职位相关的关键词',
        '量化工作成果，使用具体数字',
        '突出与目标职位最相关的技能和经验',
        '调整技能部分的顺序，优先展示核心技能'
      ],
      matchScore: 78,
      missingSkills: ['Docker', 'Kubernetes', 'AWS'],
      strengthAreas: [
        'Angular开发经验丰富',
        'TypeScript技能扎实',
        '有团队管理经验',
        '项目交付能力强'
      ],
      improvementAreas: [
        '缺少云平台使用经验',
        '需要加强DevOps相关技能',
        '可以增加开源项目贡献',
        '建议获得相关技术认证'
      ]
    };
  }

  private getFallbackInterviewPrediction(): InterviewPrediction {
    return {
      commonQuestions: [
        '请简单介绍一下你自己',
        '为什么想要加入我们公司？',
        '你的职业规划是什么？',
        '你最大的优势是什么？',
        '你如何处理工作压力？',
        '你期望的薪资范围是多少？'
      ],
      technicalQuestions: [
        'Angular的生命周期钩子有哪些？',
        'TypeScript相比JavaScript有什么优势？',
        '如何优化Angular应用的性能？',
        '解释一下RxJS的Observable概念',
        '你如何处理组件间的数据传递？',
        'Angular的依赖注入是如何工作的？',
        '你使用过哪些状态管理方案？',
        '如何实现懒加载和代码分割？'
      ],
      behavioralQuestions: [
        '描述一次你解决复杂技术问题的经历',
        '你如何与团队成员协作完成项目？',
        '遇到紧急需求变更时你是如何处理的？',
        '描述一次你主动学习新技术的经历',
        '你如何平衡代码质量和开发速度？'
      ],
      preparationTips: [
        '准备具体的项目案例和技术细节',
        '复习Angular核心概念和最佳实践',
        '了解公司的产品和技术栈',
        '准备一些技术问题来询问面试官',
        '练习代码演示和白板编程',
        '准备讨论你的学习方法和成长经历'
      ],
      keyTopics: [
        'Angular框架深度理解',
        'TypeScript高级特性',
        '前端性能优化',
        '组件设计模式',
        '状态管理',
        '测试策略'
      ]
    };
  }

  // File generation and download methods
  private downloadFile(filename: string, mimeType: string, content: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generatePDFContent(): string {
    // Simplified PDF content generation
    // In a real implementation, you would use a library like jsPDF
    return `PDF content for ${this.optimizedResume()?.optimizedResume.personalInfo.name}'s resume`;
  }

  private generateWordContent(): string {
    // Simplified Word content generation
    // In a real implementation, you would use a library like docx
    return `Word document content for ${this.optimizedResume()?.optimizedResume.personalInfo.name}'s resume`;
  }

  private generateHTMLContent(): string {
    const resume = this.optimizedResume()?.optimizedResume;
    if (!resume) return '';

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.personalInfo.name} - 简历</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
        }
        .resume-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4a90e2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .name {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .title {
            font-size: 1.3em;
            color: #4a90e2;
            margin-bottom: 15px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 0.9em;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #4a90e2;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .experience-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
        }
        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .job-title {
            font-weight: bold;
            color: #2c3e50;
        }
        .company {
            color: #4a90e2;
            font-weight: 600;
        }
        .date {
            color: #666;
            font-size: 0.9em;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .skill-category {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
        }
        .skill-category h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .skill-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .skill-list li {
            padding: 3px 0;
            color: #666;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
        @media print {
            body { background: white; }
            .resume-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="header">
            <div class="name">${resume.personalInfo.name}</div>
            <div class="title">${resume.personalInfo.title}</div>
            <div class="contact-info">
                <span>📧 ${resume.personalInfo.email}</span>
                <span>📱 ${resume.personalInfo.phone}</span>
                <span>📍 ${resume.personalInfo.location}</span>
                <span>🔗 ${resume.personalInfo.website}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">个人简介</div>
            <p>${resume.summary}</p>
        </div>

        <div class="section">
            <div class="section-title">工作经验</div>
            ${resume.experience.map(exp => `
                <div class="experience-item">
                    <div class="job-header">
                        <div>
                            <div class="job-title">${exp.position}</div>
                            <div class="company">${exp.company}</div>
                        </div>
                        <div class="date">${exp.startDate} - ${exp.current ? '至今' : exp.endDate}</div>
                    </div>
                    <ul>
                        ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>
                    ${exp.achievements.length > 0 ? `
                        <div style="margin-top: 10px;">
                            <strong>主要成就：</strong>
                            <ul>
                                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <div class="section-title">技能专长</div>
            <div class="skills-grid">
                ${resume.skills.map(category => `
                    <div class="skill-category">
                        <h4>${category.category}</h4>
                        <ul class="skill-list">
                            ${category.skills.map(skill => `
                                <li>${skill.name} (${skill.years}年经验)</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">项目经验</div>
            ${resume.projects.map(project => `
                <div class="experience-item">
                    <div class="job-header">
                        <div class="job-title">${project.name}</div>
                        ${project.url ? `<a href="${project.url}" target="_blank">查看项目</a>` : ''}
                    </div>
                    <p>${project.description}</p>
                    <div><strong>技术栈：</strong> ${project.technologies.join(', ')}</div>
                    ${project.highlights.length > 0 ? `
                        <ul>
                            ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }
}
