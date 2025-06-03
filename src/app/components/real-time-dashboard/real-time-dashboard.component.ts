import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, forkJoin, BehaviorSubject } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { GitHubService, GitHubStats } from '../../services/github.service';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { UserInteractionService } from '../../services/user-interaction.service';

interface DashboardMetrics {
  github: GitHubStats | null;
  weather: WeatherData | null;
  skills: SkillProgress[];
  projects: ProjectProgress[];
  websiteStats: WebsiteStats;
  systemHealth: SystemHealth;
}

interface SkillProgress {
  name: string;
  level: number;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  category: string;
}

interface ProjectProgress {
  id: string;
  name: string;
  completion: number;
  status: 'active' | 'completed' | 'paused' | 'planning';
  lastCommit: Date;
  contributors: number;
  issues: number;
  stars: number;
}

interface WebsiteStats {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { path: string; views: number }[];
  referrers: { source: string; visits: number }[];
}

interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  status: 'healthy' | 'warning' | 'critical';
}

@Component({
  selector: 'app-real-time-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './real-time-dashboard.component.html',
  styleUrls: ['./real-time-dashboard.component.scss']
})
export class RealTimeDashboardComponent implements OnInit, OnDestroy {
  // 数据状态
  metrics: DashboardMetrics = {
    github: null,
    weather: null,
    skills: [],
    projects: [],
    websiteStats: {
      visitors: 0,
      pageViews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      topPages: [],
      referrers: []
    },
    systemHealth: {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      status: 'healthy'
    }
  };

  // 组件状态
  loading = true;
  error = false;
  lastUpdated = new Date();
  autoRefresh = true;
  refreshInterval = 30; // 秒
  selectedTimeRange = '24h';

  // 订阅管理
  private refreshSubscription?: Subscription;
  private dataSubscription?: Subscription;

