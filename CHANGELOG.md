# Changelog

所有重要更新都会记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [v1.0.0] - 2026-09-17

### Added
- 章节切换刷题（单选 / 多选 / 主观题）
- 提交判卷 + 解析展示
- 按章节正确率统计（侧边栏彩色徽章：绿≥80%、黄60-79%、红<60%）
- 底部操作栏显示当前章进度
- 顶部全局累计答题统计
- 移动端响应式布局（下拉选单选章、卡片适配、纵向操作栏）
- 每日英语训练自动追加（cron 定时任务）
- 每日变种题自动生成
- 非商用许可（CC BY-NC-SA 4.0）

### Deployed
- Vercel: https://psychology-quiz-app-gilt.vercel.app/
- Cloudflare Pages: https://psychology-quiz-app.pages.dev/

## [v1.1.0] - 2026-09-17

### Added
- 📕 错题本功能：做错题目自动收集到错题本
- 侧边栏可进入错题本，集中重做错题
- 错题计数徽章实时更新
- 移动端下拉菜单也支持错题本
- ch3/ch4/ch6 各新增 3-5 道变种题（选项打乱+新题型）
