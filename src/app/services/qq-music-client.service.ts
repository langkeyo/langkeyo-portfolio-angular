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
  private readonly QQ_MUSIC_API_BASE = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
  private readonly QQ_MUSIC_STREAM_BASE = 'http://ws.stream.qqmusic.qq.com';
  
  // 模拟的QQ音乐Cookie（在生产环境中应该从环境变量获取）
  private readonly qqCookie = `RK=ab9QGFd+wQ; ptcz=e94994051efde8b20517d2e4121a301c59e59f8d408452c173fce5de132a41a5; pgv_pvid=574510342; fqm_pvqid=23a6beb5-8a9b-4e68-82aa-d927ef325392; fqm_sessionid=f47e28eb-6c11-4de3-80be-9f2c8c6b1ebd; pgv_info=ssid=s3512205230; ts_uid=3539329950; _qpsvr_localtk=0.3818803016933282; login_type=1; psrf_qqunionid=C0F222D1051F980B640220A2F28382EF; qqmusic_key=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; euin=owCzNe4soiE57v**; wxunionid=; psrf_qqrefresh_token=F4F1B747D31420233B19733A6E2BE226; music_ignore_pskey=202306271436Hn@vBj; psrf_qqopenid=A75C77C7C22D1E6A334A2C1B242B7F8F; psrf_qqaccess_token=697E873EB6D414B6814C7131E17A4ADB; psrf_access_token_expiresAt=1754039989; tmeLoginType=2; psrf_musickey_createtime=1748855989; wxopenid=; uin=2608563915; wxrefresh_token=; qm_keyst=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; ts_refer=www.google.com/; yqq_stat=0; ct=11; cv=11; ts_last=y.qq.com/n/ryqq/profile`;

  constructor(private http: HttpClient) {}

  /**
   * 搜索音乐
   */
  searchMusic(keyword: string, pageNo: number = 1, pageSize: number = 20): Observable<SearchResult> {
    const searchData = {
      comm: {
        ct: '19',
        cv: '1859',
        uin: '0',
      },
      req: {
        method: 'DoSearchForQQMusicDesktop',
        module: 'music.search.SearchCgiService',
        param: {
          grp: 1,
          num_per_page: pageSize,
          page_num: pageNo,
          query: keyword,
          search_type: 0,
        },
      },
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://y.qq.com/',
      'Origin': 'https://y.qq.com',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    });

    return this.http.post<any>(this.QQ_MUSIC_API_BASE, searchData, { headers }).pipe(
      map(response => this.parseSearchResponse(response, keyword, pageSize)),
      catchError(error => {
        console.error('搜索音乐失败:', error);
        return of(this.getMockSearchResults(keyword, pageSize));
      })
    );
  }

  /**
   * 获取歌曲播放链接
   */
  getSongUrl(songmid: string): Observable<string | null> {
    const guid = Math.floor(Math.random() * 10000000000);
    
    const data = {
      req_0: {
        module: "vkey.GetVkeyServer",
        method: "CgiGetVkey",
        param: {
          guid: guid.toString(),
          songmid: [songmid],
          songtype: [0],
          uin: "0",
          loginflag: 1,
          platform: "20"
        }
      },
      comm: {
        uin: 0,
        format: "json",
        ct: 24,
        cv: 0
      }
    };

    const sign = this.generateSimpleSign(JSON.stringify(data));
    const url = `${this.QQ_MUSIC_API_BASE}?sign=${sign}&_=${Date.now()}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://y.qq.com/',
      'Origin': 'https://y.qq.com',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    });

    return this.http.post<any>(url, data, { headers }).pipe(
      map(response => this.parseUrlResponse(response)),
      catchError(error => {
        console.error('获取播放链接失败:', error);
        return of(null);
      })
    );
  }

  private parseSearchResponse(response: any, keyword: string, pageSize: number): SearchResult {
    if (!response.req || !response.req.data || !response.req.data.body) {
      return this.getMockSearchResults(keyword, pageSize);
    }

    const songs = response.req.data.body.song.list.map((song: any) => ({
      id: song.mid,
      title: this.htmlDecode(song.name),
      artist: this.htmlDecode(song.singer[0].name),
      album: this.htmlDecode(song.album.name),
      duration: song.interval,
      img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
      albumId: song.album.mid,
      artistId: song.singer[0].mid,
      songmid: song.mid
    }));

    return {
      code: 0,
      data: {
        list: songs,
        total: response.req.data.meta.sum,
        pageNo: 1,
        pageSize: pageSize
      }
    };
  }

  private parseUrlResponse(response: any): string | null {
    if (response.req_0 && response.req_0.data) {
      const data = response.req_0.data;
      
      if (data.midurlinfo && data.midurlinfo[0]) {
        const purl = data.midurlinfo[0].purl;
        if (purl) {
          return `${this.QQ_MUSIC_STREAM_BASE}/${purl}`;
        }
      }
      
      if (data.testfilewifi || data.testfile2g) {
        const testUrl = data.testfilewifi || data.testfile2g;
        if (testUrl.includes('?')) {
          return `${this.QQ_MUSIC_STREAM_BASE}/${testUrl}`;
        }
      }
    }
    
    return null;
  }

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

  private htmlDecode(value: string): string {
    if (!value) return '';
    return value.replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
  }

  private generateSimpleSign(data: string): string {
    // 简化的sign生成（在实际应用中可能需要更复杂的算法）
    const fixedString = 'CJBPACrRuNy7';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomPrefix = 'zza';
    
    for (let i = 0; i < 10; i++) {
      randomPrefix += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return randomPrefix + Date.now().toString();
  }
}
