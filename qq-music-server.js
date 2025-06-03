const express = require('express');
const cors = require('cors');
const qqMusic = require('qq-music-api');
const axios = require('axios');

const app = express();
const PORT = 3001; // 使用不同的端口避免冲突

// 检测加密音乐文件的函数
function detectEncryptedMusic(buffer, url) {
  const firstBytes = buffer.slice(0, 16);

  // QQ音乐加密格式检测
  if (url.includes('.mflac') || url.includes('.mgg')) {
    // 检查是否是QQ音乐的加密格式
    const header = firstBytes.toString('hex');

    // MFLAC格式通常以特定的字节序列开始
    if (header.startsWith('4d464c4143') || // MFLAC
        header.startsWith('4d474700') ||   // MGG
        !header.startsWith('664c6143') ||  // 不是标准的FLAC
        !header.startsWith('49443303')) {  // 不是标准的MP3
      return {
        encrypted: true,
        format: url.includes('.mflac') ? 'MFLAC (QQ音乐加密FLAC)' : 'MGG (QQ音乐加密格式)'
      };
    }
  }

  // 检查是否是标准的音频格式
  const header = firstBytes.toString('hex');
  if (header.startsWith('664c6143') ||    // FLAC
      header.startsWith('49443303') ||    // MP3
      header.startsWith('4f676753') ||    // OGG
      header.startsWith('52494646')) {    // WAV/RIFF
    return { encrypted: false };
  }

  // 如果不是标准格式，可能是加密的
  return {
    encrypted: true,
    format: '未知加密格式'
  };
}

// QQ音乐VIP解密函数 - 基于异或算法
function decryptQQMusic(buffer) {
  console.log('🔓 开始解密QQ音乐VIP文件...');

  // 常见的QQ音乐加密密钥
  const commonKeys = [0xA3, 0x7E, 0x5A, 0x2F, 0x91, 0xC4];

  // 检测最可能的密钥
  let bestKey = 0xA3; // 默认密钥
  let maxScore = 0;

  // 分析前1024字节来确定密钥
  const sampleSize = Math.min(1024, buffer.length);
  const sample = buffer.slice(0, sampleSize);

  for (const key of commonKeys) {
    let score = 0;
    const decrypted = Buffer.alloc(sampleSize);

    // 解密样本
    for (let i = 0; i < sampleSize; i++) {
      decrypted[i] = sample[i] ^ key;
    }

    // 检查是否像音频文件头
    const header = decrypted.slice(0, 16).toString('hex');
    if (header.startsWith('49443303') ||  // MP3 ID3
        header.startsWith('664c6143') ||  // FLAC
        header.startsWith('4f676753') ||  // OGG
        header.startsWith('52494646')) {  // RIFF/WAV
      score += 100;
    }

    // 统计0x00字节的数量（解密后应该有一些0字节）
    for (let i = 0; i < sampleSize; i++) {
      if (decrypted[i] === 0x00) score++;
    }

    if (score > maxScore) {
      maxScore = score;
      bestKey = key;
    }
  }

  console.log(`🔑 检测到最佳解密密钥: 0x${bestKey.toString(16).toUpperCase()}, 得分: ${maxScore}`);

  // 使用最佳密钥解密整个文件
  const decrypted = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    decrypted[i] = buffer[i] ^ bestKey;
  }

  // 验证解密结果
  const decryptedHeader = decrypted.slice(0, 16).toString('hex');
  console.log(`🎵 解密后文件头: ${decryptedHeader}`);

  if (decryptedHeader.startsWith('49443303') ||  // MP3
      decryptedHeader.startsWith('664c6143') ||  // FLAC
      decryptedHeader.startsWith('4f676753') ||  // OGG
      decryptedHeader.startsWith('52494646')) {  // WAV
    console.log('✅ VIP音乐解密成功！');
    return decrypted;
  } else {
    console.log('⚠️ 解密结果可能不正确，返回原始数据');
    return buffer;
  }
}

// 启用CORS
app.use(cors());
app.use(express.json());

