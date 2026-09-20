# 347 心理学考研刷题网站

**在线刷题：**
- Vercel（国内可用）：https://psychology-quiz-app-gilt.vercel.app/
- Cloudflare Pages：https://psychology-quiz-app.pages.dev/

v2.0.0 — React + TypeScript + Tailwind CSS，玻璃拟态 UI，宽松大气风格。

## 快速开始

```bash
npm install
npm run dev
```

## 技术栈

- 前端：原生 HTML/CSS/JS，无框架依赖
- 数据：`questions.json`（JSON 格式题库）
- 服务：Python 内置 `http.server`，无需安装第三方库

## 题库格式

题库文件为 `questions.json`，结构如下：

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

示例题库见 `questions.example.json`。

## 批量更新题目

使用 `update_questions.py` 可批量导入题目：

```bash
python update_questions.py
```

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
