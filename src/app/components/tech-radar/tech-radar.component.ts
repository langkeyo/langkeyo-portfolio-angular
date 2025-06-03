import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { interval, Subscription } from 'rxjs';

interface TechItem {
  id: string;
  name: string;
  quadrant: 'languages' | 'frameworks' | 'tools' | 'platforms';
  ring: 'adopt' | 'trial' | 'assess' | 'hold';
  level: number; // 1-10 熟练度
  trend: 'rising' | 'stable' | 'declining';
  x: number; // 雷达图中的x坐标
  y: number; // 雷达图中的y坐标
  description: string;
  learningPath?: string[];
  marketDemand: number; // 1-10 市场需求度
  futureProspect: number; // 1-10 未来前景
  competitiveness: number; // 1-10 竞争力评分
  lastUpdated: Date;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
  prerequisites: string[];
  outcomes: string[];
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  estimatedTime: string;
  completed: boolean;
}

interface Resource {
  type: 'article' | 'video' | 'course' | 'book' | 'practice';
  title: string;
  url: string;
  provider: string;
  rating: number;
}

interface IndustryTrend {
  id: string;
  technology: string;
  trend: 'emerging' | 'growing' | 'mature' | 'declining';
  adoptionRate: number; // 0-100%
  marketGrowth: number; // 年增长率
  jobDemand: number; // 1-10
  salaryRange: { min: number; max: number };
  keyCompanies: string[];
  relatedTechnologies: string[];
  futureOutlook: string;
}

@Component({
  selector: 'app-tech-radar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tech-radar.component.html',
  styleUrls: ['./tech-radar.component.scss']
})
export class TechRadarComponent implements OnInit, OnDestroy {
  @ViewChild('radarCanvas', { static: true }) radarCanvas!: ElementRef<HTMLCanvasElement>;
  
  // 数据状态
  techItems: TechItem[] = [];
  learningPaths: LearningPath[] = [];
  industryTrends: IndustryTrend[] = [];
  
  // 组件状态
  selectedQuadrant: string = 'all';
  selectedRing: string = 'all';
  selectedTech: TechItem | null = null;
  showLearningPath = false;
  showTrendAnalysis = false;
  isGeneratingPath = false;
  isAnalyzingTrends = false;
  
  // 雷达图配置
  radarConfig = {
    centerX: 300,
    centerY: 300,
    radius: 250,
    rings: [
      { name: 'adopt', radius: 80, color: '#4CAF50', label: '采用' },
      { name: 'trial', radius: 140, color: '#FF9800', label: '试验' },
      { name: 'assess', radius: 200, color: '#2196F3', label: '评估' },
      { name: 'hold', radius: 250, color: '#9E9E9E', label: '暂缓' }
    ],
    quadrants: [
      { name: 'languages', angle: 0, color: '#E91E63', label: '编程语言' },
      { name: 'frameworks', angle: 90, color: '#9C27B0', label: '框架工具' },
      { name: 'tools', angle: 180, color: '#3F51B5', label: '开发工具' },
      { name: 'platforms', angle: 270, color: '#009688', label: '平台服务' }
    ]
  };
  
  // 筛选选项
  quadrantOptions = [
    { value: 'all', label: '全部象限', icon: '🌟' },
    { value: 'languages', label: '编程语言', icon: '💻' },
    { value: 'frameworks', label: '框架工具', icon: '🔧' },
    { value: 'tools', label: '开发工具', icon: '⚙️' },
    { value: 'platforms', label: '平台服务', icon: '☁️' }
  ];
  
  ringOptions = [
    { value: 'all', label: '全部环级', icon: '⭕' },
    { value: 'adopt', label: '采用', icon: '✅' },
    { value: 'trial', label: '试验', icon: '🧪' },
    { value: 'assess', label: '评估', icon: '🔍' },
    { value: 'hold', label: '暂缓', icon: '⏸️' }
  ];
  
