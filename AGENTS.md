# AGENTS.md

给接手本项目的 AI 助手的说明。**动手前请先读 [CONTRIBUTING.md](./CONTRIBUTING.md)
与 [RELEASE.md](./RELEASE.md)**，那里有完整规范；这里只列最关键的上下文与红线。

## 项目与目标

面向**华东师大 347 应用心理学专硕考研**的刷题网站，作者自己也用它备考，
考试在**今年 12 月**。所以判断一切改动价值的标准是：
**能否帮助用户在 12 月的 347 考试上拿分。**

考试结构（300 分）：单选 20×2 · 名词解释 5×10 · 简答 3×10 · 问答 3×20 ·
论述 2×30 · 实验设计 1×50。
**其中 250 分是主观题** —— 这一点直接决定了优先级（见下）。

## 架构要点

- `src/App.tsx` —— **单体组件**，含全部 UI 与交互（约 420 行）。
  `src/components/` 曾经存在但是死代码，已删除，不要重新引入。
- `public/questions.json` —— 题库，**运行时 `fetch('/questions.json')` 拉取**，
  不是构建期 import。改题库不需要改代码。
- `src/context/QuizContext.tsx` —— 状态与 localStorage 持久化。
  存储键：`quiz_wrong_book`、`quiz_<chId>_<qId>`、`quiz_subj_<chId>`、`quiz_theme`。
- 判分契约（重要）：`single` 存**数字索引**，`multi` 存**索引数组**。
  改 UI 时不要破坏这个契约，`src/utils/grading.ts` 依赖它。
- 选项字母用 `letterAt(i)`（支持 A–Z），**不要硬编码 `['A','B','C','D']`**。

## 红线

1. `src/index.css` **不要放无层级的全局 reset** —— 会静默废掉全站 Tailwind 间距工具类。
2. 改完必须 `npm run validate:questions && npm run build` 都通过。
3. `public/README.md`、`public/CHANGELOG.md` 是**公开可访问的副本**，改了根目录同名文件必须同步。
4. 每次确认的更新都要**发版**：CHANGELOG + 版本号 + 附注 tag + GitHub Release，
   流程见 RELEASE.md。推 `main` 会触发两条生产部署，推之前确保构建通过。
5. `legacy/` 在 `.gitignore` 里，**不在仓库中**。不要写"见 legacy/xxx"这类对
   外部贡献者无效的指引。
6. 题库内容注意版权：本项目 CC BY-NC-SA 4.0 非开源商用，
   不要复制受版权保护的教材或商业题库内容。

## 当前已知的缺口（按价值排序）

1. **主观题完全无法练习** —— `App.tsx` 里 `filter(q => q.type !== 'subjective')`
   把主观题排除在刷题之外，题库里 45 道主观题没有任何入口。
   而考试 250/300 分是主观题。**这是当前最大的产品缺口。**
2. **错题本只能增不能减** —— `removeWrong` 已在 context 中实现但 UI 从未调用。
3. **深色主题写死** —— `theme` / `toggleTheme` 状态与 localStorage 都在，但没有切换入口。
4. **无数据导出/导入** —— 学习进度只存在 localStorage，清浏览器数据即丢失。
5. **无自动化测试** —— 目前只有 `scripts/validate-questions.mjs` 校验题库。

## 环境

- 本机 GitHub 直连不通，git 已配置只对 github.com 走代理（见 RELEASE.md）。
- **PowerShell 5.1 读无 BOM 的 UTF-8 脚本会把中文读成乱码**，
  中文一律走独立文件 + `-Encoding UTF8`，不要放进命令行参数。
- 验证 UI 改动：本机有 Edge，可用 headless 截图
  （`msedge.exe --headless=new --screenshot=... --virtual-time-budget=8000 <url>`），
  需要交互时用 CDP（Node 26 自带 `WebSocket`，无需装依赖）。
