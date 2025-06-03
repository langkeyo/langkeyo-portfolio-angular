const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS - 允许所有来源（生产环境中应该限制）
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// QQ音乐Cookie配置
const QQ_MUSIC_COOKIE = `RK=ab9QGFd+wQ; ptcz=e94994051efde8b20517d2e4121a301c59e59f8d408452c173fce5de132a41a5; pgv_pvid=574510342; fqm_pvqid=23a6beb5-8a9b-4e68-82aa-d927ef325392; fqm_sessionid=f47e28eb-6c11-4de3-80be-9f2c8c6b1ebd; pgv_info=ssid=s3512205230; ts_uid=3539329950; _qpsvr_localtk=0.3818803016933282; login_type=1; psrf_qqunionid=C0F222D1051F980B640220A2F28382EF; qqmusic_key=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; euin=owCzNe4soiE57v**; wxunionid=; psrf_qqrefresh_token=F4F1B747D31420233B19733A6E2BE226; music_ignore_pskey=202306271436Hn@vBj; psrf_qqopenid=A75C77C7C22D1E6A334A2C1B242B7F8F; psrf_qqaccess_token=697E873EB6D414B6814C7131E17A4ADB; psrf_access_token_expiresAt=1754039989; tmeLoginType=2; psrf_musickey_createtime=1748855989; wxopenid=; uin=2608563915; wxrefresh_token=; qm_keyst=Q_H_L_63k3N2L72wf4_1ATr-UiapDekOHqqIrF1gajrzdTka371FdSdqmK9bAGN_eBmEwJ-RgunofdRVyLSpMsopAHxZvlymaU; ts_refer=www.google.com/; yqq_stat=0; ct=11; cv=11; ts_last=y.qq.com/n/ryqq/profile`;

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'QQ音乐代理服务器运行中',
    status: 'running',
    time: new Date().toISOString(),
    endpoints: [
      'POST /api/search - 搜索音乐',
      'POST /api/song/url - 获取播放链接'
    ]
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 搜索音乐代理
app.post('/api/search', async (req, res) => {
  try {
    const { keyword, pageNo = 1, pageSize = 20 } = req.body;
    
    console.log(`🔍 代理搜索: ${keyword}`);
    
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

    const response = await axios.post('https://u.y.qq.com/cgi-bin/musicu.fcg', searchData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': QQ_MUSIC_COOKIE
      },
      timeout: 10000
    });

    const data = response.data;
    
    if (!data.req || !data.req.data || !data.req.data.body) {
      return res.json({
        code: 0,
        data: {
          list: [],
          total: 0,
          pageNo: pageNo,
          pageSize: pageSize
        }
      });
    }

    // 转换为标准格式
    const songs = data.req.data.body.song.list.map(song => ({
      id: song.mid,
      title: htmlDecode(song.name),
      artist: htmlDecode(song.singer[0].name),
      album: htmlDecode(song.album.name),
      duration: song.interval,
      img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
      albumId: song.album.mid,
      artistId: song.singer[0].mid,
      songmid: song.mid
    }));

    const result = {
      code: 0,
      data: {
        list: songs,
        total: data.req.data.meta.sum,
        pageNo: pageNo,
        pageSize: pageSize
      }
    };

    console.log(`✅ 代理搜索成功，返回 ${songs.length} 首歌曲`);
    res.json(result);

  } catch (error) {
    console.error('❌ 代理搜索失败:', error.message);
    res.status(500).json({
      code: -1,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 兼容Angular应用的GET搜索接口
app.get('/search', async (req, res) => {
  try {
    const { key: keyword, pageNo = 1, pageSize = 20 } = req.query;

    if (!keyword) {
      return res.json({
        code: -1,
        message: '搜索关键词不能为空'
      });
    }

    console.log(`🔍 GET代理搜索: ${keyword}`);

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
          num_per_page: parseInt(pageSize),
          page_num: parseInt(pageNo),
          query: keyword,
          search_type: 0,
        },
      },
    };

    const response = await axios.post('https://u.y.qq.com/cgi-bin/musicu.fcg', searchData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': QQ_MUSIC_COOKIE
      },
      timeout: 10000
    });

    const data = response.data;

    if (!data.req || !data.req.data || !data.req.data.body) {
      return res.json({
        code: 0,
        data: {
          list: [],
          total: 0,
          pageNo: parseInt(pageNo),
          pageSize: parseInt(pageSize)
        }
      });
    }

    // 转换为标准格式
    const songs = data.req.data.body.song.list.map(song => ({
      id: song.mid,
      title: htmlDecode(song.name),
      artist: htmlDecode(song.singer[0].name),
      album: htmlDecode(song.album.name),
      duration: song.interval,
      img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
      albumId: song.album.mid,
      artistId: song.singer[0].mid,
      songmid: song.mid
    }));

    const result = {
      code: 0,
      data: {
        list: songs,
        total: data.req.data.meta.sum,
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
      }
    };

    console.log(`✅ GET代理搜索成功，返回 ${songs.length} 首歌曲`);
    res.json(result);

  } catch (error) {
    console.error('❌ GET代理搜索失败:', error.message);
    res.status(500).json({
      code: -1,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 兼容Angular应用的GET播放链接接口
app.get('/song/urls', async (req, res) => {
  try {
    const { id: songmid } = req.query;

    if (!songmid) {
      return res.json({
        code: -1,
        message: '歌曲ID不能为空'
      });
    }

    console.log(`🎵 GET代理获取播放链接: ${songmid}`);

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

    const sign = generateSimpleSign(JSON.stringify(data));
    const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?sign=${sign}&_=${Date.now()}`;

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': QQ_MUSIC_COOKIE
      },
      timeout: 10000
    });

    const result = response.data;

    if (result.req_0 && result.req_0.data) {
      const data = result.req_0.data;

      if (data.midurlinfo && data.midurlinfo[0]) {
        const purl = data.midurlinfo[0].purl;
        if (purl) {
          const playUrl = `http://ws.stream.qqmusic.qq.com/${purl}`;
          console.log(`✅ GET代理获取播放链接成功: ${songmid}`);
          return res.json({
            [songmid]: playUrl,
            url: playUrl
          });
        }
      }

      if (data.testfilewifi || data.testfile2g) {
        const testUrl = data.testfilewifi || data.testfile2g;
        if (testUrl.includes('?')) {
          const playUrl = `http://ws.stream.qqmusic.qq.com/${testUrl}`;
          console.log(`✅ GET代理获取测试链接成功: ${songmid}`);
          return res.json({
            [songmid]: playUrl,
            url: playUrl
          });
        }
      }
    }

    console.log(`⚠️ GET代理无法获取播放链接: ${songmid}`);
    res.json({
      [songmid]: null,
      url: null
    });

  } catch (error) {
    console.error('❌ GET代理获取播放链接失败:', error.message);
    res.status(500).json({
      code: -1,
      message: '获取播放链接失败',
      error: error.message
    });
  }
});

