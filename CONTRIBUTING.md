# 贡献指南

这是一个服务于**华东师大 347 应用心理学专硕考研**的开源刷题网站。
最需要的贡献是**题目**，其次是前端与体验改进。

- 发布流程见 [RELEASE.md](./RELEASE.md)
- 让 AI 助手接手本项目时，见 [AGENTS.md](./AGENTS.md)

## 开发环境

需要 Node.js 20 或更高（本项目开发环境为 Node 26）。

```bash
npm install
npm run dev                # 开发服务器，默认 http://localhost:5173
npm run validate:questions # 校验题库，必须通过
npm run build              # 类型检查 + 构建到 dist/
npm run preview            # 预览构建产物
```

技术栈：Vite 7 · React 19 · TypeScript 5.7 · Tailwind CSS v4 · lucide-react

## 贡献题目

题库是 `public/questions.json`，是**运行时**拉取的文件（`fetch('/questions.json')`），
不是构建期导入的模块。格式说明见 [README](./README.md#题库格式)。

### 硬性要求

1. **提交前必须跑 `npm run validate:questions` 并且零 error。**
   它会检查：JSON 合法性、章节字段、题目 id 章内唯一、题型合法、
   `single` 的 answer 是界内整数、`multi` 的 answer 是无重复的界内整数数组、
   `subjective` 有非空字符串答案。
2. 客观题（`single` / `multi`）**必须写 `explain`**（解析）。校验器对此只报警告，
   但这是本项目的约定——没有解析的题对备考价值很低。
3. **不要提交受版权保护的内容。** 本项目是 CC BY-NC-SA 4.0 非商用开源项目：
   - ✅ 可以：你自己出的题、公开的考试大纲衍生题、政府/考试院公开发布的材料
   - ⚠️ 仅可链接、不要复制：教材原文、付费课程讲义、市面上售卖的真题汇编
   - ❌ 不要：逐字照搬受版权保护的教材或商业题库
4. 选项数量：UI 支持 A–Z 任意数量，但**超过 4 个选项时请确认这是有意的**
   （347 单选题通常为 A–D）。

### 题目质量建议

- 单选题干扰项要"像真的"——用常见混淆概念，不要凑数
- 主观题的 `answer` 写**答案要点**（阅卷给分点），不是长篇大论
- 一道题只考一个知识点，便于错题归因

## 贡献代码

- 优先改 `src/App.tsx`（目前是单体组件）与 `src/utils/`、`src/context/`
- 提交前必须 `npm run build` 通过（`tsc -b` 会做类型检查）
- 不要提交 `dist/`（已 gitignore，由 Vercel / Cloudflare Pages 从源码构建）
- 保持既有视觉风格：深蓝底色 `#0c1222`、卡片 `#162032`、主色 `blue-500`

### 已知的坑（改代码前请读）

- **不要在 `src/index.css` 里放无层级的全局 reset**（例如 `* { margin: 0; padding: 0 }`）。
  Tailwind v4 的 utilities 在 `@layer utilities` 里，而无层级 CSS 优先级高于所有 `@layer`，
  这会让全站 `p-*` / `m-*` / `space-y-*` 静默失效。Tailwind preflight 已提供 box-sizing 与归零。
- **`public/` 下的 `README.md` / `CHANGELOG.md` 是公开可访问的副本**，
  修改根目录同名文件后必须同步过去（见 RELEASE.md 检查清单）。
- 选项字母要用 `letterAt(i)`，**不要硬编码 `['A','B','C','D']`**——题库里有 6 选项的题。

## 提交信息规范

使用 Conventional Commits，中文描述，格式 `type: 描述`。
本项目在标准类型之外**额外使用 `design:`** 表示纯 UI/样式改动（沿用历史习惯）。

| type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修 bug |
| `design` | UI / 样式 / 交互改动（本项目自定义） |
| `docs` | 文档、CHANGELOG |
| `chore` | 构建、依赖、清理 |
| `refactor` | 不改行为的重构 |
| `perf` | 性能 |
| `test` | 测试 |

示例：

```
fix: 错题本刷新后被清空
design: 恢复全站留白并重构仪表盘
chore: 移除未被引用的 src/components 死代码
```

一个提交只做一件事。**功能修复与设计重构不要混在同一个提交里**，便于回滚。

## 分支与 Pull Request

1. Fork 本仓库
2. 分支命名：`feature/add-ch7`、`fix/wrongbook-persist`、`docs/update-readme`
3. 提交前自查：`npm run validate:questions && npm run build`
4. 发起 Pull Request，说明**改了什么、为什么、怎么验证的**

题目类 PR 请说明题目来源，以及是否涉及版权材料。

也可以直接提 Issue 报告 Bug 或建议新功能。
