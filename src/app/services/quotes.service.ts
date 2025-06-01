import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private readonly baseUrl = 'https://api.quotable.io';
  
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
   * 获取随机名言
   */
  getRandomQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/random?tags=inspirational|motivational|success|wisdom`)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch quote from API, using fallback:', error);
          return this.getFallbackQuote();
        })
      );
  }

  /**
   * 获取设计相关的名言
   */
  getDesignQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/random?tags=design|art|creativity`)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch design quote from API, using fallback:', error);
          return this.getFallbackQuote();
        })
      );
  }

  /**
   * 获取励志名言
   */
  getInspirationalQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/random?tags=inspirational|motivational|success`)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch inspirational quote from API, using fallback:', error);
          return this.getFallbackQuote();
        })
      );
  }

  /**
   * 获取智慧名言
   */
  getWisdomQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/random?tags=wisdom|philosophy|life`)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch wisdom quote from API, using fallback:', error);
          return this.getFallbackQuote();
        })
      );
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
   * 根据作者获取名言
   */
  getQuoteByAuthor(author: string): Observable<Quote[]> {
    return this.http.get<{results: Quote[]}>(`${this.baseUrl}/quotes?author=${author}&limit=5`)
      .pipe(
        map(response => response.results),
        catchError(error => {
          console.error('Failed to fetch quotes by author:', error);
          return of([]);
        })
      );
  }

  /**
   * 搜索名言
   */
  searchQuotes(query: string): Observable<Quote[]> {
    return this.http.get<{results: Quote[]}>(`${this.baseUrl}/search/quotes?query=${encodeURIComponent(query)}&limit=10`)
      .pipe(
        map(response => response.results),
        catchError(error => {
          console.error('Failed to search quotes:', error);
          return of([]);
        })
      );
  }
}