// 音频代理接口
app.get('/proxy/audio', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: '缺少URL参数' });
    }

    console.log(`🎧 代理音频: ${url}`);

    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://y.qq.com/',
        'Accept': 'audio/*,*/*;q=0.9',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': QQ_MUSIC_COOKIE
      },
      timeout: 30000
    });

    // 设置响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Content-Length': response.headers['content-length'],
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Range, Content-Length'
    });

    // 管道传输音频数据
    response.data.pipe(res);

  } catch (error) {
    console.error('❌ 音频代理失败:', error.message);
    res.status(500).json({ error: '音频代理失败' });
  }
});

// 获取播放链接代理
app.post('/api/song/url', async (req, res) => {
  try {
    const { songmid } = req.body;
    
    console.log(`🎵 代理获取播放链接: ${songmid}`);
    
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

    const sign = generateSimpleSign(JSON.stringify(data));
    const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?sign=${sign}&_=${Date.now()}`;

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://y.qq.com/',
        'Origin': 'https://y.qq.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': QQ_MUSIC_COOKIE
      },
      timeout: 10000
    });

    const result = response.data;
    
    if (result.req_0 && result.req_0.data) {
      const data = result.req_0.data;
      
      if (data.midurlinfo && data.midurlinfo[0]) {
        const purl = data.midurlinfo[0].purl;
        if (purl) {
          const playUrl = `http://ws.stream.qqmusic.qq.com/${purl}`;
          console.log(`✅ 代理获取播放链接成功: ${songmid}`);
          return res.json({
            code: 0,
            data: {
              url: playUrl
            }
          });
        }
      }
      
      if (data.testfilewifi || data.testfile2g) {
        const testUrl = data.testfilewifi || data.testfile2g;
        if (testUrl.includes('?')) {
          const playUrl = `http://ws.stream.qqmusic.qq.com/${testUrl}`;
          console.log(`✅ 代理获取测试链接成功: ${songmid}`);
          return res.json({
            code: 0,
            data: {
              url: playUrl
            }
          });
        }
      }
    }
    
    console.log(`⚠️ 代理无法获取播放链接: ${songmid}`);
    res.json({
      code: -1,
      message: '无法获取播放链接'
    });

  } catch (error) {
    console.error('❌ 代理获取播放链接失败:', error.message);
    res.status(500).json({
      code: -1,
      message: '获取播放链接失败',
      error: error.message
    });
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

// 简化的sign生成函数
function generateSimpleSign(data) {
  const crypto = require('crypto');
  const fixedString = 'CJBPACrRuNy7';
  const hash = crypto.createHash('md5').update(fixedString + data).digest('hex');
  
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomPrefix = 'zza';
  const randomLength = Math.floor(Math.random() * 7 + 10);
  
  for (let i = 0; i < randomLength; i++) {
    randomPrefix += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return randomPrefix + hash;
}

app.listen(PORT, () => {
  console.log(`🎵 QQ音乐代理服务器运行在端口 ${PORT}`);
  console.log(`🌐 服务器地址: http://localhost:${PORT}`);
  console.log(`✅ 服务器启动成功，支持GET和POST接口`);
});
