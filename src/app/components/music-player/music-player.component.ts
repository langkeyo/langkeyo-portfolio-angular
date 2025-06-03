import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QqMusicClientService, Song } from '../../services/qq-music-client.service';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  // 播放状态
  isPlaying = false;
  isLoading = false;
  isExpanded = false;
  showPlaylist = false;
  
  // 音频控制
  currentTime = 0;
  volume = 0.7;
  isMuted = false;
  
  // 播放列表
  playlist: Track[] = [];
  currentTrack: Track | null = null;
  currentIndex = 0;

  // 搜索相关
  searchQuery = '';
  searchResults: Track[] = [];
  isSearching = false;
  showSearchResults = false;
  showVipTip = false;
  
  // 音频元素
  private audio: HTMLAudioElement | null = null;
  private animationFrame: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private qqMusicService: QqMusicClientService
  ) {}

  ngOnInit() {
    this.initializeAudio();
    this.loadDemoPlaylist();
    this.setupKeyboardListeners();
    this.checkAudioSupport();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeAudio() {
    this.audio = new Audio();
    this.audio.volume = this.volume;
    // 设置crossorigin属性以支持CORS
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('loadstart', () => {
      this.isLoading = true;
      console.log('开始加载音频...');
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading = false;
      console.log('音频可以播放');
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && this.currentTrack) {
        // 更新真实的音频时长
        this.currentTrack.duration = this.audio.duration;
        console.log(`音频时长: ${this.audio.duration}秒`);
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
      }
    });

    this.audio.addEventListener('ended', () => {
      console.log('音频播放结束，切换下一首');
      this.next();
    });

    this.audio.addEventListener('error', (event) => {
      console.error('音频播放错误:', event);
      console.error('当前音频URL:', this.currentTrack?.audioUrl);
      console.error('音频源URL:', this.audio?.src);
      this.isLoading = false;
      this.isPlaying = false;

      // 如果当前音频出错，尝试播放下一首
      setTimeout(() => {
        console.log('音频错误，尝试下一首');
        this.next();
      }, 1000);
    });
  }

  private async loadDemoPlaylist() {
    console.log('🎵 开始加载QQ音乐每日推荐...');

    // 首先尝试从本地服务器获取每日推荐
    try {
      const isLocalServerAvailable = await this.checkLocalServer();

      if (isLocalServerAvailable) {
        await this.loadDailyRecommendFromServer();
      } else {
        console.log('⚠️ 本地服务器不可用，使用备用推荐歌曲');
        this.loadFallbackPlaylist();
      }
    } catch (error) {
      console.error('❌ 加载每日推荐失败:', error);
      this.loadFallbackPlaylist();
    }

    if (this.playlist.length > 0) {
      this.currentTrack = this.playlist[0];
    }

    console.log('🎵 开始获取QQ音乐播放链接...');
    // 获取播放链接
    await this.loadQQMusicData();
  }

  private async loadDailyRecommendFromServer() {
    try {
      console.log('🎵 从服务器获取每日推荐...');
      const response = await fetch('https://qq-music-proxy.onrender.com/recommend/daily', {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 每日推荐响应:', data);

        if (data.code === 0 && data.data && data.data.list && data.data.list.length > 0) {
          this.playlist = data.data.list.map((song: any) => ({
            id: song.id || song.songmid,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            coverUrl: song.img || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            audioUrl: '' // 将通过API获取真实播放链接
          }));
          console.log(`✅ 成功加载 ${this.playlist.length} 首每日推荐歌曲`);
          return;
        }
      }

      console.log('⚠️ 每日推荐API无数据，使用备用歌曲');
      this.loadFallbackPlaylist();
    } catch (error) {
      console.error('❌ 获取每日推荐失败:', error);
      this.loadFallbackPlaylist();
    }
  }

  private loadFallbackPlaylist() {
    console.log('🎵 加载备用推荐歌曲...');
    // 使用精选的热门歌曲作为备用
    this.playlist = [
      {
        id: '003OUlho2HcRHC',
        title: '稻香',
        artist: '周杰伦',
        album: '魔杰座',
        duration: 223,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003OUlho2HcRHC.jpg',
        audioUrl: ''
      },
      {
        id: '004Z8Ihr0JIu5s',
        title: '青花瓷',
        artist: '周杰伦',
        album: '我很忙',
        duration: 237,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000004Z8Ihr0JIu5s.jpg',
        audioUrl: ''
      },
      {
        id: '000xdZuV4FjCJ8',
        title: '晴天',
        artist: '周杰伦',
        album: '叶惠美',
        duration: 269,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000xdZuV4FjCJ8.jpg',
        audioUrl: ''
      },
      {
        id: '001JdDVg1aNpWy',
        title: '告白气球',
        artist: '周杰伦',
        album: '周杰伦的床边故事',
        duration: 203,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001JdDVg1aNpWy.jpg',
        audioUrl: ''
      },
      {
        id: '003aAYrm3GE5XF',
        title: '七里香',
        artist: '周杰伦',
        album: '七里香',
        duration: 299,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003aAYrm3GE5XF.jpg',
        audioUrl: ''
      },
      {
        id: '002MiN3l3iTZto',
        title: '夜曲',
        artist: '周杰伦',
        album: '十一月的萧邦',
        duration: 237,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000002MiN3l3iTZto.jpg',
        audioUrl: ''
      },
      {
        id: '004emQMs09Z1lz',
        title: '简单爱',
        artist: '周杰伦',
        album: '范特西',
        duration: 269,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000004emQMs09Z1lz.jpg',
        audioUrl: ''
      },
      {
        id: '001Qu4I30eVFYb',
        title: '彩虹',
        artist: '周杰伦',
        album: '我很忙',
        duration: 263,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001Qu4I30eVFYb.jpg',
        audioUrl: ''
      },
      {
        id: '003DFRzD2kxqaI',
        title: '东风破',
        artist: '周杰伦',
        album: '七里香',
        duration: 225,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003DFRzD2kxqaI.jpg',
        audioUrl: ''
      },
      {
        id: '000MkMni19ClKG',
        title: '烟花易冷',
        artist: '周杰伦',
        album: '跨时代',
        duration: 262,
        coverUrl: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000MkMni19ClKG.jpg',
        audioUrl: ''
      }
    ];
    console.log(`✅ 备用歌曲加载完成，共 ${this.playlist.length} 首`);
  }

  private async loadQQMusicData() {
    try {
      console.log('🎵 开始获取QQ音乐数据...');

      for (let i = 0; i < this.playlist.length; i++) {
        const track = this.playlist[i];
        try {
          console.log(`🎵 获取 ${track.title} 的播放URL...`);

          // 使用新的客户端服务获取播放链接
          this.qqMusicService.getSongUrl(track.id).subscribe({
            next: (playUrl) => {
              if (playUrl) {
                track.audioUrl = playUrl;
                console.log(`✅ 获取到 ${track.title} 的播放URL`);
              } else {
                console.warn(`⚠️ ${track.title} 没有可用的播放URL`);
              }
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.warn(`❌ 获取 ${track.title} 播放URL失败:`, error);
            }
          });

        } catch (error) {
          console.warn(`❌ 获取 ${track.title} 数据时出错:`, error);
        }
      }

      console.log('🎵 QQ音乐数据获取完成！');
    } catch (error) {
      console.warn('⚠️ 获取QQ音乐数据失败，使用备用数据:', error);
    }
  }

  // 搜索功能
  async searchMusic() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.showSearchResults = true;

    try {
      console.log(`🔍 搜索音乐: ${this.searchQuery}`);

      // 首先尝试使用本地服务器（如果可用）
      const isLocalServerAvailable = await this.checkLocalServer();

      if (isLocalServerAvailable) {
        await this.searchWithLocalServer();
      } else {
        // 如果本地服务器不可用，使用客户端服务
        await this.searchWithClientService();
      }
    } catch (error) {
      console.error('❌ 搜索出错:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
      this.cdr.markForCheck();
    }
  }

  private async checkLocalServer(): Promise<boolean> {
    try {
      const response = await fetch('https://qq-music-proxy.onrender.com/', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5秒超时，Render可能需要冷启动
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async searchWithLocalServer() {
    try {
      const response = await fetch(`https://qq-music-proxy.onrender.com/search?key=${encodeURIComponent(this.searchQuery)}&pageNo=1&pageSize=20`);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 本地服务器搜索响应:', data);

        if (data.code === 0 && data.data && data.data.list && data.data.list.length > 0) {
          this.searchResults = data.data.list.map((song: any) => ({
            id: song.songmid || song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            coverUrl: song.img || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            audioUrl: ''
          }));
          console.log(`✅ 本地服务器搜索到 ${this.searchResults.length} 首歌曲`);
        }
      }
    } catch (error) {
      console.error('❌ 本地服务器搜索失败:', error);
      await this.searchWithClientService();
    }
  }

  private async searchWithClientService() {
    try {
      console.log('🌐 使用客户端服务搜索...');
      this.qqMusicService.searchMusic(this.searchQuery, 1, 20).subscribe({
        next: (result) => {
          if (result.code === 0 && result.data.list.length > 0) {
            this.searchResults = result.data.list.map((song: Song) => ({
              id: song.id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              duration: song.duration,
              coverUrl: song.img,
              audioUrl: ''
            }));
            console.log(`✅ 客户端搜索到 ${this.searchResults.length} 首歌曲`);
          } else {
            this.searchResults = [];
            console.log('⚠️ 客户端搜索没有找到匹配的歌曲');
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ 客户端搜索失败:', error);
          this.searchResults = [];
          this.cdr.markForCheck();
        }
      });
    } catch (error) {
      console.error('❌ 客户端搜索出错:', error);
      this.searchResults = [];
    }
  }

  // 播放搜索结果中的歌曲
  async playSearchResult(track: Track) {
    console.log(`🎵 播放搜索结果: ${track.title}`);

    // 首先检查本地服务器是否可用
    const isLocalServerAvailable = await this.checkLocalServer();

    if (isLocalServerAvailable) {
      await this.playWithLocalServer(track);
    } else {
      await this.playWithClientService(track);
    }
  }

  private async playWithLocalServer(track: Track) {
    try {
      const response = await fetch(`https://qq-music-proxy.onrender.com/song/urls?id=${track.id}`);
      if (response.ok) {
        const data = await response.json();
        let playUrl = null;

        if (data[track.id]) {
          playUrl = data[track.id];
        } else if (data.result && data.result[track.id]) {
          playUrl = data.result[track.id];
        } else if (data.data && data.data.length > 0) {
          playUrl = data.data[0].url;
        } else if (data.url) {
          playUrl = data.url;
        }

        if (playUrl && playUrl !== '') {
          const proxyUrl = `https://qq-music-proxy.onrender.com/proxy/audio?url=${encodeURIComponent(playUrl)}`;
          track.audioUrl = proxyUrl;
          console.log(`🎧 使用本地服务器播放: ${track.title}`);
          this.startPlayback(track);
        } else {
          console.warn(`⚠️ 本地服务器无法获取播放链接，尝试客户端服务`);
          await this.playWithClientService(track);
        }
      }
    } catch (error) {
      console.error(`❌ 本地服务器播放失败:`, error);
      await this.playWithClientService(track);
    }
  }

  private async playWithClientService(track: Track) {
    try {
      console.log('🌐 使用客户端服务获取播放链接...');
      this.qqMusicService.getSongUrl(track.id).subscribe({
        next: (playUrl) => {
          if (playUrl) {
            track.audioUrl = playUrl;
            console.log(`🎧 使用客户端服务播放: ${track.title}`);
            this.startPlayback(track);
          } else {
            console.warn(`❌ 无法获取 ${track.title} 的播放URL`);
            this.showVipMusicTip(track);
          }
        },
        error: (error) => {
          console.error(`❌ 客户端服务获取播放链接失败:`, error);
          this.showVipMusicTip(track);
        }
      });
    } catch (error) {
      console.error(`❌ 客户端服务播放失败:`, error);
      this.showVipMusicTip(track);
    }
  }

  private startPlayback(track: Track) {
    // 创建新的Audio对象来避免CORS问题
    this.cleanup();
    this.initializeAudio();

    this.currentTrack = track;
    this.currentIndex = 0;
    this.playlist = [track]; // 临时播放列表
    this.play();
    console.log(`✅ 开始播放: ${track.title}`);
  }



  // 添加到播放列表
  addToPlaylist(track: Track) {
    const exists = this.playlist.find(t => t.id === track.id);
    if (!exists) {
      this.playlist.push(track);
      console.log(`✅ 已添加 ${track.title} 到播放列表`);
    } else {
      console.log(`⚠️ ${track.title} 已在播放列表中`);
    }
  }

  // 清空搜索结果
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }





  // 播放控制
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio || !this.currentTrack) {
      console.warn('音频对象或当前歌曲不存在');
      return;
    }

    console.log(`准备播放: ${this.currentTrack.title}`);
    console.log(`音频URL: ${this.currentTrack.audioUrl}`);

    // 停止当前播放
    if (!this.audio.paused) {
      this.audio.pause();
    }

    // 重置音频状态
    this.audio.currentTime = 0;
    this.currentTime = 0;

    if (this.audio.src !== this.currentTrack.audioUrl) {
      // 确保crossOrigin在设置src之前就已经设置
      this.audio.crossOrigin = 'anonymous';
      this.audio.src = this.currentTrack.audioUrl;
      console.log('设置新的音频源');
    }

    this.isLoading = true;

    // 等待一小段时间再播放，避免冲突
    setTimeout(() => {
      if (this.audio && this.currentTrack) {
        this.audio.play().then(() => {
          console.log('音频开始播放');
          this.isPlaying = true;
          this.isLoading = false;
          this.startTimeUpdate();
        }).catch(error => {
          console.error('播放失败:', error);
          console.error('失败的URL:', this.currentTrack?.audioUrl);
          this.isPlaying = false;
          this.isLoading = false;

          // 如果播放失败，显示VIP提示
          if (this.currentTrack) {
            this.showVipMusicTip(this.currentTrack);
          }
        });
      }
    }, 100);
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.stopTimeUpdate();
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.currentTime = 0;
      this.isPlaying = false;
      this.stopTimeUpdate();
    }
  }

  next() {
    if (this.playlist.length === 0) return;

    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.currentTrack = this.playlist[this.currentIndex];

    if (this.isPlaying) {
      this.play();
    }
  }

  previous() {
    if (this.playlist.length === 0) return;

    this.currentIndex = this.currentIndex === 0 ? this.playlist.length - 1 : this.currentIndex - 1;
    this.currentTrack = this.playlist[this.currentIndex];

    if (this.isPlaying) {
      this.play();
    }
  }

  // UI控制
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  togglePlaylist() {
    this.showPlaylist = !this.showPlaylist;
  }

  selectTrack(track: Track, index: number) {
    this.currentTrack = track;
    this.currentIndex = index;

    // 直接播放选中的歌曲
    this.play();
  }

  // 显示VIP音乐提示
  showVipMusicTip(track: Track) {
    console.log(`🔒 ${track.title} 可能是VIP音乐，需要解密处理`);
    console.log(`📋 解决方案:`);
    console.log(`1. 访问解密工具: https://um-react.netlify.app/`);
    console.log(`2. 上传加密的音乐文件进行解密`);
    console.log(`3. 下载解密后的音频文件`);
    console.log(`4. 或者尝试搜索非VIP版本的歌曲`);

    // 显示UI提示
    this.showVipTip = true;
    this.cdr.markForCheck();
  }

  // 关闭VIP提示
  closeVipTip() {
    this.showVipTip = false;
    this.cdr.markForCheck();
  }

  // 检查浏览器音频支持
  checkAudioSupport() {
    const audio = new Audio();
    console.log('🔍 浏览器音频格式支持检测:');
    console.log('MP3:', audio.canPlayType('audio/mpeg'));
    console.log('MP4/M4A:', audio.canPlayType('audio/mp4'));
    console.log('MP4 with AAC:', audio.canPlayType('audio/mp4; codecs="mp4a.40.2"'));
    console.log('OGG:', audio.canPlayType('audio/ogg'));
    console.log('FLAC:', audio.canPlayType('audio/flac'));
    console.log('WAV:', audio.canPlayType('audio/wav'));
  }

  // 音量控制
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  onVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.volume = parseFloat(target.value);
      if (this.audio) {
        this.audio.volume = this.volume;
      }
      this.isMuted = this.volume === 0;
    }
  }

  // 进度控制
  onProgressClick(event: MouseEvent) {
    if (!this.audio || !this.currentTrack) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * this.currentTrack.duration;

    this.audio.currentTime = newTime;
    this.currentTime = newTime;
  }

  // 工具方法
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 100);
    }
  }

  private startTimeUpdate() {
    this.stopTimeUpdate();
    const updateTime = () => {
      if (this.audio && this.isPlaying) {
        this.currentTime = this.audio.currentTime;
        // 使用 markForCheck 而不是 detectChanges
        this.cdr.markForCheck();
        this.animationFrame = requestAnimationFrame(updateTime);
      }
    };
    this.animationFrame = requestAnimationFrame(updateTime);
  }

  private stopTimeUpdate() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  private cleanup() {
    this.stopTimeUpdate();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (event: KeyboardEvent) => {
    // 检查当前焦点是否在输入框中
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    );

    if (event.key === 'Escape' && this.isExpanded) {
      this.toggleExpanded();
    }

    // 只有在播放器展开且没有输入框获得焦点时才响应空格键
    if (event.code === 'Space' && this.isExpanded && !isInputFocused) {
      event.preventDefault();
      this.togglePlay();
    }
  }
}
