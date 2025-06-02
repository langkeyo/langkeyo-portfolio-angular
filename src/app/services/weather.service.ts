import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  location: string;
  timezone: string;
  lastUpdated: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly geocodingApiUrl = 'https://api.open-meteo.com/v1/geocoding';
  
  // 天气代码映射 (WMO Weather interpretation codes)
  private readonly weatherCodeMap: { [key: number]: { description: string; icon: string } } = {
    0: { description: '晴朗', icon: '☀️' },
    1: { description: '大部分晴朗', icon: '🌤️' },
    2: { description: '部分多云', icon: '⛅' },
    3: { description: '阴天', icon: '☁️' },
    45: { description: '雾', icon: '🌫️' },
    48: { description: '霜雾', icon: '🌫️' },
    51: { description: '小雨', icon: '🌦️' },
    53: { description: '中雨', icon: '🌧️' },
    55: { description: '大雨', icon: '🌧️' },
    56: { description: '冻雨', icon: '🌨️' },
    57: { description: '冻雨', icon: '🌨️' },
    61: { description: '小雨', icon: '🌦️' },
    63: { description: '中雨', icon: '🌧️' },
    65: { description: '大雨', icon: '🌧️' },
    66: { description: '冻雨', icon: '🌨️' },
    67: { description: '冻雨', icon: '🌨️' },
    71: { description: '小雪', icon: '🌨️' },
    73: { description: '中雪', icon: '❄️' },
    75: { description: '大雪', icon: '❄️' },
    77: { description: '雪粒', icon: '🌨️' },
    80: { description: '阵雨', icon: '🌦️' },
    81: { description: '阵雨', icon: '🌧️' },
    82: { description: '暴雨', icon: '⛈️' },
    85: { description: '阵雪', icon: '🌨️' },
    86: { description: '阵雪', icon: '❄️' },
    95: { description: '雷暴', icon: '⛈️' },
    96: { description: '雷暴伴冰雹', icon: '⛈️' },
    99: { description: '雷暴伴冰雹', icon: '⛈️' }
  };

  // 默认城市（北京）
  private readonly defaultLocation: GeolocationData = {
    latitude: 39.9042,
    longitude: 116.4074,
    city: '北京',
    country: '中国'
  };

  constructor(private http: HttpClient) {}

  /**
   * 获取当前天气数据
   */
  getCurrentWeather(location?: GeolocationData): Observable<WeatherData> {
    const coords = location || this.defaultLocation;
    
    const params = {
      latitude: coords.latitude.toString(),
      longitude: coords.longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      timezone: 'auto'
    };

    const queryString = new URLSearchParams(params).toString();
    
    return this.http.get<any>(`${this.weatherApiUrl}?${queryString}`)
      .pipe(
        map(response => this.parseWeatherResponse(response, coords)),
        catchError(error => {
          console.error('Failed to fetch weather data:', error);
          return of(this.getFallbackWeather(coords));
        })
      );
  }

  /**
   * 获取用户地理位置
   */
  getUserLocation(): Observable<GeolocationData> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default location');
        observer.next(this.defaultLocation);
        observer.complete();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const location: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: '当前位置',
            country: ''
          };

          console.log('Got user location:', location);
          observer.next(location);
          observer.complete();
        },
        error => {
          console.warn('Geolocation error, using default location:', error);
          observer.next(this.defaultLocation);
          observer.complete();
        },
        {
          timeout: 10000,
          enableHighAccuracy: false
        }
      );
    });
  }



  /**
   * 解析天气API响应
   */
  private parseWeatherResponse(response: any, location: GeolocationData): WeatherData {
    const current = response.current;
    const weatherCode = current.weather_code;
    const weatherInfo = this.weatherCodeMap[weatherCode] || { description: '未知', icon: '🌡️' };

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      weatherCode: weatherCode,
      weatherDescription: weatherInfo.description,
      weatherIcon: weatherInfo.icon,
      location: location.city ? `${location.city}, ${location.country}` : '未知位置',
      timezone: response.timezone || 'UTC',
      lastUpdated: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  }

  /**
   * 获取备用天气数据
   */
  private getFallbackWeather(location: GeolocationData): WeatherData {
    return {
      temperature: 22,
      humidity: 65,
      windSpeed: 3.5,
      weatherCode: 1,
      weatherDescription: '大部分晴朗',
      weatherIcon: '🌤️',
      location: location.city ? `${location.city}, ${location.country}` : '北京, 中国',
      timezone: 'Asia/Shanghai',
      lastUpdated: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  }

  /**
   * 搜索城市
   */
  searchCity(cityName: string): Observable<GeolocationData[]> {
    const params = {
      name: cityName,
      count: '5',
      language: 'zh',
      format: 'json'
    };

    const queryString = new URLSearchParams(params).toString();
    
    return this.http.get<any>(`${this.geocodingApiUrl}/search?${queryString}`)
      .pipe(
        map(response => {
          if (response.results) {
            return response.results.map((result: any) => ({
              latitude: result.latitude,
              longitude: result.longitude,
              city: result.name,
              country: result.country
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Failed to search city:', error);
          return of([]);
        })
      );
  }
}
