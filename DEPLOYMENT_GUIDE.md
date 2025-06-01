# 🚀 Langkeyo Portfolio 联系表单部署指南

## 📋 部署清单

### ✅ 第一步：部署Cloudflare Worker

1. **登录Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com
   - 左侧菜单 → **Workers & Pages**

2. **创建新Worker**
   - 点击 **"Create"** → **"Create Worker"**
   - 名称：`langkeyo-contact-api`

3. **复制Worker代码**
   - 将 `cloudflare-worker.js` 的完整代码复制到编辑器
   - 点击 **"Save and Deploy"**

4. **配置环境变量**
   - 点击 **"Settings"** 标签
   - 找到 **"Environment Variables"**
   - 添加以下变量：
     ```
     NEON_PASSWORD = npg_dL6zkQwKx8SU
     RESEND_API_KEY = re_BEMHrBpD_NuJ54wtiAx29bKY6QTpa9G8a
     ```

5. **获取Worker URL**
   - 复制Worker的URL（类似：`https://langkeyo-contact-api.your-subdomain.workers.dev`）

### ✅ 第二步：配置自定义域名（可选）

1. **添加自定义域名**
   - 在Worker设置中，找到 **"Triggers"**
   - 点击 **"Add Custom Domain"**
   - 输入：`contact-api.langkeyo.top`
   - 保存配置

### ✅ 第三步：更新Angular应用

1. **修改API URL**
   - 打开 `src/app/components/contact/contact.ts`
   - 将第38行的URL替换为你的实际Worker URL：
     ```typescript
     'https://langkeyo-contact-api.your-subdomain.workers.dev'
     // 或者如果配置了自定义域名：
     'https://contact-api.langkeyo.top'
     ```

2. **重新构建应用**
   ```bash
   pnpm run build
   ```

3. **推送到GitHub**
   ```bash
   git add .
   git commit -m "🚀 Add contact form API integration with Resend email"
   git push
   ```

### ✅ 第四步：测试功能

1. **等待GitHub Actions部署完成**
   - 访问：https://github.com/langkeyo/langkeyo-portfolio-angular/actions
   - 确认最新的部署成功

2. **测试联系表单**
   - 访问：https://langkeyo.github.io/langkeyo-portfolio-angular/
   - 滚动到联系表单部分
   - 填写测试信息：
     ```
     姓名：测试用户
     邮箱：test@example.com
     留言：这是一条测试消息，验证联系表单功能。
     ```
   - 点击"发送消息"

3. **验证结果**
   - ✅ 表单显示"消息发送成功"
   - ✅ 检查QQ邮箱是否收到通知邮件
   - ✅ 在Neon数据库中查看数据是否保存

## 🔍 故障排除

### 如果表单提交失败：

1. **检查Worker日志**
   - Cloudflare Dashboard → Workers → langkeyo-contact-api → Logs
   - 查看错误信息

2. **检查环境变量**
   - 确认 `NEON_PASSWORD` 和 `RESEND_API_KEY` 设置正确

3. **检查CORS设置**
   - 确认Worker代码中的CORS配置正确

### 如果邮件发送失败：

1. **验证Resend配置**
   - 确认API Key有效
   - 检查发送域名配置

2. **检查邮箱地址**
   - 确认QQ邮箱地址正确
   - 检查垃圾邮件文件夹

## 📊 功能验证

### ✅ 完整功能测试清单：

- [ ] 表单验证（必填字段）
- [ ] 数据提交到Neon数据库
- [ ] 邮件通知发送到QQ邮箱
- [ ] 成功/失败消息显示
- [ ] 表单重置功能
- [ ] 加载状态显示

## 🎉 部署完成！

恭喜！你的现代化Angular作品集现在具备了：

- ✅ **完整的联系表单功能**
- ✅ **数据库存储**（Neon PostgreSQL）
- ✅ **邮件通知**（Resend + QQ邮箱）
- ✅ **现代化设计**（Angular 20 + Tailwind CSS）
- ✅ **自动化部署**（GitHub Actions + GitHub Pages）

你的作品集网站现在是一个真正的全栈应用！🚀
