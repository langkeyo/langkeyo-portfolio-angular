import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesService, Quote } from '../../services/quotes.service';

@Component({
  selector: 'app-daily-quote',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-quote.component.html',
  styleUrls: ['./daily-quote.component.scss']
})
export class DailyQuoteComponent implements OnInit {
  quote: Quote | null = null;
  loading = true;
  error = false;
  isVisible = false;

  constructor(private quotesService: QuotesService) {}

  ngOnInit() {
    this.loadDailyQuote();
    // 延迟显示动画
    setTimeout(() => {
      this.isVisible = true;
    }, 500);
  }

  loadDailyQuote() {
    this.loading = true;
    this.error = false;

    this.quotesService.getDailyQuote().subscribe({
      next: (quote) => {
        this.quote = quote;
        this.loading = false;
        console.log('Daily quote loaded:', quote);
      },
      error: (error) => {
        console.error('Failed to load daily quote:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  /**
   * 获取新的名言
   */
  getNewQuote() {
    this.isVisible = false;
    setTimeout(() => {
      this.loadDailyQuote();
      setTimeout(() => {
        this.isVisible = true;
      }, 300);
    }, 300);
  }

  /**
   * 分享名言到社交媒体
   */
  shareQuote(platform: 'twitter' | 'facebook' | 'linkedin') {
    if (!this.quote) return;

    const text = `"${this.quote.content}" - ${this.quote.author}`;
    const url = window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  /**
   * 复制名言到剪贴板
   */
  async copyQuote() {
    if (!this.quote) return;

    const text = `"${this.quote.content}" - ${this.quote.author}`;
    
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加一个提示消息
      console.log('Quote copied to clipboard');
    } catch (error) {
      console.error('Failed to copy quote:', error);
      // 降级方案
      this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * 降级复制方案
   */
  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Quote copied to clipboard (fallback)');
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * 获取名言长度类别（用于样式调整）
   */
  getQuoteLength(): 'short' | 'medium' | 'long' {
    if (!this.quote) return 'medium';
    
    const length = this.quote.content.length;
    if (length < 50) return 'short';
    if (length < 120) return 'medium';
    return 'long';
  }

  /**
   * 检查是否为设计相关名言
   */
  isDesignQuote(): boolean {
    if (!this.quote) return false;
    return this.quote.tags.some(tag => 
      ['design', 'art', 'creativity', 'innovation'].includes(tag.toLowerCase())
    );
  }
}
