import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  skills = [
    'UI/UX 设计',
    '品牌设计',
    '前端开发',
    'Angular',
    'React',
    'Vue.js',
    'TypeScript',
    'Tailwind CSS',
    '动效设计',
    '用户研究',
    '原型设计',
    'Figma',
    'Adobe Creative Suite'
  ];
}
