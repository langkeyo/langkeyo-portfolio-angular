import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'mcp-demo',
    loadComponent: () => import('./components/mcp-demo/mcp-demo.component').then(m => m.McpDemoComponent)
  }
];