// 设置Cookie（请替换为你的QQ音乐Cookie）
// 示例：qqMusic.setCookie('uin=你的QQ号; skey=你的skey; ...');
// 重要：你需要从QQ音乐网页版获取完整的Cookie字符串
qqMusic.setCookie(`RK=ab9QGFd+wQ; ptcz=e94994051efde8b20517d2e4121a301c59e59f8d408452c173fce5de132a41a5; pgv_pvid=574510342; fqm_pvqid=23a6beb5-8a9b-4e68-82aa-d927ef325392; fqm_sessionid=f47e28eb-6c11-4de3-80be-9f2c8c6b1ebd; pgv_info=ssid=s3512205230; ts_uid=3539329950; _qpsvr_localtk=0.3818803016933282; login_type=1; psrf_qqunionid=C0F222D1051F980B640220A2F28382EF; qqmusic_key=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; euin=owCzNe4soiE57v**; wxunionid=; psrf_qqrefresh_token=F4F1B747D31420233B19733A6E2BE226; music_ignore_pskey=202306271436Hn@vBj; psrf_qqopenid=A75C77C7C22D1E6A334A2C1B242B7F8F; psrf_qqaccess_token=697E873EB6D414B6814C7131E17A4ADB; psrf_access_token_expiresAt=1754039989; tmeLoginType=2; psrf_musickey_createtime=1748855989; wxopenid=; uin=2608563915; wxrefresh_token=; qm_keyst=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; ts_refer=www.google.com/; yqq_stat=0; ct=11; cv=11; ts_last=y.qq.com/n/ryqq/profile
`)
// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'QQ音乐API服务器运行中',
    status: 'running',
    port: PORT,
    cookie: qqMusic.cookie ? '已配置' : '未配置',
    uin: qqMusic.uin || '未登录'
  });
});

// 测试Cookie配置
app.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试QQ音乐API配置...');
    const result = await qqMusic.api('search/hot');
    res.json({
      success: true,
      message: 'QQ音乐API配置正常',
      cookie: qqMusic.cookie ? '已配置' : '未配置',
      uin: qqMusic.uin || '未登录',
      testResult: result
    });
  } catch (error) {
    console.error('❌ QQ音乐API测试失败:', error);
    res.status(500).json({
      success: false,
      message: 'QQ音乐API配置有问题',
      cookie: qqMusic.cookie ? '已配置' : '未配置',
      error: error.message
    });
  }
});

// 搜索接口 - 使用爬虫技术
app.get('/search', async (req, res) => {
  try {
    const { key, pageNo = 1, pageSize = 20 } = req.query;

    if (!key) {
      return res.status(400).json({ error: '缺少搜索关键词' });
    }

    console.log(`🔍 爬虫搜索: ${key}, 页码: ${pageNo}`);

    // 使用Listen1的搜索API实现
    const target_url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

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
          num_per_page: parseInt(pageSize, 10),
          page_num: parseInt(pageNo, 10),
          query: key,
          search_type: 0, // 0 for songs
        },
      },
    };

    const response = await axios.post(target_url, searchData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': qqMusic.cookie || ''
      }
    });

    const data = response.data;

    if (!data.req || !data.req.data || !data.req.data.body) {
      console.log('⚠️ QQ音乐API返回格式异常，使用备用数据');
      return res.json(getMockSearchResults(key, pageSize));
    }

    // 转换为标准格式
    const songs = data.req.data.body.song.list.map(song => ({
      id: song.mid,
      title: htmlDecode(song.name),
      artist: htmlDecode(song.singer[0].name),
      album: htmlDecode(song.album.name),
      duration: song.interval,
      img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
      // 添加更多信息
      albumId: song.album.mid,
      artistId: song.singer[0].mid,
      songmid: song.mid
    }));

    const result = {
      code: 0,
      data: {
        list: songs,
        total: data.req.data.meta.sum,
        pageNo: parseInt(pageNo, 10),
        pageSize: parseInt(pageSize, 10)
      }
    };

    res.json(result);
    console.log(`✅ 爬虫搜索完成，返回 ${songs.length} 首歌曲`);

  } catch (error) {
    console.error('❌ 爬虫搜索出错:', error);
    // 搜索失败时返回备用数据
    res.json(getMockSearchResults(req.query.key, req.query.pageSize || 20));
  }
});

// HTML解码函数
function htmlDecode(value) {
  if (!value) return '';
  return value.replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&');
}

