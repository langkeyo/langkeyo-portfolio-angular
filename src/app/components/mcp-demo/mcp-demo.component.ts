import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../services/mcp.service';

interface McpTool {
  name: string;
  description: string;
  parameters: any;
}

interface McpExecution {
  toolName: string;
  parameters: any;
  result: any;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

@Component({
  selector: 'app-mcp-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mcp-demo-container">
      <!-- 标题区域 -->
      <div class="header-section">
        <h2 class="title">🔧 MCP (Model Context Protocol) 演示</h2>
        <p class="subtitle">体验标准化的AI工具集成协议</p>
      </div>

      <!-- 工具列表 -->
      <div class="tools-section">
        <h3 class="section-title">📋 可用工具</h3>
        <div class="tools-grid">
          <div 
            *ngFor="let tool of availableTools" 
            class="tool-card"
            [class.selected]="selectedTool?.name === tool.name"
            (click)="selectTool(tool)"
          >
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-description">{{ tool.description }}</div>
          </div>
        </div>
      </div>

      <!-- 工具执行区域 -->
      <div class="execution-section" *ngIf="selectedTool">
        <h3 class="section-title">⚡ 执行工具: {{ selectedTool.name }}</h3>
        
        <div class="parameters-form">
          <div *ngFor="let param of getRequiredParameters()" class="parameter-input">
            <label [for]="param">{{ param }}:</label>
            <input 
              [id]="param"
              type="text" 
              [(ngModel)]="toolParameters[param]"
              [placeholder]="getParameterPlaceholder(param)"
              class="input-field"
            >
          </div>
          
          <button 
            (click)="executeTool()" 
            [disabled]="isExecuting"
            class="execute-button"
          >
            {{ isExecuting ? '执行中...' : '🚀 执行工具' }}
          </button>
        </div>
      </div>

      <!-- 执行历史 -->
      <div class="history-section" *ngIf="executionHistory.length > 0">
        <h3 class="section-title">📊 执行历史</h3>
        <div class="history-list">
          <div 
            *ngFor="let execution of executionHistory; trackBy: trackByTimestamp" 
            class="history-item"
            [class]="'status-' + execution.status"
          >
            <div class="execution-header">
              <span class="tool-name">{{ execution.toolName }}</span>
              <span class="timestamp">{{ execution.timestamp }}</span>
              <span class="status-badge" [class]="'status-' + execution.status">
                {{ execution.status }}
              </span>
            </div>
            
            <div class="execution-details">
              <div class="parameters">
                <strong>参数:</strong>
                <pre>{{ formatJson(execution.parameters) }}</pre>
              </div>
              
              <div class="result" *ngIf="execution.result">
                <strong>结果:</strong>
                <pre>{{ formatJson(execution.result) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MCP 信息面板 -->
      <div class="info-section">
        <h3 class="section-title">ℹ️ 关于 MCP</h3>
        <div class="info-content">
          <p><strong>Model Context Protocol (MCP)</strong> 是一个标准化的协议，用于AI模型与外部工具和数据源的集成。</p>
          
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon">🔌</span>
              <span class="feature-text">标准化接口 - 统一的工具集成方式</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🛠️</span>
              <span class="feature-text">丰富工具集 - 文件系统、数据库、API等</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🚀</span>
              <span class="feature-text">高效开发 - 减少重复代码，提高开发效率</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔄</span>
              <span class="feature-text">实时交互 - 支持动态工具发现和执行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mcp-demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Inter', sans-serif;
    }

    .header-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tools-section {
      margin-bottom: 3rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .tool-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .tool-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }

    .tool-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
    }

    .tool-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .tool-description {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .execution-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .parameters-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .parameter-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .parameter-input label {
      font-weight: 500;
      color: #374151;
    }

    .input-field {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .input-field:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .execute-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      align-self: flex-start;
    }

    .execute-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .execute-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .history-section {
      margin-bottom: 3rem;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #e5e7eb;
    }

    .history-item.status-success {
      border-left-color: #10b981;
    }

    .history-item.status-error {
      border-left-color: #ef4444;
    }

    .history-item.status-pending {
      border-left-color: #f59e0b;
    }

    .execution-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-success {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.status-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .execution-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .execution-details pre {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      overflow-x: auto;
      margin: 0.5rem 0 0 0;
    }

    .info-section {
      background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
      border-radius: 12px;
      padding: 2rem;
    }

    .info-content p {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .feature-text {
      color: #374151;
      font-weight: 500;
    }

    .timestamp {
      font-size: 0.8rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .mcp-demo-container {
        padding: 1rem;
      }
      
      .tools-grid {
        grid-template-columns: 1fr;
      }
      
      .features-list {
        grid-template-columns: 1fr;
      }
      
      .execution-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class McpDemoComponent implements OnInit {
  availableTools: McpTool[] = [];
  selectedTool: McpTool | null = null;
  toolParameters: { [key: string]: any } = {};
  executionHistory: McpExecution[] = [];
  isExecuting = false;

  constructor(private mcpService: McpService) {}

  async ngOnInit() {
    // 等待MCP服务初始化
    setTimeout(() => {
      this.loadAvailableTools();
    }, 1000);
  }

  loadAvailableTools() {
    this.availableTools = this.mcpService.getAvailableTools();
    console.log('🔧 加载的MCP工具:', this.availableTools);
  }

  selectTool(tool: McpTool) {
    this.selectedTool = tool;
    this.toolParameters = {};
    
    // 为必需参数设置默认值
    const required = tool.parameters?.required || [];
    required.forEach((param: string) => {
      this.toolParameters[param] = '';
    });
  }

  getRequiredParameters(): string[] {
    return this.selectedTool?.parameters?.required || [];
  }

  getParameterPlaceholder(param: string): string {
    const placeholders: { [key: string]: string } = {
      'path': '例如: /src/app/app.component.ts',
      'content': '文件内容...',
      'owner': '例如: langkeyo',
      'repo': '例如: PersonalDesign',
      'url': '例如: https://example.com',
      'selector': '例如: .main-content',
      'width': '例如: 1920',
      'height': '例如: 1080'
    };
    
    return placeholders[param] || `请输入 ${param}`;
  }

  async executeTool() {
    if (!this.selectedTool) return;

    this.isExecuting = true;
    
    const execution: McpExecution = {
      toolName: this.selectedTool.name,
      parameters: { ...this.toolParameters },
      result: null,
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      status: 'pending'
    };

    this.executionHistory.unshift(execution);

    try {
      const result = await this.mcpService.executeTool(
        this.selectedTool.name, 
        this.toolParameters
      );
      
      execution.result = result;
      execution.status = 'success';
      console.log('✅ MCP工具执行成功:', result);
    } catch (error) {
      execution.result = { error: error };
      execution.status = 'error';
      console.error('❌ MCP工具执行失败:', error);
    } finally {
      this.isExecuting = false;
    }
  }

  trackByTimestamp(index: number, item: McpExecution): string {
    return item.timestamp;
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}