  // 订阅管理
  private updateSubscription?: Subscription;
  
  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.initializeTechItems();
    this.initializeLearningPaths();
    this.initializeIndustryTrends();
    this.drawRadar();
    this.startPeriodicUpdates();
  }
  
  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
  
  /**
   * 初始化技术项目数据
   */
  private initializeTechItems() {
    this.techItems = [
      // 编程语言象限
      {
        id: 'typescript',
        name: 'TypeScript',
        quadrant: 'languages',
        ring: 'adopt',
        level: 9,
        trend: 'rising',
        x: 0,
        y: 0,
        description: '强类型JavaScript超集，提升代码质量和开发效率',
        marketDemand: 9,
        futureProspect: 9,
        competitiveness: 9,
        lastUpdated: new Date()
      },
      {
        id: 'python',
        name: 'Python',
        quadrant: 'languages',
        ring: 'adopt',
        level: 8,
        trend: 'stable',
        x: 0,
        y: 0,
        description: '多用途编程语言，在AI、数据科学和Web开发中广泛应用',
        marketDemand: 10,
        futureProspect: 9,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      {
        id: 'rust',
        name: 'Rust',
        quadrant: 'languages',
        ring: 'trial',
        level: 6,
        trend: 'rising',
        x: 0,
        y: 0,
        description: '系统级编程语言，注重安全性和性能',
        marketDemand: 7,
        futureProspect: 9,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      
      // 框架工具象限
      {
        id: 'angular',
        name: 'Angular',
        quadrant: 'frameworks',
        ring: 'adopt',
        level: 9,
        trend: 'stable',
        x: 0,
        y: 0,
        description: '企业级前端框架，提供完整的开发解决方案',
        marketDemand: 8,
        futureProspect: 8,
        competitiveness: 9,
        lastUpdated: new Date()
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        quadrant: 'frameworks',
        ring: 'adopt',
        level: 8,
        trend: 'rising',
        x: 0,
        y: 0,
        description: 'React全栈框架，支持SSR和静态生成',
        marketDemand: 9,
        futureProspect: 9,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      {
        id: 'svelte',
        name: 'Svelte',
        quadrant: 'frameworks',
        ring: 'assess',
        level: 5,
        trend: 'rising',
        x: 0,
        y: 0,
        description: '编译时优化的前端框架，性能优异',
        marketDemand: 6,
        futureProspect: 8,
        competitiveness: 7,
        lastUpdated: new Date()
      },
      
      // 开发工具象限
      {
        id: 'vscode',
        name: 'VS Code',
        quadrant: 'tools',
        ring: 'adopt',
        level: 10,
        trend: 'stable',
        x: 0,
        y: 0,
        description: '轻量级但功能强大的代码编辑器',
        marketDemand: 10,
        futureProspect: 8,
        competitiveness: 10,
        lastUpdated: new Date()
      },
      {
        id: 'docker',
        name: 'Docker',
        quadrant: 'tools',
        ring: 'adopt',
        level: 8,
        trend: 'stable',
        x: 0,
        y: 0,
        description: '容器化技术，简化应用部署和管理',
        marketDemand: 9,
        futureProspect: 8,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        quadrant: 'tools',
        ring: 'trial',
        level: 7,
        trend: 'rising',
        x: 0,
        y: 0,
        description: 'AI驱动的代码助手，提升开发效率',
        marketDemand: 8,
        futureProspect: 10,
        competitiveness: 9,
        lastUpdated: new Date()
      },
      
      // 平台服务象限
      {
        id: 'aws',
        name: 'AWS',
        quadrant: 'platforms',
        ring: 'adopt',
        level: 7,
        trend: 'stable',
        x: 0,
        y: 0,
        description: '亚马逊云服务平台，提供全面的云计算解决方案',
        marketDemand: 10,
        futureProspect: 9,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      {
        id: 'vercel',
        name: 'Vercel',
        quadrant: 'platforms',
        ring: 'adopt',
        level: 8,
        trend: 'rising',
        x: 0,
        y: 0,
        description: '前端部署平台，专为现代Web应用优化',
        marketDemand: 7,
        futureProspect: 8,
        competitiveness: 8,
        lastUpdated: new Date()
      },
      {
        id: 'edge-computing',
        name: 'Edge Computing',
        quadrant: 'platforms',
        ring: 'assess',
        level: 5,
        trend: 'rising',
        x: 0,
        y: 0,
        description: '边缘计算技术，降低延迟提升性能',
        marketDemand: 7,
        futureProspect: 9,
        competitiveness: 6,
        lastUpdated: new Date()
      }
    ];
    
    // 计算每个技术项目在雷达图中的位置
    this.calculatePositions();
  }
  
  /**
   * 计算技术项目在雷达图中的位置
   */
  private calculatePositions() {
    this.techItems.forEach(item => {
      const quadrant = this.radarConfig.quadrants.find(q => q.name === item.quadrant);
      const ring = this.radarConfig.rings.find(r => r.name === item.ring);
      
      if (quadrant && ring) {
        // 在象限内随机分布，但保持在对应的环内
        const angleOffset = (Math.random() - 0.5) * 80; // ±40度随机偏移
        const radiusOffset = (Math.random() - 0.5) * 40; // 环内随机位置
        
        const angle = (quadrant.angle + angleOffset) * Math.PI / 180;
        const radius = ring.radius + radiusOffset;
        
        item.x = this.radarConfig.centerX + radius * Math.cos(angle);
        item.y = this.radarConfig.centerY + radius * Math.sin(angle);
      }
    });
  }
  
  /**
   * 初始化学习路径数据
   */
  private initializeLearningPaths() {
    this.learningPaths = [
      {
        id: 'fullstack-path',
        title: '全栈开发学习路径',
        description: '从前端到后端的完整开发技能培养',
        duration: '6-12个月',
        difficulty: 'intermediate',
        steps: [],
        prerequisites: ['HTML/CSS基础', 'JavaScript基础'],
        outcomes: ['独立开发完整Web应用', '掌握前后端技术栈', '具备项目架构能力']
      },
      {
        id: 'ai-integration-path',
        title: 'AI集成开发路径',
        description: '学习如何在应用中集成AI功能',
        duration: '3-6个月',
        difficulty: 'advanced',
        steps: [],
        prerequisites: ['编程基础', 'API使用经验'],
        outcomes: ['掌握AI API集成', '开发智能应用功能', '理解AI应用架构']
      }
    ];
  }
  
  /**
   * 初始化行业趋势数据
   */
  private initializeIndustryTrends() {
    this.industryTrends = [
      {
        id: 'ai-development',
        technology: 'AI开发',
        trend: 'emerging',
        adoptionRate: 75,
        marketGrowth: 45,
        jobDemand: 10,
        salaryRange: { min: 150000, max: 300000 },
        keyCompanies: ['OpenAI', 'Google', 'Microsoft', 'Meta'],
        relatedTechnologies: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
        futureOutlook: 'AI开发将成为未来5年最重要的技能之一，市场需求持续增长'
      },
      {
        id: 'cloud-native',
        technology: '云原生开发',
        trend: 'growing',
        adoptionRate: 85,
        marketGrowth: 25,
        jobDemand: 9,
        salaryRange: { min: 120000, max: 250000 },
        keyCompanies: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Kubernetes'],
        relatedTechnologies: ['Docker', 'Kubernetes', 'Microservices', 'Serverless'],
        futureOutlook: '云原生技术已成为企业数字化转型的核心，需求稳定增长'
      }
    ];
  }

  /**
   * 绘制雷达图
   */
  private drawRadar() {
    const canvas = this.radarCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制环形
    this.radarConfig.rings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(this.radarConfig.centerX, this.radarConfig.centerY, ring.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制环标签
      ctx.fillStyle = ring.color;
      ctx.font = '12px Arial';
      ctx.fillText(ring.label, this.radarConfig.centerX + ring.radius - 30, this.radarConfig.centerY - 5);
    });

    // 绘制象限分割线
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.radarConfig.centerX, this.radarConfig.centerY - this.radarConfig.radius);
    ctx.lineTo(this.radarConfig.centerX, this.radarConfig.centerY + this.radarConfig.radius);
    ctx.moveTo(this.radarConfig.centerX - this.radarConfig.radius, this.radarConfig.centerY);
    ctx.lineTo(this.radarConfig.centerX + this.radarConfig.radius, this.radarConfig.centerY);
    ctx.stroke();

    // 绘制象限标签
    this.radarConfig.quadrants.forEach(quadrant => {
      const angle = quadrant.angle * Math.PI / 180;
      const labelRadius = this.radarConfig.radius + 30;
      const x = this.radarConfig.centerX + labelRadius * Math.cos(angle);
      const y = this.radarConfig.centerY + labelRadius * Math.sin(angle);

      ctx.fillStyle = quadrant.color;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(quadrant.label, x, y);
    });

    // 绘制技术项目点
    this.getFilteredTechItems().forEach(item => {
      this.drawTechItem(ctx, item);
    });
  }

  /**
   * 绘制技术项目点
   */
  private drawTechItem(ctx: CanvasRenderingContext2D, item: TechItem) {
    const quadrant = this.radarConfig.quadrants.find(q => q.name === item.quadrant);
    if (!quadrant) return;

    // 绘制点
    ctx.beginPath();
    ctx.arc(item.x, item.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = quadrant.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制趋势指示器
    if (item.trend === 'rising') {
      ctx.fillStyle = '#4CAF50';
      ctx.fillText('↗', item.x + 8, item.y - 8);
    } else if (item.trend === 'declining') {
      ctx.fillStyle = '#F44336';
      ctx.fillText('↘', item.x + 8, item.y - 8);
    }

    // 绘制名称标签
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y + 20);
  }

  /**
   * 获取筛选后的技术项目
   */
  getFilteredTechItems(): TechItem[] {
    return this.techItems.filter(item => {
      const quadrantMatch = this.selectedQuadrant === 'all' || item.quadrant === this.selectedQuadrant;
      const ringMatch = this.selectedRing === 'all' || item.ring === this.selectedRing;
      return quadrantMatch && ringMatch;
    });
  }

  /**
   * 选择技术项目
   */
  selectTech(tech: TechItem) {
    this.selectedTech = tech;
    this.showLearningPath = false;
    this.showTrendAnalysis = false;
  }

  /**
   * 生成学习路径
   */
  generateLearningPath(tech: TechItem) {
    this.isGeneratingPath = true;
    this.showLearningPath = true;

    // 模拟AI生成学习路径
    setTimeout(() => {
      const learningPath: LearningPath = {
        id: `${tech.id}-path`,
        title: `${tech.name} 学习路径`,
        description: `专为掌握 ${tech.name} 技术而设计的完整学习计划`,
        duration: '2-4个月',
        difficulty: tech.level > 7 ? 'advanced' : tech.level > 4 ? 'intermediate' : 'beginner',
        steps: this.generateLearningSteps(tech),
        prerequisites: this.getPrerequisites(tech),
        outcomes: this.getLearningOutcomes(tech)
      };

      this.learningPaths.unshift(learningPath);
      this.isGeneratingPath = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  /**
   * 生成学习步骤
   */
  private generateLearningSteps(tech: TechItem): LearningStep[] {
    const baseSteps = [
      {
        id: 'basics',
        title: '基础概念学习',
        description: `了解 ${tech.name} 的核心概念和基本原理`,
        resources: [],
        estimatedTime: '1-2周',
        completed: false
      },
      {
        id: 'hands-on',
        title: '实践项目',
        description: `通过实际项目练习 ${tech.name} 的使用`,
        resources: [],
        estimatedTime: '2-4周',
        completed: false
      },
      {
        id: 'advanced',
        title: '高级特性',
        description: `深入学习 ${tech.name} 的高级功能和最佳实践`,
        resources: [],
        estimatedTime: '2-3周',
        completed: false
      },
      {
        id: 'production',
        title: '生产环境应用',
        description: `学习在生产环境中使用 ${tech.name} 的注意事项`,
        resources: [],
        estimatedTime: '1-2周',
        completed: false
      }
    ];

    return baseSteps;
  }

  /**
   * 获取前置条件
   */
  private getPrerequisites(tech: TechItem): string[] {
    const prerequisites: { [key: string]: string[] } = {
      'typescript': ['JavaScript基础', 'ES6+语法'],
      'angular': ['TypeScript', 'HTML/CSS', 'JavaScript'],
      'nextjs': ['React基础', 'JavaScript', 'Node.js'],
      'docker': ['Linux基础', '命令行操作'],
      'aws': ['云计算概念', '网络基础']
    };

    return prerequisites[tech.id] || ['编程基础'];
  }

  /**
   * 获取学习成果
   */
  private getLearningOutcomes(tech: TechItem): string[] {
    const outcomes: { [key: string]: string[] } = {
      'typescript': ['掌握类型系统', '提升代码质量', '增强开发效率'],
      'angular': ['构建企业级应用', '掌握组件化开发', '理解依赖注入'],
      'nextjs': ['开发全栈应用', '掌握SSR技术', '优化性能'],
      'docker': ['容器化应用', '简化部署流程', '提升开发效率'],
      'aws': ['云服务架构', '成本优化', '高可用性设计']
    };

    return outcomes[tech.id] || [`掌握${tech.name}核心技能`, '提升技术竞争力', '拓展职业发展机会'];
  }

  /**
   * 分析行业趋势
   */
  analyzeTrends() {
    this.isAnalyzingTrends = true;
    this.showTrendAnalysis = true;

    // 模拟AI分析行业趋势
    setTimeout(() => {
      this.isAnalyzingTrends = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  /**
   * 计算竞争力评分
   */
  calculateCompetitiveness(tech: TechItem): number {
    // 基于技能水平、市场需求和未来前景计算综合竞争力
    const skillWeight = 0.4;
    const demandWeight = 0.3;
    const prospectWeight = 0.3;

    return Math.round(
      (tech.level * skillWeight + tech.marketDemand * demandWeight + tech.futureProspect * prospectWeight)
    );
  }

  /**
   * 获取技能等级描述
   */
  getSkillLevelDescription(level: number): string {
    if (level >= 9) return '专家级';
    if (level >= 7) return '高级';
    if (level >= 5) return '中级';
    if (level >= 3) return '初级';
    return '入门';
  }

  /**
   * 获取趋势图标
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'rising': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '➡️';
    }
  }

  /**
   * 获取环级颜色
   */
  getRingColor(ring: string): string {
    const ringConfig = this.radarConfig.rings.find(r => r.name === ring);
    return ringConfig?.color || '#999';
  }

  /**
   * 获取象限颜色
   */
  getQuadrantColor(quadrant: string): string {
    const quadrantConfig = this.radarConfig.quadrants.find(q => q.name === quadrant);
    return quadrantConfig?.color || '#999';
  }

  /**
   * 筛选象限
   */
  filterByQuadrant(quadrant: string) {
    this.selectedQuadrant = quadrant;
    this.drawRadar();
  }

  /**
   * 筛选环级
   */
  filterByRing(ring: string) {
    this.selectedRing = ring;
    this.drawRadar();
  }

  /**
   * 开始定期更新
   */
  private startPeriodicUpdates() {
    // 每5分钟更新一次数据
    this.updateSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.updateTechData();
    });
  }

  /**
   * 更新技术数据
   */
  private updateTechData() {
    // 模拟数据更新
    this.techItems.forEach(item => {
      // 随机微调市场需求和未来前景
      item.marketDemand = Math.max(1, Math.min(10, item.marketDemand + (Math.random() - 0.5) * 0.5));
      item.futureProspect = Math.max(1, Math.min(10, item.futureProspect + (Math.random() - 0.5) * 0.5));
      item.competitiveness = this.calculateCompetitiveness(item);
      item.lastUpdated = new Date();
    });

    this.cdr.detectChanges();
  }

  /**
   * 重置筛选
   */
  resetFilters() {
    this.selectedQuadrant = 'all';
    this.selectedRing = 'all';
    this.drawRadar();
  }

  /**
   * 导出雷达图数据
   */
  exportRadarData() {
    const data = {
      techItems: this.techItems,
      learningPaths: this.learningPaths,
      industryTrends: this.industryTrends,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tech-radar-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 关闭模态框
   */
  closeModal() {
    this.selectedTech = null;
    this.showLearningPath = false;
    this.showTrendAnalysis = false;
  }

  /**
   * 获取象限标签
   */
  getQuadrantLabel(quadrantName: string): string {
    const quadrant = this.radarConfig.quadrants.find(q => q.name === quadrantName);
    return quadrant?.label || '';
  }

  /**
   * 获取环级标签
   */
  getRingLabel(ringName: string): string {
    const ring = this.radarConfig.rings.find(r => r.name === ringName);
    return ring?.label || '';
  }

  /**
   * 获取上升趋势技术数量
   */
  getRisingTechCount(): number {
    return this.techItems.filter(t => t.trend === 'rising').length;
  }

  /**
   * 获取稳定趋势技术数量
   */
  getStableTechCount(): number {
    return this.techItems.filter(t => t.trend === 'stable').length;
  }

  /**
   * 获取下降趋势技术数量
   */
  getDecliningTechCount(): number {
    return this.techItems.filter(t => t.trend === 'declining').length;
  }

  /**
   * 格式化薪资范围
   */
  formatSalaryRange(min: number, max: number): string {
    return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
  }

  /**
   * 获取公司列表（限制数量）
   */
  getLimitedCompanies(companies: string[], limit: number = 4): string[] {
    return companies.slice(0, limit);
  }

  /**
   * 获取相关技术列表（限制数量）
   */
  getLimitedTechnologies(technologies: string[], limit: number = 4): string[] {
    return technologies.slice(0, limit);
  }
}