// 备用搜索结果
function getMockSearchResults(keywords, limit) {
  const mockResults = [
    {
      id: '003ebMYY2PGmn6',
      title: keywords,
      artist: '李荣浩',
      album: '有理想',
      duration: 240,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003ebMYY2PGmn6_1.jpg',
      songmid: '003ebMYY2PGmn6'
    },
    {
      id: '002YRGBw0FDkHI',
      title: `${keywords} (DJ版)`,
      artist: 'Various Artists',
      album: '精选集',
      duration: 180,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000002YRGBw0FDkHI_1.jpg',
      songmid: '002YRGBw0FDkHI'
    }
  ];

  // 添加更多模拟结果
  for (let i = 3; i <= limit; i++) {
    mockResults.push({
      id: `mock_${i}_${Date.now()}`,
      title: `${keywords} - 版本${i}`,
      artist: `艺术家${i}`,
      album: `专辑${i}`,
      duration: 200 + i * 10,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000default.jpg',
      songmid: `mock_${i}_${Date.now()}`
    });
  }

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

// 获取歌曲详情
app.get('/song', async (req, res) => {
  try {
    const { songmid } = req.query;
    console.log(`🎵 获取歌曲详情: ${songmid}`);
    const result = await qqMusic.api('song', { songmid });
    console.log(`✅ 歌曲详情结果:`, result);
    res.json(result);
  } catch (error) {
    console.error('❌ 获取歌曲详情出错:', error);
    res.status(500).json({ error: '获取歌曲详情失败', details: error.message });
  }
});

// 获取歌曲播放链接 - 基于网上教程的爬虫实现
app.get('/song/urls', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '缺少歌曲ID' });
    }

    console.log(`🎧 爬虫获取播放链接: ${id}`);

    // 基于教程的vkey获取方法
    const vkeyResult = await getVkeyFromQQMusic(id);

    if (vkeyResult.success) {
      const result = {};
      result[id] = vkeyResult.playUrl;
      res.json(result);
      console.log(`✅ 爬虫播放链接结果:`, result);
    } else {
      // 如果获取失败，返回错误信息
      console.log(`❌ 爬虫获取vkey失败: ${vkeyResult.error}`);
      res.status(404).json({
        error: '无法获取播放链接',
        details: vkeyResult.error,
        code: vkeyResult.code
      });
    }

  } catch (error) {
    console.error('❌ 爬虫获取播放链接出错:', error);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
});

