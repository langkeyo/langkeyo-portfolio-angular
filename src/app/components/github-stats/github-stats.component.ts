import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubService, GitHubStats } from '../../services/github.service';
import { UserInteractionService } from '../../services/user-interaction.service';

@Component({
  selector: 'app-github-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './github-stats.component.html',
  styleUrls: ['./github-stats.component.scss']
})
export class GitHubStatsComponent implements OnInit {
  stats: GitHubStats | null = null;
  loading = true;
  error = false;

  constructor(
    private githubService: GitHubService,
    private userInteractionService: UserInteractionService
  ) {}

  ngOnInit() {
    // 等待用户交互后再加载数据
    this.userInteractionService.onUserInteraction(() => {
      this.loadGitHubStats();
    });
  }

  loadGitHubStats() {
    this.loading = true;
    this.error = false;

    this.githubService.getGitHubStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        console.log('GitHub Stats loaded:', stats);
      },
      error: (error) => {
        console.error('Failed to load GitHub stats:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  /**
   * 获取主要编程语言（前5个）
   */
  getTopLanguages(): { name: string; count: number; percentage: number }[] {
    if (!this.stats) return [];

    const languages = this.stats.languages;
    const total = Object.values(languages).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(languages)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * 格式化数字显示
   */
  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * 获取语言对应的颜色
   */
  getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#fa7343',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'SCSS': '#c6538c',
      'Vue': '#4FC08D',
      'React': '#61DAFB'
    };
    return colors[language] || '#8b949e';
  }

  /**
   * 重新加载数据
   */
  refresh() {
    this.loadGitHubStats();
  }
}
