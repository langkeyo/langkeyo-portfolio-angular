// Cloudflare Worker for Langkeyo Portfolio Contact Form
// 处理表单提交 + 数据库存储 + 邮件发送

export default {
  async fetch(request, env, ctx) {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 只处理POST请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // 解析表单数据
      const formData = await request.json();
      const { name, email, message } = formData;

      // 验证必填字段
      if (!name || !email || !message) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '请填写所有必填字段' 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      // 获取客户端信息
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || 
                      'unknown';
      const userAgent = request.headers.get('User-Agent') || 'unknown';

      // 直接使用Neon连接字符串
      const connectionString = `postgresql://neondb_owner:${env.NEON_PASSWORD}@nameless-resonance-40986303-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`;

      // 连接数据库并插入数据
      const { Client } = await import('pg');
      const client = new Client({ connectionString });
      
      await client.connect();

      const insertQuery = `
        INSERT INTO contact_submissions (name, email, message, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `;

      const result = await client.query(insertQuery, [
        name,
        email,
        message,
        clientIP,
        userAgent
      ]);

      await client.end();

      const submissionId = result.rows[0].id;
      const submissionTime = result.rows[0].created_at;

      // 发送邮件通知使用Resend
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contact@langkeyo.top',
            to: ['2608563915@qq.com'], // 你的QQ邮箱
            subject: `新联系表单提交 - ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #e91e63;">新的联系表单提交 - Langkeyo Design</h2>

                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>提交ID:</strong> ${submissionId}</p>
                  <p><strong>提交时间:</strong> ${new Date(submissionTime).toLocaleString('zh-CN')}</p>
                </div>

                <h3 style="color: #333;">联系人信息:</h3>
                <div style="background: #fff; padding: 15px; border-left: 4px solid #00bcd4; margin: 10px 0;">
                  <p><strong>姓名:</strong> ${name}</p>
                  <p><strong>邮箱:</strong> <a href="mailto:${email}">${email}</a></p>
                </div>

                <h3 style="color: #333;">留言内容:</h3>
                <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin: 10px 0;">
                  <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                </div>

                <h3 style="color: #333;">技术信息:</h3>
                <div style="background: #f9f9f9; padding: 10px; font-size: 12px; color: #666;">
                  <p><strong>IP地址:</strong> ${clientIP}</p>
                  <p><strong>浏览器:</strong> ${userAgent}</p>
                </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #999; font-size: 12px;">
                  来自 <a href="https://langkeyo.top" style="color: #e91e63;">langkeyo.top</a> 作品集网站
                </p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log('Email sent successfully');
        } else {
          console.error('Email sending failed:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // 邮件发送失败不影响表单提交成功
      }

      // 返回成功响应
      return new Response(
        JSON.stringify({
          success: true,
          message: '消息发送成功！我会尽快回复您。',
          submissionId: submissionId,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } catch (error) {
      console.error('Error processing form submission:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: '服务器错误，请稍后重试',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