// 基于网上教程的vkey获取函数
async function getVkeyFromQQMusic(songmid) {
  try {
    console.log(`🔑 开始获取vkey: ${songmid}`);

    // 生成guid（基于教程）
    const guid = Math.floor(Math.random() * 10000000000);

    // 构建请求数据（基于教程的API结构）
    const data = {
      req_0: {
        module: "vkey.GetVkeyServer",
        method: "CgiGetVkey",
        param: {
          guid: guid.toString(),
          songmid: [songmid],
          songtype: [0],
          uin: qqMusic.uin || "0",
          loginflag: 1,
          platform: "20"
        }
      },
      comm: {
        uin: parseInt(qqMusic.uin) || 0,
        format: "json",
        ct: 24,
        cv: 0
      }
    };

    // 生成sign（基于教程的简化算法）
    const sign = generateSimpleSign(JSON.stringify(data));

    // 请求vkey（基于教程的URL结构）
    const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?sign=${sign}&_=${Date.now()}`;

    console.log(`🌐 请求vkey URL: ${url}`);

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': qqMusic.cookie || ''
      }
    });

    const result = response.data;
    console.log(`📦 vkey响应:`, JSON.stringify(result, null, 2));

    // 解析响应（基于教程的数据结构）
    if (result.req_0 && result.req_0.data) {
      const data = result.req_0.data;

      // 首先尝试从midurlinfo获取
      if (data.midurlinfo && data.midurlinfo[0]) {
        const midurlinfo = data.midurlinfo[0];
        const purl = midurlinfo.purl;
        const resultCode = midurlinfo.result;

        // 详细的错误码分析
        const errorMessages = {
          104003: '需要付费购买此歌曲',
          104001: '需要VIP会员权限',
          104002: '歌曲暂时无法播放',
          104004: '地区限制',
          104005: '版权限制',
          0: '成功'
        };

        console.log(`🔍 播放权限检查 - 错误码: ${resultCode}, 说明: ${errorMessages[resultCode] || '未知错误'}`);

        if (purl) {
          // 拼接完整的播放URL（基于教程的URL格式）
          const playUrl = `http://ws.stream.qqmusic.qq.com/${purl}`;
          console.log(`✅ 成功获取播放链接: ${playUrl}`);
          return { success: true, playUrl };
        }
      }

      // 如果purl为空，尝试使用testfile2g或testfilewifi
      if (data.testfilewifi || data.testfile2g) {
        const testUrl = data.testfilewifi || data.testfile2g;
        console.log(`🎵 purl为空，尝试使用测试链接: ${testUrl}`);

        // 检查是否是完整URL
        if (testUrl.includes('?')) {
          const playUrl = `http://ws.stream.qqmusic.qq.com/${testUrl}`;
          console.log(`✅ 使用测试链接获取播放URL: ${playUrl}`);
          return { success: true, playUrl };
        }
      }

      // 如果都没有，返回错误
      const errorMsg = '无法获取播放链接';
      console.log(`⚠️ 所有播放链接都为空 - ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    console.log(`❌ 响应格式异常`);
    return { success: false, error: 'Invalid response format' };

  } catch (error) {
    console.error('❌ 获取vkey失败:', error);
    return { success: false, error: error.message };
  }
}

// 简化的sign生成函数（基于教程）
function generateSimpleSign(data) {
  try {
    const crypto = require('crypto');

    // 基于教程的固定字符串
    const fixedString = 'CJBPACrRuNy7';
    const hash = crypto.createHash('md5').update(fixedString + data).digest('hex');

    // 生成随机前缀（基于教程的算法）
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomPrefix = 'zza';
    const randomLength = Math.floor(Math.random() * 7 + 10); // 10-16位随机

    for (let i = 0; i < randomLength; i++) {
      randomPrefix += chars[Math.floor(Math.random() * chars.length)];
    }

    const finalSign = randomPrefix + hash;
    console.log(`🔐 生成sign: ${finalSign}`);
    return finalSign;
  } catch (error) {
    console.error('❌ 生成sign失败:', error);
    // 返回一个简单的fallback sign
    return 'zza' + Date.now().toString();
  }
}

// 获取歌词
app.get('/lyric', async (req, res) => {
  try {
    const { songmid } = req.query;
    const result = await qqMusic.api('lyric', { songmid });
    res.json(result);
  } catch (error) {
    console.error('获取歌词出错:', error);
    res.status(500).json({ error: '获取歌词失败', details: error.message });
  }
});

// 热搜
app.get('/search/hot', async (req, res) => {
  try {
    const result = await qqMusic.api('search/hot');
    res.json(result);
  } catch (error) {
    console.error('获取热搜出错:', error);
    res.status(500).json({ error: '获取热搜失败', details: error.message });
  }
});

// 每日推荐 - 基于QQ音乐推荐算法
app.get('/recommend/daily', async (req, res) => {
  try {
    console.log('🎵 获取QQ音乐每日推荐...');

    // 使用QQ音乐的推荐API
    const target_url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

    const recommendData = {
      comm: {
        ct: '24',
        cv: '0',
        uin: qqMusic.uin || '0',
      },
      req_1: {
        method: 'get_daily_recommend',
        module: 'music.musicasset.SongFavRead',
        param: {
          uin: parseInt(qqMusic.uin) || 0
        }
      },
      req_2: {
        method: 'get_recommend_song',
        module: 'music.recommend.RecommendRead',
        param: {
          uin: parseInt(qqMusic.uin) || 0,
          num: 30
        }
      }
    };

    const response = await axios.post(target_url, recommendData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': qqMusic.cookie || ''
      }
    });

    const data = response.data;
    console.log('🎵 推荐API响应:', JSON.stringify(data, null, 2));

    let songs = [];

    // 尝试从不同的响应结构中提取歌曲
    if (data.req_1 && data.req_1.data && data.req_1.data.songlist) {
      songs = data.req_1.data.songlist;
    } else if (data.req_2 && data.req_2.data && data.req_2.data.songlist) {
      songs = data.req_2.data.songlist;
    }

    // 如果API没有返回推荐，使用精选的热门歌曲
    if (!songs || songs.length === 0) {
      console.log('⚠️ 推荐API无数据，使用精选热门歌曲');
      songs = getPopularSongs();
    } else {
      // 转换API返回的数据格式
      songs = songs.map(song => ({
        id: song.mid || song.songmid,
        title: htmlDecode(song.name || song.title),
        artist: htmlDecode(song.singer ? song.singer[0].name : song.artist),
        album: htmlDecode(song.album ? song.album.name : song.album_name),
        duration: song.interval || song.duration || 240,
        img: song.album && song.album.mid ?
          `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg` :
          'https://y.gtimg.cn/music/photo_new/T002R300x300M000default.jpg',
        albumId: song.album ? song.album.mid : '',
        artistId: song.singer ? song.singer[0].mid : '',
        songmid: song.mid || song.songmid
      }));
    }

    const result = {
      code: 0,
      data: {
        list: songs.slice(0, 20), // 限制返回20首
        total: songs.length,
        updateTime: new Date().toISOString(),
        source: 'qq_music_daily_recommend'
      }
    };

    res.json(result);
    console.log(`✅ 每日推荐完成，返回 ${result.data.list.length} 首歌曲`);

  } catch (error) {
    console.error('❌ 获取每日推荐出错:', error);
    // 出错时返回精选热门歌曲
    const fallbackSongs = getPopularSongs();
    res.json({
      code: 0,
      data: {
        list: fallbackSongs.slice(0, 20),
        total: fallbackSongs.length,
        updateTime: new Date().toISOString(),
        source: 'fallback_popular_songs'
      }
    });
  }
});

// 精选热门歌曲 - 当推荐API不可用时使用
function getPopularSongs() {
  return [
    {
      id: '003OUlho2HcRHC',
      title: '稻香',
      artist: '周杰伦',
      album: '魔杰座',
      duration: 223,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003OUlho2HcRHC.jpg',
      songmid: '003OUlho2HcRHC'
    },
    {
      id: '004Z8Ihr0JIu5s',
      title: '青花瓷',
      artist: '周杰伦',
      album: '我很忙',
      duration: 237,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000004Z8Ihr0JIu5s.jpg',
      songmid: '004Z8Ihr0JIu5s'
    },
    {
      id: '002MiN3l3iTZto',
      title: '夜曲',
      artist: '周杰伦',
      album: '十一月的萧邦',
      duration: 237,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000002MiN3l3iTZto.jpg',
      songmid: '002MiN3l3iTZto'
    },
    {
      id: '001JdDVg1aNpWy',
      title: '告白气球',
      artist: '周杰伦',
      album: '周杰伦的床边故事',
      duration: 203,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001JdDVg1aNpWy.jpg',
      songmid: '001JdDVg1aNpWy'
    },
    {
      id: '003aAYrm3GE5XF',
      title: '七里香',
      artist: '周杰伦',
      album: '七里香',
      duration: 299,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003aAYrm3GE5XF.jpg',
      songmid: '003aAYrm3GE5XF'
    },
    {
      id: '000xdZuV4FjCJ8',
      title: '晴天',
      artist: '周杰伦',
      album: '叶惠美',
      duration: 269,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000xdZuV4FjCJ8.jpg',
      songmid: '000xdZuV4FjCJ8'
    },
    {
      id: '004emQMs09Z1lz',
      title: '简单爱',
      artist: '周杰伦',
      album: '范特西',
      duration: 269,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000004emQMs09Z1lz.jpg',
      songmid: '004emQMs09Z1lz'
    },
    {
      id: '001Qu4I30eVFYb',
      title: '彩虹',
      artist: '周杰伦',
      album: '我很忙',
      duration: 263,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001Qu4I30eVFYb.jpg',
      songmid: '001Qu4I30eVFYb'
    },
    {
      id: '003DFRzD2kxqaI',
      title: '东风破',
      artist: '周杰伦',
      album: '七里香',
      duration: 225,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003DFRzD2kxqaI.jpg',
      songmid: '003DFRzD2kxqaI'
    },
    {
      id: '000CK5xN2SkJYi',
      title: '花海',
      artist: '周杰伦',
      album: '魔杰座',
      duration: 262,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000CK5xN2SkJYi.jpg',
      songmid: '000CK5xN2SkJYi'
    },
    {
      id: '002sNbWp3royJG',
      title: '听妈妈的话',
      artist: '周杰伦',
      album: '依然范特西',
      duration: 252,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000002sNbWp3royJG.jpg',
      songmid: '002sNbWp3royJG'
    },
    {
      id: '001BLpXF2DyJe2',
      title: '千里之外',
      artist: '周杰伦',
      album: '依然范特西',
      duration: 223,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001BLpXF2DyJe2.jpg',
      songmid: '001BLpXF2DyJe2'
    },
    {
      id: '003bFXOp3ZZXeJ',
      title: '蒲公英的约定',
      artist: '周杰伦',
      album: '我很忙',
      duration: 233,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003bFXOp3ZZXeJ.jpg',
      songmid: '003bFXOp3ZZXeJ'
    },
    {
      id: '000tVl0N4FjCJ8',
      title: '安静',
      artist: '周杰伦',
      album: '范特西',
      duration: 330,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000tVl0N4FjCJ8.jpg',
      songmid: '000tVl0N4FjCJ8'
    },
    {
      id: '004Wv2NO2GjXs8',
      title: '园游会',
      artist: '周杰伦',
      album: '七里香',
      duration: 244,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000004Wv2NO2GjXs8.jpg',
      songmid: '004Wv2NO2GjXs8'
    },
    {
      id: '001TCp3N0HdKhK',
      title: '发如雪',
      artist: '周杰伦',
      album: '十一月的萧邦',
      duration: 299,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001TCp3N0HdKhK.jpg',
      songmid: '001TCp3N0HdKhK'
    },
    {
      id: '003RCA7t0y6du5',
      title: '世界末日',
      artist: '周杰伦',
      album: '叶惠美',
      duration: 237,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000003RCA7t0y6du5.jpg',
      songmid: '003RCA7t0y6du5'
    },
    {
      id: '002Zklgj2z8WMw',
      title: '手写的从前',
      artist: '周杰伦',
      album: '哎呦，不错哦',
      duration: 237,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000002Zklgj2z8WMw.jpg',
      songmid: '002Zklgj2z8WMw'
    },
    {
      id: '000MkMni19ClKG',
      title: '烟花易冷',
      artist: '周杰伦',
      album: '跨时代',
      duration: 262,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000MkMni19ClKG.jpg',
      songmid: '000MkMni19ClKG'
    },
    {
      id: '001hGJ1c0yWYsK',
      title: '等你下课',
      artist: '周杰伦',
      album: '等你下课',
      duration: 279,
      img: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000001hGJ1c0yWYsK.jpg',
      songmid: '001hGJ1c0yWYsK'
    }
  ];
}

// 处理OPTIONS请求（CORS预检）
app.options('/proxy/audio', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Range, Accept, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  res.status(200).end();
});

// 音频代理转发 - 解决CORS问题
app.get('/proxy/audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: '缺少URL参数' });
    }

    console.log(`🎧 代理音频请求: ${url}`);

    // 检查是否是QQ音乐链接 - 现在允许真实播放！
    if (url.includes('stream.qqmusic.qq.com') || url.includes('isure.stream.qqmusic.qq.com')) {
      console.log(`🎵 检测到QQ音乐链接，尝试直接播放真实音频: ${url}`);

      // 尝试直接代理QQ音乐链接
      try {
        const qqResponse = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'identity',
            'Range': 'bytes=0-',
            'Referer': 'https://y.qq.com/',
            'Origin': 'https://y.qq.com',
            'Sec-Fetch-Dest': 'audio',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Cookie': qqMusic.cookie || ''
          },
          timeout: 30000,
          responseType: 'stream'
        });

        if (qqResponse.status === 200 || qqResponse.status === 206) {
          console.log(`✅ QQ音乐链接访问成功，开始处理音频数据`);

          try {
            // 读取音频数据到缓冲区
            const chunks = [];
            qqResponse.data.on('data', chunk => chunks.push(chunk));
            qqResponse.data.on('end', () => {
              try {
                const buffer = Buffer.concat(chunks);
                console.log(`📦 音频数据大小: ${buffer.length} 字节`);

                // 如果数据太小，可能是错误响应
                if (buffer.length < 1000) {
                  console.log(`⚠️ 音频数据太小 (${buffer.length} 字节)，可能是错误响应`);
                  console.log(`🔍 响应内容: ${buffer.toString('utf8').substring(0, 200)}`);
                }

                // 暂时跳过解密，先确保基本功能正常
                console.log(`🎵 音频数据处理中...`);
                let finalBuffer = buffer;

                // 简单检查文件头
                const header = buffer.slice(0, 32).toString('hex');
                console.log(`� 文件头: ${header}`);

                if (header.includes('49443303') ||  // MP3 ID3
                    header.includes('664c6143') ||  // FLAC
                    header.includes('4f676753') ||  // OGG
                    header.includes('52494646') ||  // WAV/RIFF
                    header.includes('66747970')) {  // MP4/M4A ftyp
                  console.log(`✅ 检测到标准音频格式`);
                } else {
                  console.log(`🔒 可能是加密音乐，文件头: ${header}`);
                  // 暂时不解密，直接返回原始数据
                }

                // 设置响应头 - 支持多种音频格式
                let audioType = 'audio/mpeg';
                if (url.includes('.m4a') || url.includes('C400')) {
                  audioType = 'audio/mp4';
                } else if (url.includes('.mp3') || url.includes('M500')) {
                  audioType = 'audio/mpeg';
                } else if (url.includes('.ogg')) {
                  audioType = 'audio/ogg';
                } else if (url.includes('.flac')) {
                  audioType = 'audio/flac';
                }

                console.log(`🎵 最终音频格式: ${audioType}`);

                const headers = {
                  'Content-Type': audioType,
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
                  'Access-Control-Allow-Headers': 'Content-Type, Range, Accept, Authorization',
                  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
                  'Accept-Ranges': 'bytes',
                  'Cache-Control': 'public, max-age=3600',
                  'Cross-Origin-Resource-Policy': 'cross-origin',
                  'Cross-Origin-Embedder-Policy': 'unsafe-none',
                  'Content-Length': finalBuffer.length
                };

                res.set(headers);
                res.send(finalBuffer);
                console.log(`🎵 音频处理完成，已发送给客户端！`);
              } catch (processError) {
                console.error('❌ 音频处理错误:', processError);
                if (!res.headersSent) {
                  res.status(500).json({ error: '音频处理失败', details: processError.message });
                }
              }
            });

            qqResponse.data.on('error', (error) => {
              console.error('❌ 音频流读取错误:', error);
              if (!res.headersSent) {
                res.status(500).json({ error: '音频流读取失败' });
              }
            });
          } catch (streamError) {
            console.error('❌ 音频流处理错误:', streamError);
            if (!res.headersSent) {
              res.status(500).json({ error: '音频流处理失败', details: streamError.message });
            }
          }

          return;
        } else {
          console.log(`❌ QQ音乐链接访问失败: ${qqResponse.status}`);
          if (qqResponse.status === 403) {
            console.log(`🔒 可能是VIP音乐，需要特殊权限或解密处理`);
            return res.status(403).json({
              error: 'VIP音乐访问受限',
              message: '这可能是VIP音乐，需要会员权限或特殊解密处理',
              suggestion: '请尝试非VIP音乐或使用解密工具: https://tool.liumingye.cn/music/unlock-music/',
              status: qqResponse.status
            });
          }
          return res.status(qqResponse.status).json({
            error: 'QQ音乐链接访问失败',
            status: qqResponse.status
          });
        }
      } catch (error) {
        console.log(`❌ QQ音乐链接代理出错: ${error.message}`);
        return res.status(500).json({
          error: 'QQ音乐链接代理失败',
          details: error.message
        });
      }
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity',
        'Range': 'bytes=0-',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Sec-Fetch-Dest': 'audio',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      timeout: 30000,
      responseType: 'stream'
    });

    if (response.status !== 200) {
      console.error(`❌ 代理请求失败: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: '代理请求失败' });
    }

    // 设置响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    // 转发音频流
    response.data.pipe(res);
    console.log(`✅ 音频代理成功`);

  } catch (error) {
    console.error('❌ 音频代理出错:', error);
    res.status(500).json({ error: '音频代理失败', details: error.message });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ error: '服务器内部错误', details: error.message });
});

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎵 QQ音乐API服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🎯 测试接口: http://localhost:${PORT}/search?key=周杰伦`);
});

module.exports = app;
