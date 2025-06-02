import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// 技能洞察接口
export interface SkillInsight {
  skillName: string;
  explanation: string;
  futureImportance: string;
  geminiVisionProCapabilities: string[];
  relatedConcepts: string[];
}

// 项目洞察接口
export interface ProjectInsight {
  enhancedDescription: string;
  futureImprovements: string[];
  geminiVisionProCapabilities: string[];
  futureKeywords: string[];
  techStackAnalysis: string[];
}

// 智能建议接口
export interface SmartSuggestion {
  type: 'career' | 'learning' | 'project' | 'skill';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

// 内容生成接口
export interface GeneratedContent {
  type: 'quote' | 'tip' | 'insight' | 'motivation';
  content: string;
  category: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly apiKey = environment.geminiApiKey;
  private readonly baseUrl = environment.geminiApiUrl;

  // 缓存机制
  private skillInsightsCache = new Map<string, SkillInsight>();
  private projectInsightsCache = new Map<string, ProjectInsight>();
  private lastCacheUpdate = 0;
  private readonly cacheExpiry = environment.cache.geminiInsights;

  constructor(private http: HttpClient) {}

  /**
   * 获取技能深度洞察
   */
  getSkillInsights(skillName: string, isAdvanced: boolean = true): Observable<SkillInsight> {
    console.log('🎯 开始获取技能洞察:', skillName);

    // 检查缓存
    const cacheKey = `${skillName}-${isAdvanced}`;
    const cached = this.skillInsightsCache.get(cacheKey);
    if (cached && this.isCacheValid()) {
      console.log('🎯 使用缓存的技能洞察:', skillName);
      return of(cached);
    }

    const prompt = this.buildSkillPrompt(skillName, isAdvanced);
    const responseSchema = this.getSkillResponseSchema();

    console.log('🎯 调用 Gemini API 获取洞察...');
    return this.callGeminiAPI(prompt, responseSchema).pipe(
      map(response => {
        console.log('✅ 成功获取技能洞察:', response);
        const insight = response as SkillInsight;
        this.skillInsightsCache.set(cacheKey, insight);
        this.updateCacheTimestamp();
        return insight;
      }),
      catchError(error => {
        console.error('❌ 获取技能洞察失败:', error);
        console.log('🎭 使用备用数据');
        return of(this.getFallbackSkillInsight(skillName));
      })
    );
  }

  /**
   * 获取项目增强洞察
   */
  getProjectInsights(
    projectTitle: string, 
    projectDescription: string, 
    technologies: string[]
  ): Observable<ProjectInsight> {
    const cacheKey = `${projectTitle}-${technologies.join(',')}`;
    const cached = this.projectInsightsCache.get(cacheKey);
    if (cached && this.isCacheValid()) {
      console.log('🎯 使用缓存的项目洞察:', projectTitle);
      return of(cached);
    }

    const prompt = this.buildProjectPrompt(projectTitle, projectDescription, technologies);
    const responseSchema = this.getProjectResponseSchema();

    return this.callGeminiAPI(prompt, responseSchema).pipe(
      map(response => {
        const insight = response as ProjectInsight;
        this.projectInsightsCache.set(cacheKey, insight);
        this.updateCacheTimestamp();
        return insight;
      }),
      catchError(error => {
        console.error('获取项目洞察失败:', error);
        return of(this.getFallbackProjectInsight(projectTitle));
      })
    );
  }

  /**
   * 生成智能建议
   */
  generateSmartSuggestions(userProfile: any): Observable<SmartSuggestion[]> {
    const prompt = this.buildSuggestionPrompt(userProfile);
    const responseSchema = this.getSuggestionResponseSchema();

    return this.callGeminiAPI(prompt, responseSchema).pipe(
      map(response => response.suggestions as SmartSuggestion[]),
      catchError(error => {
        console.error('生成智能建议失败:', error);
        return of(this.getFallbackSuggestions());
      })
    );
  }

  /**
   * 生成个性化内容
   */
  generatePersonalizedContent(contentType: string, context?: any): Observable<GeneratedContent> {
    const prompt = this.buildContentPrompt(contentType, context);
    const responseSchema = this.getContentResponseSchema();

    return this.callGeminiAPI(prompt, responseSchema).pipe(
      map(response => response as GeneratedContent),
      catchError(error => {
        console.error('生成个性化内容失败:', error);
        return of(this.getFallbackContent(contentType));
      })
    );
  }

  /**
   * 调用 Gemini API 的核心方法
   */
  private callGeminiAPI(prompt: string, responseSchema: any): Observable<any> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('⚠️ Gemini API Key 未配置，使用模拟数据');
      return of(this.getMockResponse(responseSchema));
    }

