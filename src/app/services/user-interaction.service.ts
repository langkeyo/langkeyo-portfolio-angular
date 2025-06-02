import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInteractionService {
  private userHasInteracted = new BehaviorSubject<boolean>(false);
  private interactionListeners: (() => void)[] = [];

  constructor() {
    this.setupInteractionListeners();
  }

  /**
   * 获取用户是否已经交互的状态
   */
  get hasUserInteracted$(): Observable<boolean> {
    return this.userHasInteracted.asObservable();
  }

  /**
   * 获取当前用户交互状态
   */
  get hasUserInteracted(): boolean {
    return this.userHasInteracted.value;
  }

  /**
   * 等待用户首次交互
   */
  waitForUserInteraction(): Promise<void> {
    return new Promise((resolve) => {
      if (this.hasUserInteracted) {
        resolve();
        return;
      }

      const unsubscribe = this.userHasInteracted.subscribe((hasInteracted) => {
        if (hasInteracted) {
          unsubscribe.unsubscribe();
          resolve();
        }
      });
    });
  }

  /**
   * 添加交互后的回调
   */
  onUserInteraction(callback: () => void): void {
    if (this.hasUserInteracted) {
      callback();
      return;
    }

    this.interactionListeners.push(callback);
  }

  /**
   * 设置用户已交互状态
   */
  private setUserInteracted(): void {
    if (!this.userHasInteracted.value) {
      this.userHasInteracted.next(true);
      
      // 执行所有等待的回调
      this.interactionListeners.forEach(callback => callback());
      this.interactionListeners = [];
      
      console.log('🎯 User interaction detected - APIs can now be called');
    }
  }

  /**
   * 设置交互监听器
   */
  private setupInteractionListeners(): void {
    const events = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.setUserInteracted();
      }, { once: true, passive: true });
    });

    // 也监听窗口焦点事件
    window.addEventListener('focus', () => {
      this.setUserInteracted();
    }, { once: true });

    // 延迟备用方案 - 如果5秒后用户还没有交互，自动激活
    setTimeout(() => {
      if (!this.hasUserInteracted) {
        console.log('🕐 Auto-activating APIs after 5 seconds');
        this.setUserInteracted();
      }
    }, 5000);
  }
}
