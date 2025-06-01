const { Client } = require('pg');

// Neon数据库连接配置
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_dL6zkQwKx8SU@ep-silent-tooth-a4e4s9ns-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function setupDatabase() {
  try {
    console.log('🚀 连接到Neon数据库...');
    await client.connect();
    
    console.log('✅ 数据库连接成功！');
    
    // 检查数据库版本
    const versionResult = await client.query('SELECT version()');
    console.log('📊 数据库版本:', versionResult.rows[0].version);
    
    // 创建联系表单数据表
    console.log('🔧 创建contact_submissions表...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'new',
        ip_address INET,
        user_agent TEXT
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ contact_submissions表创建成功！');
    
    // 创建索引以提高查询性能
    console.log('🔧 创建索引...');
    
    const createIndexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);',
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);'
    ];
    
    for (const query of createIndexQueries) {
      await client.query(query);
    }
    
    console.log('✅ 索引创建成功！');
    
    // 检查表结构
    console.log('📋 检查表结构...');
    const tableInfoQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'contact_submissions' 
      ORDER BY ordinal_position;
    `;
    
    const tableInfo = await client.query(tableInfoQuery);
    console.log('📊 表结构:');
    console.table(tableInfo.rows);
    
    // 插入测试数据
    console.log('🧪 插入测试数据...');
    const insertTestData = `
      INSERT INTO contact_submissions (name, email, message) 
      VALUES 
        ('测试用户', 'test@example.com', '这是一条测试消息，用于验证数据库功能。'),
        ('浪客哟', 'langkeyo@example.com', '你好！我对你的设计服务很感兴趣，希望能进一步了解。')
      ON CONFLICT DO NOTHING;
    `;
    
    await client.query(insertTestData);
    console.log('✅ 测试数据插入成功！');
    
    // 查询数据验证
    console.log('🔍 验证数据...');
    const selectQuery = 'SELECT id, name, email, LEFT(message, 50) as message_preview, created_at FROM contact_submissions ORDER BY created_at DESC;';
    const result = await client.query(selectQuery);
    
    console.log('📊 当前数据:');
    console.table(result.rows);
    
    console.log('🎉 数据库设置完成！');
    console.log('');
    console.log('📝 表信息:');
    console.log('- 表名: contact_submissions');
    console.log('- 字段: id, name, email, message, created_at, status, ip_address, user_agent');
    console.log('- 索引: created_at, status, email');
    console.log('');
    console.log('🔗 连接字符串已配置，可以在Angular应用中使用');
    
  } catch (error) {
    console.error('❌ 数据库设置失败:', error);
  } finally {
    await client.end();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行设置脚本
setupDatabase();
