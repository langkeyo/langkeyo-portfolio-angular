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
  private readonly adviceApiUrl = 'https://api.adviceslip.com/advice';

  // 精选名言库（设计、励志、智慧）
  private readonly fallbackQuotes: Quote[] = [
    // 设计相关名言
    {
      _id: 'design-1',
      content: '设计不仅仅是外观和感觉，设计是它如何工作的。',
      author: 'Steve Jobs',
      tags: ['design', 'innovation'],
      authorSlug: 'steve-jobs',
      length: 25
    },
    {
      _id: 'design-2',
      content: '简约是复杂的终极形式。',
      author: 'Leonardo da Vinci',
      tags: ['design', 'simplicity'],
      authorSlug: 'leonardo-da-vinci',
      length: 12
    },
    {
      _id: 'design-3',
      content: '好的设计是显而易见的，伟大的设计是透明的。',
      author: 'Joe Sparano',
      tags: ['design', 'excellence'],
      authorSlug: 'joe-sparano',
      length: 22
    },
    {
      _id: 'design-4',
      content: '设计是一种思维方式，而不仅仅是一种外观。',
      author: 'Jon Ive',
      tags: ['design', 'thinking'],
      authorSlug: 'jon-ive',
      length: 21
    },
    {
      _id: 'design-5',
      content: '设计的目标是让复杂变得简单。',
      author: 'John Maeda',
      tags: ['design', 'simplicity'],
      authorSlug: 'john-maeda',
      length: 16
    },
    {
      _id: 'design-6',
      content: '细节不是细节，它们构成了设计。',
      author: 'Charles Eames',
      tags: ['design', 'details'],
      authorSlug: 'charles-eames',
      length: 17
    },
    {
      _id: 'design-7',
      content: '设计就是解决问题的艺术。',
      author: 'Jeffrey Veen',
      tags: ['design', 'problem-solving'],
      authorSlug: 'jeffrey-veen',
      length: 14
    },
    {
      _id: 'design-8',
      content: '用户体验设计的核心是同理心。',
      author: 'Whitney Hess',
      tags: ['design', 'ux', 'empathy'],
      authorSlug: 'whitney-hess',
      length: 16
    },
    // 创新与创意名言
    {
      _id: 'innovation-1',
      content: '创新就是把各种事物联系起来。',
      author: 'Steve Jobs',
      tags: ['innovation', 'creativity'],
      authorSlug: 'steve-jobs',
      length: 16
    },
    {
      _id: 'innovation-2',
      content: '创造力就是智力在玩耍。',
      author: 'Albert Einstein',
      tags: ['creativity', 'intelligence'],
      authorSlug: 'albert-einstein',
      length: 12
    },
    {
      _id: 'innovation-3',
      content: '想象力比知识更重要。',
      author: 'Albert Einstein',
      tags: ['imagination', 'knowledge'],
      authorSlug: 'albert-einstein',
      length: 11
    },
    {
      _id: 'innovation-4',
      content: '不要害怕完美，你永远达不到它。',
      author: 'Salvador Dalí',
      tags: ['perfection', 'creativity'],
      authorSlug: 'salvador-dali',
      length: 17
    },
    // 励志名言
    {
      _id: 'motivation-1',
      content: '成功不是终点，失败不是致命的，继续前进的勇气才是最重要的。',
      author: 'Winston Churchill',
      tags: ['motivation', 'success', 'courage'],
      authorSlug: 'winston-churchill',
      length: 32
    },
    {
      _id: 'motivation-2',
      content: '你今天的努力，是幸运的伏笔。',
      author: '佚名',
      tags: ['motivation', 'effort'],
      authorSlug: 'anonymous',
      length: 14
    },
    {
      _id: 'motivation-3',
      content: '唯一不可能的旅程，是你从未开始的那一个。',
      author: 'Tony Robbins',
      tags: ['motivation', 'journey'],
      authorSlug: 'tony-robbins',
      length: 22
    },
    {
      _id: 'motivation-4',
      content: '梦想不会逃跑，会逃跑的永远都是自己。',
      author: '矢野浩二',
      tags: ['motivation', 'dreams'],
      authorSlug: 'yano-koji',
      length: 19
    },
    // 智慧名言
    {
      _id: 'wisdom-1',
      content: '知识就是力量。',
      author: 'Francis Bacon',
      tags: ['wisdom', 'knowledge'],
      authorSlug: 'francis-bacon',
      length: 7
    },
    {
      _id: 'wisdom-2',
      content: '学而时习之，不亦说乎。',
      author: '孔子',
      tags: ['wisdom', 'learning'],
      authorSlug: 'confucius',
      length: 12
    },
    {
      _id: 'wisdom-3',
      content: '路漫漫其修远兮，吾将上下而求索。',
      author: '屈原',
      tags: ['wisdom', 'perseverance'],
      authorSlug: 'qu-yuan',
      length: 18
    },
    {
      _id: 'wisdom-4',
      content: '生活不是等待暴风雨过去，而是学会在雨中起舞。',
      author: 'Vivian Greene',
      tags: ['wisdom', 'life'],
      authorSlug: 'vivian-greene',
      length: 25
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * 获取随机名言 (优先使用在线API，失败时使用本地库)
   */
  getRandomQuote(): Observable<Quote> {
    // 随机决定是否尝试在线API（30%概率）
    if (Math.random() < 0.3) {
      return this.getOnlineAdvice().pipe(
        catchError(error => {
          console.warn('Online advice failed, using local quote:', error);
          return this.getLocalQuote();
        })
      );
    }

    return this.getLocalQuote();
  }

  /**
   * 获取在线建议 (使用Advice Slip API)
   */
  private getOnlineAdvice(): Observable<Quote> {
    return this.http.get<{slip: {id: number, advice: string}}>(`${this.adviceApiUrl}`)
      .pipe(
        map(response => ({
          _id: `advice-${response.slip.id}`,
          content: response.slip.advice,
          author: 'Advice Slip',
          tags: ['advice', 'wisdom'],
          authorSlug: 'advice-slip',
          length: response.slip.advice.length
        })),
        catchError(error => {
          console.warn('Failed to fetch online advice:', error);
          throw error;
        })
      );
  }

  /**
   * 获取本地名言
   */
  private getLocalQuote(): Observable<Quote> {
    const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
    const quote = this.fallbackQuotes[randomIndex];
    console.log('Using local quote:', quote);
    return of(quote);
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
