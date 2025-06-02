const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: '测试服务器运行中' });
});

app.get('/test', (req, res) => {
  res.json({ message: '测试成功' });
});

app.listen(PORT, () => {
  console.log(`🎵 测试服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
});

console.log('服务器脚本执行完成');
