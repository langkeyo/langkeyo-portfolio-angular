// 简单的邮件通知Worker (可以作为第二个Worker或集成到主Worker中)

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { submissionId, name, email, message, time } = data;

      // 使用Resend API发送邮件 (推荐)
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@langkeyo.top',
          to: ['your-email@gmail.com'], // 你的个人邮箱
          subject: `新联系表单提交 - ${name}`,
          html: `
            <h2>新的联系表单提交</h2>
            <p><strong>提交ID:</strong> ${submissionId}</p>
            <p><strong>提交时间:</strong> ${time}</p>
            <hr>
            <h3>联系人信息:</h3>
            <p><strong>姓名:</strong> ${name}</p>
            <p><strong>邮箱:</strong> ${email}</p>
            <h3>留言内容:</h3>
            <p>${message}</p>
            <hr>
            <p><small>来自 langkeyo.top 作品集网站</small></p>
          `,
        }),
      });

      if (emailResponse.ok) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error('Email sending failed');
      }

    } catch (error) {
      console.error('Email notification error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};