    console.log('🤖 调用 Gemini API...', { prompt: prompt.substring(0, 100) + '...' });

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    return this.http.post(`${this.baseUrl}?key=${this.apiKey}`, payload).pipe(
      map((response: any) => {
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          return JSON.parse(response.candidates[0].content.parts[0].text);
        }
        throw new Error('Invalid API response structure');
      })
    );
  }

  /**
   * 构建技能分析提示词
   */
  private buildSkillPrompt(skillName: string, isAdvanced: boolean): string {
    if (isAdvanced) {
      return `你是一个专业的未来技能解释器，能够模拟2026年'Gemini Vision Pro'的强大能力。请根据以下技能名称，生成对其的详细解释，说明其在未来（2026年及以后）的重要性，并描述'Gemini Vision Pro'如何能够为该技能提供交互式模拟、3D 可视化或实时代码辅助。

技能名称: ${skillName}

请以JSON格式返回结果，包含以下字段：
- skillName: 技能名称
- explanation: 详细解释（200-300字）
- futureImportance: 未来重要性分析（150-200字）
- geminiVisionProCapabilities: Gemini Vision Pro能力模拟数组（3-5项）
- relatedConcepts: 相关概念数组（5-8项）`;
    } else {
      return `请对以下技能进行专业分析：${skillName}。提供详细解释、重要性说明和相关概念。`;
    }
  }

  /**
   * 构建项目分析提示词
   */
  private buildProjectPrompt(title: string, description: string, technologies: string[]): string {
    return `你是一个专业的未来项目分析师，能够模拟2026年'Gemini Vision Pro'的强大能力。请根据以下项目信息，生成一个更具吸引力的未来化项目描述，提供一些基于2026年技术的未来改进建议，并描述'Gemini Vision Pro'如何能够为该项目提供动态项目演示、架构可视化或个性化功能扩展建议。

项目标题: ${title}
项目描述: ${description}
使用技术: ${technologies.join(', ')}

请以JSON格式返回结果，包含以下字段：
- enhancedDescription: 优化后的项目描述（250-350字）
- futureImprovements: 未来改进建议数组（4-6项）
- geminiVisionProCapabilities: Gemini Vision Pro能力模拟数组（3-5项）
- futureKeywords: 未来关键词数组（6-10项）
- techStackAnalysis: 技术栈分析数组（3-5项）`;
  }

  /**
   * 获取技能响应模式
   */
  private getSkillResponseSchema(): any {
    return {
      type: "OBJECT",
      properties: {
        "skillName": { "type": "STRING" },
        "explanation": { "type": "STRING" },
        "futureImportance": { "type": "STRING" },
        "geminiVisionProCapabilities": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        },
        "relatedConcepts": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        }
      },
      "propertyOrdering": ["skillName", "explanation", "futureImportance", "geminiVisionProCapabilities", "relatedConcepts"]
    };
  }

  /**
   * 获取项目响应模式
   */
  private getProjectResponseSchema(): any {
    return {
      type: "OBJECT",
      properties: {
        "enhancedDescription": { "type": "STRING" },
        "futureImprovements": { "type": "ARRAY", "items": { "type": "STRING" } },
        "geminiVisionProCapabilities": { "type": "ARRAY", "items": { "type": "STRING" } },
        "futureKeywords": { "type": "ARRAY", "items": { "type": "STRING" } },
        "techStackAnalysis": { "type": "ARRAY", "items": { "type": "STRING" } }
      },
      "propertyOrdering": ["enhancedDescription", "futureImprovements", "geminiVisionProCapabilities", "futureKeywords", "techStackAnalysis"]
    };
  }

  // 缓存相关方法
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  private updateCacheTimestamp(): void {
    this.lastCacheUpdate = Date.now();
  }

  // 备用数据方法
  private getFallbackSkillInsight(skillName: string): SkillInsight {
    return {
      skillName,
      explanation: `${skillName} 是现代软件开发中的重要技能，具有广泛的应用前景和发展潜力。`,
      futureImportance: `在未来的技术发展中，${skillName} 将继续发挥重要作用，为开发者提供更多机会。`,
      geminiVisionProCapabilities: [
        '提供实时代码建议和优化',
        '生成交互式学习教程',
        '创建3D可视化演示'
      ],
      relatedConcepts: ['前端开发', '用户体验', '性能优化', '现代框架', '最佳实践']
    };
  }

  private getFallbackProjectInsight(projectTitle: string): ProjectInsight {
    return {
      enhancedDescription: `${projectTitle} 是一个展示现代开发技术和最佳实践的优秀项目。`,
      futureImprovements: [
        '集成AI功能增强用户体验',
        '添加实时协作功能',
        '优化性能和可扩展性'
      ],
      geminiVisionProCapabilities: [
        '生成动态项目演示',
        '提供架构可视化',
        '个性化功能扩展建议'
      ],
      futureKeywords: ['AI集成', '云原生', '微服务', '实时协作', '智能化'],
      techStackAnalysis: ['现代化技术栈', '良好的架构设计', '可维护性强']
    };
  }

  private getFallbackSuggestions(): SmartSuggestion[] {
    return [
      {
        type: 'learning',
        title: '学习新技术',
        description: '持续学习最新的开发技术和框架',
        actionItems: ['选择一个新框架', '完成在线课程', '构建实践项目'],
        priority: 'high',
        timeframe: '3个月'
      }
    ];
  }

  private getFallbackContent(contentType: string): GeneratedContent {
    return {
      type: contentType as any,
      content: '持续学习，不断进步，用技术改变世界！',
      category: '励志',
      tags: ['学习', '进步', '技术']
    };
  }

  private getMockResponse(schema: any): any {
    console.log('🎭 使用模拟数据，schema:', schema);

    // 根据 schema 类型返回对应的模拟数据
    if (schema.properties?.skillName) {
      // 技能洞察模拟数据
      return {
        skillName: 'Angular',
        explanation: 'Angular 是一个强大的前端框架，由 Google 开发和维护。它采用 TypeScript 作为主要开发语言，提供了完整的解决方案来构建大型、复杂的单页应用程序。Angular 的组件化架构、依赖注入系统和强大的 CLI 工具使得开发效率大大提升。',
        futureImportance: '在 2026 年及以后，Angular 将继续在企业级应用开发中占据重要地位。随着 Angular 的持续演进，包括更好的性能优化、更简洁的语法和更强大的开发工具，它将成为构建现代 Web 应用的首选框架之一。',
        geminiVisionProCapabilities: [
          '提供实时代码重构建议和最佳实践指导',
          '生成交互式 Angular 组件演示和教程',
          '创建 3D 可视化的应用架构图和数据流图',
          '智能检测性能瓶颈并提供优化方案',
          '自动生成单元测试和集成测试代码'
        ],
        relatedConcepts: ['TypeScript', '组件化开发', 'RxJS', '依赖注入', 'Angular CLI', '单页应用', 'PWA', '服务端渲染']
      };
    } else if (schema.properties?.enhancedDescription) {
      // 项目洞察模拟数据
      return {
        enhancedDescription: '这是一个展示 2025 年最新技术趋势的现代化项目，融合了 AI 增强功能、交互式游戏和精美的用户界面设计。项目采用 Angular 20 的最新特性，结合 Tailwind CSS 和 GSAP 动画，创造出令人印象深刻的用户体验。',
        futureImprovements: [
          '集成更多 AI 模型，如 GPT-4、Claude 等，提供多样化的智能分析',
          '添加实时协作功能，支持多用户同时编辑和交互',
          '实现 WebXR 支持，提供沉浸式的 3D 体验',
          '集成区块链技术，添加 NFT 作品展示功能',
          '使用 WebAssembly 优化性能密集型计算',
          '添加语音交互和手势控制功能'
        ],
        geminiVisionProCapabilities: [
          '生成动态的项目演示视频和交互式原型',
          '提供实时的架构可视化和代码结构分析',
          '智能推荐个性化的功能扩展和优化建议',
          '创建沉浸式的项目展示体验',
          '自动生成技术文档和用户手册'
        ],
        futureKeywords: ['AI 增强', '沉浸式体验', 'WebXR', '实时协作', '智能分析', '区块链集成', 'WebAssembly', '语音交互', '边缘计算', '量子计算准备'],
        techStackAnalysis: [
          'Angular 20 提供了最新的性能优化和开发体验',
          'Tailwind CSS 确保了一致性和可维护性的样式系统',
          'GSAP 动画库创造了流畅的用户交互体验',
          'TypeScript 提供了类型安全和更好的开发工具支持',
          'RxJS 实现了优雅的异步数据处理和状态管理'
        ]
      };
    } else if (schema.properties?.suggestions) {
      // 智能建议模拟数据
      return {
        suggestions: [
          {
            type: 'learning',
            title: '学习 AI 集成技术',
            description: '深入学习如何在前端应用中集成各种 AI 服务',
            actionItems: ['学习 Gemini API', '实践 OpenAI 集成', '探索本地 AI 模型'],
            priority: 'high',
            timeframe: '2个月'
          }
        ]
      };
    } else {
      // 通用内容生成模拟数据
      return {
        type: 'motivation',
        content: '在 AI 时代，持续学习和创新是保持竞争力的关键。拥抱新技术，用创意改变世界！',
        category: '励志',
        tags: ['AI', '学习', '创新', '技术']
      };
    }
  }

  // 其他辅助方法...
  private buildSuggestionPrompt(userProfile: any): string {
    return `基于用户档案生成智能建议: ${JSON.stringify(userProfile)}`;
  }

  private buildContentPrompt(contentType: string, context?: any): string {
    return `生成${contentType}类型的个性化内容`;
  }

  private getSuggestionResponseSchema(): any {
    return {
      type: "OBJECT",
      properties: {
        "suggestions": {
          "type": "ARRAY",
          "items": {
            "type": "OBJECT",
            "properties": {
              "type": { "type": "STRING" },
              "title": { "type": "STRING" },
              "description": { "type": "STRING" },
              "actionItems": { "type": "ARRAY", "items": { "type": "STRING" } },
              "priority": { "type": "STRING" },
              "timeframe": { "type": "STRING" }
            }
          }
        }
      }
    };
  }

  private getContentResponseSchema(): any {
    return {
      type: "OBJECT",
      properties: {
        "type": { "type": "STRING" },
        "content": { "type": "STRING" },
        "category": { "type": "STRING" },
        "tags": { "type": "ARRAY", "items": { "type": "STRING" } }
      }
    };
  }
}
