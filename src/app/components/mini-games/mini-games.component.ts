import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameScore {
  game: string;
  score: number;
  date: Date;
}

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'action' | 'puzzle' | 'arcade';
  color: string;
}

@Component({
  selector: 'app-mini-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="games" class="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <!-- 背景星空效果 -->
      <div class="absolute inset-0 overflow-hidden">
        <div *ngFor="let star of stars" 
             [style.left.%]="star.x" 
             [style.top.%]="star.y"
             [style.animation-delay.s]="star.delay"
             class="absolute w-1 h-1 bg-white rounded-full animate-twinkle">
        </div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <!-- 标题部分 -->
        <div class="text-center mb-16">
          <h2 class="text-5xl font-bold text-white mb-6">
            🎮 互动小游戏
          </h2>
          <p class="text-xl text-purple-200 max-w-3xl mx-auto">
            在工作之余，来点轻松的小游戏吧！测试你的反应速度和技巧
          </p>
        </div>

        <!-- 游戏选择界面 -->
        <div *ngIf="!currentGame" class="game-selection">
          <!-- 最高分展示 -->
          <div *ngIf="highScores.length > 0" class="mb-12 text-center">
            <h3 class="text-2xl font-bold text-white mb-6">🏆 最高分记录</h3>
            <div class="flex flex-wrap justify-center gap-4">
              <div *ngFor="let score of highScores.slice(0, 3)" 
                   class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div class="text-yellow-400 font-bold">{{ score.game }}</div>
                <div class="text-2xl font-bold text-white">{{ score.score }}</div>
                <div class="text-purple-200 text-sm">{{ score.date | date:'short' }}</div>
              </div>
            </div>
          </div>

          <!-- 游戏网格 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let game of games" 
                 (click)="selectGame(game)"
                 class="group game-clickable bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              
              <!-- 游戏图标 -->
              <div [class]="'text-6xl mb-4 text-center ' + game.color">
                {{ game.icon }}
              </div>

              <!-- 游戏信息 -->
              <h3 class="text-xl font-bold text-white mb-2 text-center">{{ game.name }}</h3>
              <p class="text-purple-200 text-sm mb-4 text-center">{{ game.description }}</p>

              <!-- 游戏标签 -->
              <div class="flex justify-center space-x-2 mb-4">
                <span [class]="getDifficultyClass(game.difficulty)" class="px-3 py-1 rounded-full text-xs font-bold">
                  {{ getDifficultyText(game.difficulty) }}
                </span>
                <span class="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                  {{ getCategoryText(game.category) }}
                </span>
              </div>

              <!-- 开始按钮 -->
              <button class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform group-hover:scale-105">
                开始游戏
              </button>
            </div>
          </div>
        </div>

        <!-- 游戏区域 -->
        <div *ngIf="currentGame" class="game-area">
          <!-- 游戏头部 -->
          <div class="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div class="flex items-center space-x-4">
              <button (click)="backToSelection()" 
                      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
                ← 返回
              </button>
              <h3 class="text-2xl font-bold text-white">{{ currentGame.name }}</h3>
            </div>
            <div class="text-right">
              <div class="text-white font-bold">分数: {{ currentScore }}</div>
              <div class="text-purple-200 text-sm">最高: {{ getHighScore(currentGame.id) }}</div>
            </div>
          </div>

          <!-- 反应速度游戏 -->
          <div *ngIf="currentGame.id === 'reaction'" class="reaction-game">
            <div class="text-center">
              <div #gameArea
                   (click)="onReactionClick()"
                   [class]="getReactionAreaClass()"
                   class="w-80 h-80 mx-auto rounded-2xl flex items-center justify-center game-clickable transition-all duration-300 mb-6">
                <div class="text-4xl font-bold">{{ reactionMessage }}</div>
              </div>
              <div class="text-white text-lg mb-4">{{ reactionInstructions }}</div>
              <button *ngIf="!reactionGameActive" 
                      (click)="startReactionGame()"
                      class="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors duration-200">
                开始测试
              </button>
            </div>
          </div>

          <!-- 记忆游戏 -->
          <div *ngIf="currentGame.id === 'memory'" class="memory-game">
            <div class="text-center mb-6">
              <div class="text-white text-lg mb-4">记住闪烁的顺序，然后按相同顺序点击</div>
              <div class="text-purple-200">当前关卡: {{ memoryLevel }}</div>
            </div>
            <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <button *ngFor="let button of memoryButtons; let i = index"
                      (click)="onMemoryButtonClick(i)"
                      [class]="getMemoryButtonClass(i)"
                      [disabled]="!memoryCanClick"
                      class="w-20 h-20 rounded-xl font-bold text-2xl transition-all duration-200">
                {{ i + 1 }}
              </button>
            </div>
            <div class="text-center">
              <button *ngIf="!memoryGameActive" 
                      (click)="startMemoryGame()"
                      class="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors duration-200">
                开始游戏
              </button>
            </div>
          </div>

          <!-- 点击游戏 -->
          <div *ngIf="currentGame.id === 'clicker'" class="clicker-game">
            <div class="text-center">
              <div class="text-white text-lg mb-4">在 {{ clickerTimeLeft }} 秒内尽可能多地点击目标！</div>
              <div class="relative w-96 h-96 mx-auto bg-gray-800/50 rounded-2xl mb-6 overflow-hidden">
                <div *ngIf="clickerTarget.visible"
                     (click)="onTargetClick()"
                     [style.left.px]="clickerTarget.x"
                     [style.top.px]="clickerTarget.y"
                     class="absolute w-12 h-12 bg-red-500 rounded-full game-target hover:bg-red-400 transition-colors duration-100 flex items-center justify-center text-white font-bold">
                  🎯
                </div>
              </div>
              <button *ngIf="!clickerGameActive" 
                      (click)="startClickerGame()"
                      class="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors duration-200">
                开始游戏
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .animate-twinkle {
      animation: twinkle 2s ease-in-out infinite;
    }

    @keyframes flash {
      0%, 100% { background-color: rgb(59 130 246); }
      50% { background-color: rgb(239 68 68); }
    }

    .flash-animation {
      animation: flash 0.3s ease-in-out;
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
      50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
    }

    .pulse-glow {
      animation: pulse-glow 1s ease-in-out infinite;
    }
  `]
})
export class MiniGamesComponent implements OnInit, OnDestroy {
  @ViewChild('gameArea') gameArea!: ElementRef;

  // 游戏数据
  games: Game[] = [
    {
      id: 'reaction',
      name: '反应速度测试',
      description: '测试你的反应速度，看看你能多快点击变色的区域',
      icon: '⚡',
      difficulty: 'easy',
      category: 'action',
      color: 'text-yellow-400'
    },
    {
      id: 'memory',
      name: '记忆挑战',
      description: '记住闪烁的顺序，然后按相同顺序重复',
      icon: '🧠',
      difficulty: 'medium',
      category: 'puzzle',
      color: 'text-blue-400'
    },
    {
      id: 'clicker',
      name: '快速点击',
      description: '在限定时间内点击尽可能多的目标',
      icon: '🎯',
      difficulty: 'hard',
      category: 'arcade',
      color: 'text-red-400'
    }
  ];

  // 背景星星
  stars: Array<{x: number, y: number, delay: number}> = [];

  // 游戏状态
  currentGame: Game | null = null;
  currentScore = 0;
  highScores: GameScore[] = [];

  // 反应速度游戏
  reactionGameActive = false;
  reactionMessage = '点击开始';
  reactionInstructions = '等待绿色出现时立即点击！';
  reactionStartTime = 0;
  reactionTimeout: any;
  reactionState: 'waiting' | 'ready' | 'click' | 'too-early' = 'waiting';

  // 记忆游戏
  memoryGameActive = false;
  memoryLevel = 1;
  memorySequence: number[] = [];
  memoryUserSequence: number[] = [];
  memoryButtons = Array(9).fill(false);
  memoryCanClick = false;
  memoryShowingSequence = false;

  // 点击游戏
  clickerGameActive = false;
  clickerTimeLeft = 10;
  clickerTarget = { x: 0, y: 0, visible: false };
  clickerInterval: any;
  clickerTimeout: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.generateStars();
    this.loadHighScores();
  }

  ngOnDestroy() {
    this.clearAllTimers();
  }

  // 生成背景星星
  generateStars() {
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      });
    }
  }

  // 选择游戏
  selectGame(game: Game) {
    this.currentGame = game;
    this.currentScore = 0;
    // 使用 setTimeout 避免变更检测错误
    setTimeout(() => {
      this.resetGameStates();
    }, 0);
  }

  // 返回游戏选择
  backToSelection() {
    this.currentGame = null;
    this.clearAllTimers();
    this.resetGameStates();
  }

  // 重置游戏状态
  resetGameStates() {
    // 反应速度游戏
    this.reactionGameActive = false;
    this.reactionMessage = '点击开始';
    this.reactionInstructions = '等待绿色出现时立即点击！';
    this.reactionState = 'waiting';

    // 记忆游戏
    this.memoryGameActive = false;
    this.memoryLevel = 1;
    this.memorySequence = [];
    this.memoryUserSequence = [];
    this.memoryButtons.fill(false);
    this.memoryCanClick = false;

    // 点击游戏
    this.clickerGameActive = false;
    this.clickerTimeLeft = 10;
    this.clickerTarget.visible = false;

    // 手动触发变更检测
    this.cdr.detectChanges();
  }

  // 清除所有计时器
  clearAllTimers() {
    if (this.reactionTimeout) clearTimeout(this.reactionTimeout);
    if (this.clickerInterval) clearInterval(this.clickerInterval);
    if (this.clickerTimeout) clearTimeout(this.clickerTimeout);
  }

  // 获取难度样式
  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/30 text-green-200';
      case 'medium': return 'bg-yellow-500/30 text-yellow-200';
      case 'hard': return 'bg-red-500/30 text-red-200';
      default: return 'bg-gray-500/30 text-gray-200';
    }
  }

  // 获取难度文本
  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  }

  // 获取分类文本
  getCategoryText(category: string): string {
    switch (category) {
      case 'action': return '动作';
      case 'puzzle': return '益智';
      case 'arcade': return '街机';
      default: return '其他';
    }
  }

  // 获取最高分
  getHighScore(gameId: string): number {
    const score = this.highScores.find(s => s.game === gameId);
    return score ? score.score : 0;
  }

  // 保存分数
  saveScore(gameId: string, score: number) {
    const existingIndex = this.highScores.findIndex(s => s.game === gameId);
    const newScore: GameScore = {
      game: gameId,
      score: score,
      date: new Date()
    };

    if (existingIndex >= 0) {
      if (score > this.highScores[existingIndex].score) {
        this.highScores[existingIndex] = newScore;
      }
    } else {
      this.highScores.push(newScore);
    }

    this.highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('miniGameHighScores', JSON.stringify(this.highScores));
  }

  // 加载最高分
  loadHighScores() {
    const saved = localStorage.getItem('miniGameHighScores');
    if (saved) {
      this.highScores = JSON.parse(saved).map((score: any) => ({
        ...score,
        date: new Date(score.date)
      }));
    }
  }

  // 反应速度游戏方法
  startReactionGame() {
    this.reactionGameActive = true;
    this.reactionState = 'waiting';
    this.reactionMessage = '等待...';
    this.reactionInstructions = '等待绿色出现！不要提前点击！';

    // 使用 setTimeout 避免变更检测错误
    setTimeout(() => {
      const delay = 2000 + Math.random() * 3000; // 2-5秒随机延迟
      this.reactionTimeout = setTimeout(() => {
        this.reactionState = 'ready';
        this.reactionMessage = '点击！';
        this.reactionStartTime = Date.now();
        this.cdr.detectChanges();
      }, delay);
    }, 0);
  }

  onReactionClick() {
    if (!this.reactionGameActive) return;

    if (this.reactionState === 'waiting') {
      this.reactionState = 'too-early';
      this.reactionMessage = '太早了！';
      this.reactionInstructions = '等待绿色再点击！';
      clearTimeout(this.reactionTimeout);
      setTimeout(() => {
        this.startReactionGame();
        this.cdr.detectChanges();
      }, 1000);
    } else if (this.reactionState === 'ready') {
      const reactionTime = Date.now() - this.reactionStartTime;
      this.currentScore = reactionTime;
      this.reactionMessage = `${reactionTime}ms`;
      this.reactionInstructions = `反应时间: ${reactionTime}毫秒`;
      this.reactionGameActive = false;
      this.saveScore('reaction', reactionTime);
      this.cdr.detectChanges();
    }
  }

  getReactionAreaClass(): string {
    let baseClass = 'w-80 h-80 mx-auto rounded-2xl flex items-center justify-center game-clickable transition-all duration-300 mb-6';

    switch (this.reactionState) {
      case 'waiting':
        return baseClass + ' bg-red-500 text-white';
      case 'ready':
        return baseClass + ' bg-green-500 text-white pulse-glow';
      case 'click':
        return baseClass + ' bg-blue-500 text-white';
      case 'too-early':
        return baseClass + ' bg-yellow-500 text-black flash-animation';
      default:
        return baseClass + ' bg-gray-500 text-white';
    }
  }

  // 记忆游戏方法
  startMemoryGame() {
    this.memoryGameActive = true;
    this.memoryLevel = 1;
    this.memorySequence = [];
    this.memoryUserSequence = [];
    this.memoryCanClick = false;
    this.cdr.detectChanges(); // 手动触发变更检测
    setTimeout(() => {
      this.addToMemorySequence();
    }, 0);
  }

  addToMemorySequence() {
    this.memorySequence.push(Math.floor(Math.random() * 9));
    this.showMemorySequence();
  }

  showMemorySequence() {
    this.memoryCanClick = false;
    this.memoryShowingSequence = true;
    this.memoryButtons.fill(false);
    this.cdr.detectChanges(); // 手动触发变更检测

    let index = 0;
    const showNext = () => {
      if (index < this.memorySequence.length) {
        this.memoryButtons[this.memorySequence[index]] = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.memoryButtons[this.memorySequence[index]] = false;
          this.cdr.detectChanges();
          index++;
          setTimeout(showNext, 300);
        }, 600);
      } else {
        this.memoryShowingSequence = false;
        setTimeout(() => {
          this.memoryCanClick = true;
          this.memoryUserSequence = [];
          this.cdr.detectChanges();
        }, 0);
      }
    };

    setTimeout(showNext, 500);
  }

  onMemoryButtonClick(index: number) {
    if (!this.memoryCanClick || this.memoryShowingSequence) return;
    
    this.memoryUserSequence.push(index);
    
    // 检查当前输入是否正确
    const currentIndex = this.memoryUserSequence.length - 1;
    if (this.memoryUserSequence[currentIndex] !== this.memorySequence[currentIndex]) {
      // 游戏结束
      this.currentScore = this.memoryLevel - 1;
      this.saveScore('memory', this.currentScore);
      this.memoryGameActive = false;
      return;
    }
    
    // 检查是否完成当前序列
    if (this.memoryUserSequence.length === this.memorySequence.length) {
      this.memoryLevel++;
      this.currentScore = this.memoryLevel - 1;
      setTimeout(() => this.addToMemorySequence(), 1000);
    }
  }

  getMemoryButtonClass(index: number): string {
    let baseClass = 'w-20 h-20 rounded-xl font-bold text-2xl transition-all duration-200 game-clickable';

    if (this.memoryButtons[index]) {
      return baseClass + ' bg-blue-500 text-white transform scale-110';
    } else {
      return baseClass + ' bg-gray-600 text-gray-300 hover:bg-gray-500';
    }
  }

  // 点击游戏方法
  startClickerGame() {
    this.clickerGameActive = true;
    this.clickerTimeLeft = 10;
    this.currentScore = 0;
    this.spawnTarget();
    
    this.clickerInterval = setInterval(() => {
      this.clickerTimeLeft--;
      if (this.clickerTimeLeft <= 0) {
        this.endClickerGame();
      }
    }, 1000);
  }

  spawnTarget() {
    if (!this.clickerGameActive) return;
    
    this.clickerTarget = {
      x: Math.random() * (384 - 48), // 游戏区域宽度 - 目标宽度
      y: Math.random() * (384 - 48), // 游戏区域高度 - 目标高度
      visible: true
    };
    
    this.clickerTimeout = setTimeout(() => {
      if (this.clickerGameActive) {
        this.clickerTarget.visible = false;
        setTimeout(() => this.spawnTarget(), 200);
      }
    }, 1000 + Math.random() * 1000); // 1-2秒显示时间
  }

  onTargetClick() {
    if (this.clickerTarget.visible) {
      this.currentScore++;
      this.clickerTarget.visible = false;
      clearTimeout(this.clickerTimeout);
      setTimeout(() => this.spawnTarget(), 100);
    }
  }

  endClickerGame() {
    this.clickerGameActive = false;
    this.clickerTarget.visible = false;
    clearInterval(this.clickerInterval);
    clearTimeout(this.clickerTimeout);
    this.saveScore('clicker', this.currentScore);
  }
}
