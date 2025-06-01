import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData, GeolocationData } from '../../services/weather.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-widget.component.html',
  styleUrls: ['./weather-widget.component.scss']
})
export class WeatherWidgetComponent implements OnInit, OnDestroy {
  weather: WeatherData | null = null;
  loading = true;
  error = false;
  userLocation: GeolocationData | null = null;
  
  private updateSubscription?: Subscription;
  private readonly updateInterval = 10 * 60 * 1000; // 10分钟更新一次

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.loadWeatherData();
    this.startAutoUpdate();
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  /**
   * 加载天气数据
   */
  loadWeatherData() {
    this.loading = true;
    this.error = false;

    // 首先尝试获取用户位置
    this.weatherService.getUserLocation().subscribe({
      next: (location) => {
        this.userLocation = location;
        this.fetchWeatherForLocation(location);
      },
      error: (error) => {
        console.warn('Failed to get user location:', error);
        // 使用默认位置
        this.fetchWeatherForLocation();
      }
    });
  }

  /**
   * 获取指定位置的天气
   */
  private fetchWeatherForLocation(location?: GeolocationData) {
    this.weatherService.getCurrentWeather(location).subscribe({
      next: (weather) => {
        this.weather = weather;
        this.loading = false;
        console.log('Weather data loaded:', weather);
      },
      error: (error) => {
        console.error('Failed to load weather data:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  /**
   * 开始自动更新
   */
  private startAutoUpdate() {
    this.updateSubscription = interval(this.updateInterval)
      .pipe(
        switchMap(() => {
          return this.weatherService.getCurrentWeather(this.userLocation || undefined);
        })
      )
      .subscribe({
        next: (weather) => {
          this.weather = weather;
          console.log('Weather data auto-updated:', weather);
        },
        error: (error) => {
          console.warn('Failed to auto-update weather:', error);
        }
      });
  }

  /**
   * 手动刷新天气数据
   */
  refreshWeather() {
    this.loadWeatherData();
  }

  /**
   * 获取温度显示颜色
   */
  getTemperatureColor(): string {
    if (!this.weather) return 'text-white';
    
    const temp = this.weather.temperature;
    if (temp <= 0) return 'text-blue-300';
    if (temp <= 10) return 'text-blue-200';
    if (temp <= 20) return 'text-green-300';
    if (temp <= 30) return 'text-yellow-300';
    return 'text-red-300';
  }

  /**
   * 获取湿度等级描述
   */
  getHumidityLevel(): string {
    if (!this.weather) return '';
    
    const humidity = this.weather.humidity;
    if (humidity < 30) return '干燥';
    if (humidity < 60) return '舒适';
    if (humidity < 80) return '潮湿';
    return '很潮湿';
  }

  /**
   * 获取风速等级描述
   */
  getWindLevel(): string {
    if (!this.weather) return '';
    
    const windSpeed = this.weather.windSpeed;
    if (windSpeed < 5) return '微风';
    if (windSpeed < 15) return '轻风';
    if (windSpeed < 25) return '中风';
    return '强风';
  }

  /**
   * 格式化位置显示
   */
  getLocationDisplay(): string {
    if (!this.weather) return '';
    
    const location = this.weather.location;
    // 如果位置太长，截断显示
    if (location.length > 15) {
      return location.substring(0, 12) + '...';
    }
    return location;
  }

  /**
   * 获取问候语
   */
  getGreeting(): string {
    if (!this.weather) return '你好';
    
    const hour = new Date().getHours();
    const temp = this.weather.temperature;
    
    if (hour < 6) return '夜深了';
    if (hour < 12) {
      if (temp < 10) return '早安，注意保暖';
      return '早安';
    }
    if (hour < 18) {
      if (temp > 30) return '下午好，注意防暑';
      return '下午好';
    }
    if (temp < 15) return '晚上好，添衣保暖';
    return '晚上好';
  }
}
