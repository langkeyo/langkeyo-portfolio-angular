import { Component, OnInit, OnDestroy, signal, inject, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero implements OnInit, OnDestroy {
  @ViewChild('heroContent', { static: true }) heroContent!: ElementRef;
  @ViewChild('floatingShapes', { static: true }) floatingShapes!: ElementRef;

  // Platform check for SSR compatibility
  private isBrowser: boolean;

  // Signals for reactive state
  isLoaded = signal(false);
  currentText = signal(0);

  // Dynamic text rotation
  heroTexts = [
    '创意无界，设计有魂',
    '用代码编织美学',
    '让想象力成为现实',
    '2025年设计新趋势'
  ];

  // Animation timeline
  private tl?: gsap.core.Timeline;
  private textInterval?: number;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.initAnimations();
      this.startTextRotation();
    }
  }

  ngOnDestroy() {
    if (this.tl) {
      this.tl.kill();
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
    }
  }

  private initAnimations() {
    if (!this.isBrowser) return;

    // Wait for DOM to be ready
    setTimeout(() => {
      // GSAP animations for modern effects
      this.tl = gsap.timeline();

      // Hero content animation
      this.tl.from('.hero-title', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: 'power3.out'
      })
      .from('.hero-subtitle', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power2.out'
      }, '-=0.5')
      .from('.hero-cta', {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'back.out(1.7)'
      }, '-=0.3');

      // Floating shapes animation
      gsap.to('.floating-shape', {
        duration: 6,
        y: -20,
        rotation: 180,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 2
      });

      this.isLoaded.set(true);
    }, 100);
  }

  private startTextRotation() {
    if (!this.isBrowser) return;

    this.textInterval = window.setInterval(() => {
      this.currentText.update(current =>
        (current + 1) % this.heroTexts.length
      );
    }, 3000);
  }

  scrollToProjects() {
    if (!this.isBrowser) return;

    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  downloadCV() {
    // Implement CV download logic
    console.log('下载简历');
  }
}
