import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Quote {
  _id?: string;
  content: string;
  author: string;
  tags?: string[];
  authorSlug?: string;
  length?: number;
}

// ZenQuotes API 响应格式
export interface ZenQuote {
  q: string; // quote text
  a: string; // author
  h: string; // HTML formatted quote
}

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private readonly zenQuotesUrl = 'https://zenquotes.io/api';
  private readonly quotableUrl = 'https://api.quotable.io'; // 备用API

  // 设计相关的备用名言（当API失败时使用）
  private readonly fallbackQuotes: Quote[] = [
    {
      _id: 'fallback-1',
      content: '设计不仅仅是外观和感觉，设计是它如何工作的。',
      author: 'Steve Jobs',
      tags: ['design', 'innovation'],
      authorSlug: 'steve-jobs',
      length: 25
    },
    {
      _id: 'fallback-2',
      content: '简约是复杂的终极形式。',
      author: 'Leonardo da Vinci',
      tags: ['design', 'simplicity'],
      authorSlug: 'leonardo-da-vinci',
      length: 12
    },
    {
      _id: 'fallback-3',
      content: '好的设计是显而易见的，伟大的设计是透明的。',
      author: 'Joe Sparano',
      tags: ['design', 'excellence'],
      authorSlug: 'joe-sparano',
      length: 22
    },
    {
      _id: 'fallback-4',
      content: '设计是一种思维方式，而不仅仅是一种外观。',
      author: 'Jon Ive',
      tags: ['design', 'thinking'],
      authorSlug: 'jon-ive',
      length: 21
    },
    {
      _id: 'fallback-5',
      content: '创新就是把各种事物联系起来。',
      author: 'Steve Jobs',
      tags: ['innovation', 'creativity'],
      authorSlug: 'steve-jobs',
      length: 16
    },
    {
      _id: 'fallback-6',
      content: '设计的目标是让复杂变得简单。',
      author: 'John Maeda',
      tags: ['design', 'simplicity'],
      authorSlug: 'john-maeda',
      length: 16
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * 获取随机名言 (使用ZenQuotes API)
   */
  getRandomQuote(): Observable<Quote> {
    return this.http.get<ZenQuote[]>(`${this.zenQuotesUrl}/random`)
      .pipe(
        map(response => this.convertZenQuoteToQuote(response[0])),
        catchError(error => {
          console.warn('Failed to fetch quote from ZenQuotes API, trying fallback:', error);
          return this.getQuotableQuote();
        })
      );
  }

  /**
   * 备用方法：使用Quotable API
   */
  private getQuotableQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.quotableUrl}/random`)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch quote from Quotable API, using fallback:', error);
          return this.getFallbackQuote();
        })
      );
  }

  /**
   * 转换ZenQuote格式到Quote格式
   */
  private convertZenQuoteToQuote(zenQuote: ZenQuote): Quote {
    return {
      _id: `zen-${Date.now()}`,
      content: zenQuote.q,
      author: zenQuote.a,
      tags: ['inspirational'], // ZenQuotes没有标签，默认设为inspirational
      authorSlug: zenQuote.a.toLowerCase().replace(/\s+/g, '-'),
      length: zenQuote.q.length
    };
  }

  /**
   * 获取设计相关的名言 (从备用名言中选择设计相关的)
   */
  getDesignQuote(): Observable<Quote> {
    const designQuotes = this.fallbackQuotes.filter(quote =>
      quote.tags?.some(tag => ['design', 'creativity', 'innovation'].includes(tag))
    );
    const randomQuote = designQuotes[Math.floor(Math.random() * designQuotes.length)];
    return of(randomQuote);
  }

  /**
   * 获取励志名言 (使用ZenQuotes API)
   */
  getInspirationalQuote(): Observable<Quote> {
    return this.getRandomQuote(); // ZenQuotes主要提供励志名言
  }

  /**
   * 获取智慧名言 (使用ZenQuotes API)
   */
  getWisdomQuote(): Observable<Quote> {
    return this.getRandomQuote(); // ZenQuotes包含智慧名言
  }

  /**
   * 获取每日名言（混合不同类型）
   */
  getDailyQuote(): Observable<Quote> {
    const quoteTypes = [
      () => this.getRandomQuote(),
      () => this.getDesignQuote(),
      () => this.getInspirationalQuote(),
      () => this.getWisdomQuote()
    ];

    // 根据日期选择名言类型，确保同一天返回相同类型
    const today = new Date().getDate();
    const selectedType = quoteTypes[today % quoteTypes.length];
    
    return selectedType();
  }

  /**
   * 获取备用名言
   */
  private getFallbackQuote(): Observable<Quote> {
    const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
    return of(this.fallbackQuotes[randomIndex]);
  }

  /**
   * 根据作者获取名言 (从备用名言中搜索)
   */
  getQuoteByAuthor(author: string): Observable<Quote[]> {
    const authorQuotes = this.fallbackQuotes.filter(quote =>
      quote.author.toLowerCase().includes(author.toLowerCase())
    );
    return of(authorQuotes);
  }

  /**
   * 搜索名言 (从备用名言中搜索)
   */
  searchQuotes(query: string): Observable<Quote[]> {
    const searchResults = this.fallbackQuotes.filter(quote =>
      quote.content.toLowerCase().includes(query.toLowerCase()) ||
      quote.author.toLowerCase().includes(query.toLowerCase())
    );
    return of(searchResults);
  }
}
