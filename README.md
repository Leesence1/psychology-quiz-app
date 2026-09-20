# 347 心理学考研刷题网站

**在线刷题：**
- 国内（可直连）：https://psychology-quiz-app.pages.dev/ — Cloudflare Pages
- 海外：https://psychology-quiz-app-gilt.vercel.app/ — Vercel

> 实测：`pages.dev` 国内可直连；`vercel.app` 国内直连超时，需自备代理。

v2.1.0 — React 19 + TypeScript + Tailwind CSS v4 + Vite，深蓝主题 UI。

## 快速开始

```bash
npm install
npm run dev       # 本地开发，默认 http://localhost:5173
npm run build     # 类型检查 + 构建到 dist/
npm run preview   # 本地预览构建产物
```

## 技术栈

- 构建：Vite 7
- 前端：React 19 + TypeScript 5.7
- 样式：Tailwind CSS v4（`@tailwindcss/vite` 插件）
- 图标：lucide-react
- 数据：`public/questions.json`，构建时原样复制到 `dist/`
- 部署：Vercel / Cloudflare Pages，均从源码构建

v1 的原生 HTML/CSS/JS 单文件版本**未纳入版本控制**（`legacy/` 已在 `.gitignore` 中），
仓库内只保留 v2 的 React 实现。

## 题库格式

题库文件为 `public/questions.json`，结构如下：

```json
[
  {
    "id": "ch3",
    "title": "第三章 条件反射和学习",
    "questions": [
      {
        "type": "single",
        "id": 1,
        "q": "题目内容",
        "options": ["A", "B", "C", "D"],
        "answer": 2,
        "explain": "解析内容"
      },
      {
        "type": "multi",
        "id": 2,
        "q": "多选题题目",
        "options": ["A", "B", "C", "D"],
        "answer": [0, 2],
        "explain": "解析"
      },
      {
        "type": "subjective",
        "id": 3,
        "q": "名词解释：XXX",
        "answer": "答案要点"
      }
    ]
  }
]
```

- `single`：单选题，`answer` 为正确选项索引（0-3），需带 `explain` 解析
- `multi`：多选题，`answer` 为正确选项索引数组，需带 `explain`
- `subjective`：主观题（名解/简答/论述/实验设计），需带 `answer` 答案要点

示例题库见 `public/questions.example.json`。

## 批量更新题目

题库就是 `public/questions.json`，直接编辑即可。改完**必须**校验：

```bash
npm run validate:questions
```

它会检查 JSON 合法性、题目 id 是否章内重复、`single`/`multi` 的答案索引是否越界、
`subjective` 是否缺答案要点等。CI 也会跑这一项。

> v1 时期有一个 `update_questions.py` 批量导入脚本，但它不在本仓库中
> （`legacy/` 已 gitignore），且脚本内的路径已失效，请勿依赖。

## 华东师大 347 考试结构

| 题型 | 数量 × 分值 | 总分 |
|------|------------|------|
| 单选 | 20 × 2分 | 40分 |
| 名词解释 | 5 × 10分 | 50分 |
| 简答 | 3 × 10分 | 30分 |
| 问答 | 3 × 20分 | 60分 |
| 论述 | 2 × 30分 | 60分 |
| 实验设计 | 1 × 50分 | 50分 |
| **合计** | | **300分** |

## 参考教材

华东师大 347 官方只发大纲、不指定教材。常用参考书：

- 梁宁建《心理学导论》
- 彭聃龄《普通心理学》
- 林崇德《发展心理学》
- 张厚粲《现代心理与教育统计学》
- 郭永玉《人格心理学》
- 钱铭怡《心理咨询与心理治疗》+《变态心理学》

## 贡献

欢迎贡献题目或改进前端：

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/add-ch7`)
3. 提交题目或代码改动
4. 发起 Pull Request

也可以直接提 Issue，报告 Bug 或建议新功能。

## License

本项目采用非商用开源许可（CC BY-NC-SA 4.0），版权归 Leesence1 所有。详见 [LICENSE](LICENSE)。欢迎个人学习、贡献和改进，但禁止用于商业目的。
