import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  img: string;
  songmid: string;
  albumId?: string;
  artistId?: string;
}

export interface SearchResult {
  code: number;
  data: {
    list: Song[];
    total: number;
    pageNo: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QqMusicClientService {
  // 代理服务器地址 - 使用多个备用服务器
  private readonly PROXY_SERVERS = [
    'https://qq-music-proxy.onrender.com/api',  // Render部署（主要）
    'http://localhost:3001/api'  // 本地开发服务器（备用）
  ];

  constructor(private http: HttpClient) {}

  /**
   * 尝试多个代理服务器
   */
  private tryProxyServers(endpoint: string, data: any): Observable<any> {
    const tryServer = (serverIndex: number): Observable<any> => {
      if (serverIndex >= this.PROXY_SERVERS.length) {
        throw new Error('所有代理服务器都不可用');
      }

      const serverUrl = `${this.PROXY_SERVERS[serverIndex]}/${endpoint}`;
      console.log(`🔄 尝试代理服务器 ${serverIndex + 1}: ${serverUrl}`);

      return this.http.post<any>(serverUrl, data).pipe(
        catchError(error => {
          console.log(`❌ 代理服务器 ${serverIndex + 1} 失败:`, error.message);
          return tryServer(serverIndex + 1);
        })
      );
    };

    return tryServer(0);
  }

  /**
   * 搜索音乐 - 使用代理服务器
   */
  searchMusic(keyword: string, pageNo: number = 1, pageSize: number = 20): Observable<SearchResult> {
    console.log(`🔍 使用多个代理服务器搜索: ${keyword}`);

    const searchData = {
      keyword: keyword,
      pageNo: pageNo,
      pageSize: pageSize
    };

    return this.tryProxyServers('search', searchData).pipe(
      map(response => {
        if (response && response.code === 0 && response.data && response.data.list.length > 0) {
          console.log(`✅ 代理搜索成功，找到 ${response.data.list.length} 首歌曲`);
          return response;
        } else {
          console.log('⚠️ 代理搜索无结果，使用备用数据');
          return this.getMockSearchResults(keyword, pageSize);
        }
      }),
      catchError(error => {
        console.error('❌ 所有代理服务器都不可用，使用备用数据:', error);
        return of(this.getMockSearchResults(keyword, pageSize));
      })
    );
  }

  /**
   * 获取歌曲播放链接 - 使用代理服务器
   */
  getSongUrl(songmid: string): Observable<string | null> {
    console.log(`🎵 使用多个代理服务器获取播放链接: ${songmid}`);

    const requestData = {
      songmid: songmid
    };

    return this.tryProxyServers('song/url', requestData).pipe(
      map(response => {
        if (response && response.code === 0 && response.data && response.data.url) {
          console.log(`✅ 代理获取播放链接成功: ${songmid}`);
          return response.data.url;
        } else {
          console.log(`⚠️ 代理无法获取播放链接: ${songmid}`);
          return null;
        }
      }),
      catchError(error => {
        console.error('❌ 所有代理服务器都不可用:', error);
        return of(null);
      })
    );
  }

  // 备用搜索结果 - 当所有代理都不可用时使用

  private getMockSearchResults(keyword: string, limit: number): SearchResult {
    const mockResults: Song[] = [
      {
        id: '003ebMYY2PGmn6',
        title: keyword,
        artist: '李荣浩',
        album: '有理想',
        duration: 240,
        img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003ebMYY2PGmn6_1.jpg',
        songmid: '003ebMYY2PGmn6'
      }
    ];

    return {
      code: 0,
      data: {
        list: mockResults.slice(0, limit),
        total: mockResults.length,
        pageNo: 1,
        pageSize: limit
      }
    };
  }


}