  // 时间范围选项
  timeRanges = [
    { value: '1h', label: '1小时' },
    { value: '6h', label: '6小时' },
    { value: '24h', label: '24小时' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' }
  ];

  // 刷新间隔选项
  refreshIntervals = [
    { value: 10, label: '10秒' },
    { value: 30, label: '30秒' },
    { value: 60, label: '1分钟' },
    { value: 300, label: '5分钟' }
  ];

  constructor(
    private githubService: GitHubService,
    private weatherService: WeatherService,
    private userInteractionService: UserInteractionService,
    private cdr: ChangeDetectorRef
  ) {}

  // 暴露Math对象给模板使用
  protected Math = Math;

  ngOnInit() {
    // 等待用户交互后再加载数据
    this.userInteractionService.onUserInteraction(() => {
      this.loadDashboardData();
      this.startAutoRefresh();
    });
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  /**
   * 加载仪表板数据
   */
  loadDashboardData() {
    this.loading = true;
    this.error = false;

    // 并行加载所有数据源
    this.dataSubscription = forkJoin({
      github: this.githubService.getGitHubStats().pipe(
        catchError(error => {
          console.warn('GitHub数据加载失败:', error);
          return [null];
        })
      ),
      weather: this.weatherService.getCurrentWeather().pipe(
        catchError(error => {
          console.warn('天气数据加载失败:', error);
          return [null];
        })
      )
    }).subscribe({
      next: (data) => {
        this.metrics.github = data.github;
        this.metrics.weather = data.weather;
        
        // 加载其他数据
        this.loadSkillsProgress();
        this.loadProjectsProgress();
        this.loadWebsiteStats();
        this.loadSystemHealth();
        
        this.loading = false;
        this.lastUpdated = new Date();
        this.cdr.detectChanges();
        
        console.log('✅ 仪表板数据加载完成:', this.metrics);
      },
      error: (error) => {
        console.error('❌ 仪表板数据加载失败:', error);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * 加载技能进度数据
   */
  private loadSkillsProgress() {
    // 模拟技能进度数据
    this.metrics.skills = [
      {
        name: 'Angular',
        level: 9,
        progress: 85,
        trend: 'up',
        lastUpdated: new Date(),
        category: 'Frontend'
      },
      {
        name: 'TypeScript',
        level: 8,
        progress: 78,
        trend: 'up',
        lastUpdated: new Date(),
        category: 'Language'
      },
      {
        name: 'Node.js',
        level: 7,
        progress: 72,
        trend: 'stable',
        lastUpdated: new Date(),
        category: 'Backend'
      },
      {
        name: 'AI/ML',
        level: 6,
        progress: 65,
        trend: 'up',
        lastUpdated: new Date(),
        category: 'AI'
      },
      {
        name: 'Docker',
        level: 7,
        progress: 70,
        trend: 'stable',
        lastUpdated: new Date(),
        category: 'DevOps'
      }
    ];
  }

  /**
   * 加载项目进度数据
   */
  private loadProjectsProgress() {
    // 模拟项目进度数据
    this.metrics.projects = [
      {
        id: 'portfolio',
        name: 'Portfolio Website',
        completion: 85,
        status: 'active',
        lastCommit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        contributors: 1,
        issues: 3,
        stars: 12
      },
      {
        id: 'ai-tools',
        name: 'AI Tools Suite',
        completion: 70,
        status: 'active',
        lastCommit: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
        contributors: 2,
        issues: 8,
        stars: 25
      },
      {
        id: 'dashboard',
        name: 'Real-time Dashboard',
        completion: 60,
        status: 'active',
        lastCommit: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
        contributors: 1,
        issues: 5,
        stars: 8
      }
    ];
  }

  /**
   * 加载网站统计数据
   */
  private loadWebsiteStats() {
    // 模拟网站统计数据
    this.metrics.websiteStats = {
      visitors: Math.floor(Math.random() * 1000) + 500,
      pageViews: Math.floor(Math.random() * 5000) + 2000,
      bounceRate: Math.floor(Math.random() * 30) + 20,
      avgSessionDuration: Math.floor(Math.random() * 300) + 120,
      topPages: [
        { path: '/', views: Math.floor(Math.random() * 500) + 200 },
        { path: '/projects', views: Math.floor(Math.random() * 300) + 150 },
        { path: '/about', views: Math.floor(Math.random() * 200) + 100 },
        { path: '/contact', views: Math.floor(Math.random() * 150) + 80 }
      ],
      referrers: [
        { source: 'Google', visits: Math.floor(Math.random() * 200) + 100 },
        { source: 'GitHub', visits: Math.floor(Math.random() * 100) + 50 },
        { source: 'LinkedIn', visits: Math.floor(Math.random() * 80) + 30 },
        { source: 'Direct', visits: Math.floor(Math.random() * 150) + 80 }
      ]
    };
  }

  /**
   * 加载系统健康数据
   */
  private loadSystemHealth() {
    // 模拟系统健康数据
    const responseTime = Math.floor(Math.random() * 200) + 50;
    const errorRate = Math.random() * 5;
    const memoryUsage = Math.floor(Math.random() * 40) + 30;
    const cpuUsage = Math.floor(Math.random() * 30) + 10;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (responseTime > 200 || errorRate > 3 || memoryUsage > 80 || cpuUsage > 80) {
      status = 'warning';
    }
    if (responseTime > 500 || errorRate > 5 || memoryUsage > 90 || cpuUsage > 90) {
      status = 'critical';
    }

    this.metrics.systemHealth = {
      uptime: Math.floor(Math.random() * 30) + 1, // 天数
      responseTime,
      errorRate,
      memoryUsage,
      cpuUsage,
      status
    };
  }

  /**
   * 开始自动刷新
   */
  private startAutoRefresh() {
    if (this.autoRefresh) {
      this.refreshSubscription = interval(this.refreshInterval * 1000)
        .pipe(
          switchMap(() => {
            return forkJoin({
              github: this.githubService.getGitHubStats().pipe(
                catchError(() => [this.metrics.github])
              ),
              weather: this.weatherService.getCurrentWeather().pipe(
                catchError(() => [this.metrics.weather])
              )
            });
          })
        )
        .subscribe({
          next: (data) => {
            this.metrics.github = data.github;
            this.metrics.weather = data.weather;
            this.loadSystemHealth(); // 更新系统健康数据
            this.lastUpdated = new Date();
            this.cdr.detectChanges();
            console.log('🔄 仪表板数据自动更新');
          },
          error: (error) => {
            console.warn('⚠️ 自动刷新失败:', error);
          }
        });
    }
  }

  /**
   * 停止自动刷新
   */
  private stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  /**
   * 手动刷新数据
   */
  refresh() {
    this.loadDashboardData();
  }

  /**
   * 切换自动刷新
   */
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  /**
   * 更改刷新间隔
   */
  onRefreshIntervalChange() {
    this.stopAutoRefresh();
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * 获取状态颜色类
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'healthy': return 'status-healthy';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'paused': return 'status-paused';
      default: return '';
    }
  }

  /**
   * 获取趋势图标
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  /**
   * 格式化数字
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * 格式化时间
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  }
}
