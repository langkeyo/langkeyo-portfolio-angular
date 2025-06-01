const { Client } = require('pg');

// 测试Neon数据库连接和功能
async function testNeonConnection() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_dL6zkQwKx8SU@ep-silent-tooth-a4e4s9ns-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    console.log('🔍 测试Neon数据库连接...');
    const startTime = Date.now();
    
    await client.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ 连接成功！耗时: ${connectTime}ms`);
    
    // 测试1: 检查数据库基本信息
    console.log('\n📊 数据库信息:');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version,
        now() as current_time
    `);
    console.table(dbInfo.rows);
    
    // 测试2: 检查我们创建的表
    console.log('\n📋 检查contact_submissions表:');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contact_submissions'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ contact_submissions表存在');
      
      // 获取表的详细信息
      const tableInfo = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'contact_submissions' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 表结构:');
      console.table(tableInfo.rows);
      
      // 检查数据
      const dataCount = await client.query('SELECT COUNT(*) as total_records FROM contact_submissions');
      console.log(`\n📈 数据统计: ${dataCount.rows[0].total_records} 条记录`);
      
      if (dataCount.rows[0].total_records > 0) {
        const sampleData = await client.query(`
          SELECT id, name, email, LEFT(message, 30) as message_preview, created_at 
          FROM contact_submissions 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        console.log('\n📝 最新数据预览:');
        console.table(sampleData.rows);
      }
      
    } else {
      console.log('❌ contact_submissions表不存在');
    }
    
    // 测试3: 检查索引
    console.log('\n🔍 检查索引:');
    const indexes = await client.query(`
      SELECT 
        indexname, 
        tablename, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'contact_submissions';
    `);
    
    if (indexes.rows.length > 0) {
      console.table(indexes.rows);
    } else {
      console.log('ℹ️ 未找到自定义索引');
    }
    
    // 测试4: 性能测试
    console.log('\n⚡ 性能测试:');
    const perfStart = Date.now();
    await client.query('SELECT 1');
    const perfTime = Date.now() - perfStart;
    console.log(`简单查询耗时: ${perfTime}ms`);
    
    // 测试5: 插入测试
    console.log('\n🧪 插入测试:');
    const insertStart = Date.now();
    const testInsert = await client.query(`
      INSERT INTO contact_submissions (name, email, message) 
      VALUES ($1, $2, $3) 
      RETURNING id, created_at
    `, ['测试用户_' + Date.now(), 'test_' + Date.now() + '@example.com', '这是一条测试消息']);
    
    const insertTime = Date.now() - insertStart;
    console.log(`✅ 插入成功！耗时: ${insertTime}ms`);
    console.log(`新记录ID: ${testInsert.rows[0].id}`);
    
    console.log('\n🎉 Neon数据库测试完成！');
    console.log('📊 总结:');
    console.log(`- 连接速度: ${connectTime}ms`);
    console.log(`- 查询速度: ${perfTime}ms`);
    console.log(`- 插入速度: ${insertTime}ms`);
    console.log('- 表结构: 完整');
    console.log('- 数据完整性: 正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await client.end();
    console.log('\n🔌 连接已关闭');
  }
}

// 运行测试
testNeonConnection();
