import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  topics: string[];
}

export interface GitHubStats {
  user: GitHubUser;
  repos: GitHubRepo[];
  totalStars: number;
  totalForks: number;
  languages: { [key: string]: number };
  topRepos: GitHubRepo[];
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly username = 'langkeyo'; // 你的GitHub用户名

  constructor(private http: HttpClient) {}

  /**
   * 获取用户基本信息
   */
  getUser(): Observable<GitHubUser> {
    return this.http.get<GitHubUser>(`${this.baseUrl}/users/${this.username}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching GitHub user:', error);
          throw error;
        })
      );
  }

  /**
   * 获取用户所有仓库
   */
  getUserRepos(): Observable<GitHubRepo[]> {
    return this.http.get<GitHubRepo[]>(`${this.baseUrl}/users/${this.username}/repos?per_page=100&sort=updated`)
      .pipe(
        catchError(error => {
          console.error('Error fetching GitHub repos:', error);
          throw error;
        })
      );
  }

  /**
   * 获取完整的GitHub统计信息
   */
  getGitHubStats(): Observable<GitHubStats> {
    return forkJoin({
      user: this.getUser(),
      repos: this.getUserRepos()
    }).pipe(
      map(({ user, repos }) => {
        // 计算总星标数
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        
        // 计算总Fork数
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        
        // 统计编程语言
        const languages: { [key: string]: number } = {};
        repos.forEach(repo => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        // 获取最受欢迎的仓库（按星标数排序）
        const topRepos = repos
          .filter(repo => repo.stargazers_count > 0)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6);

        return {
          user,
          repos,
          totalStars,
          totalForks,
          languages,
          topRepos
        };
      }),
      catchError(error => {
        console.error('Error fetching GitHub stats:', error);
        throw error;
      })
    );
  }

  /**
   * 获取最近的提交活动
   */
  getRecentActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${this.username}/events/public?per_page=10`)
      .pipe(
        map(events => events.filter(event => 
          event.type === 'PushEvent' || 
          event.type === 'CreateEvent' || 
          event.type === 'PullRequestEvent'
        )),
        catchError(error => {
          console.error('Error fetching GitHub activity:', error);
          return [];
        })
      );
  }
}
