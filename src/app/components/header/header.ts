import { Component, OnInit, OnDestroy, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { WeatherWidgetComponent } from '../weather-widget/weather-widget.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, WeatherWidgetComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  // Signals for reactive state management (Angular 20 feature)
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  currentSection = signal('home');

  // Computed values
  headerClasses = computed(() => ({
    'glass': true,
    'scrolled': this.isScrolled(),
    'mobile-open': this.isMobileMenuOpen()
  }));

  navItems = [
    { id: 'home', label: '首页', href: '#home' },
    { id: 'about', label: '关于', href: '#about' },
    { id: 'projects', label: '作品', href: '#projects' },
    { id: 'contact', label: '联系', href: '#contact' }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.setupScrollListener();
    }
    this.setupRouterListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollListener() {
    if (!this.isBrowser) return;

    window.addEventListener('scroll', () => {
      this.isScrolled.set(window.scrollY > 100);
    });
  }

  private setupRouterListener() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isMobileMenuOpen.set(false);
      });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  scrollToSection(sectionId: string) {
    this.currentSection.set(sectionId);
    this.isMobileMenuOpen.set(false);

    if (!this.isBrowser) return;

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
