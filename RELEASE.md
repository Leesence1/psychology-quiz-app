# 发布流程

本项目**每次确认的更新都要发版**：进入 `main` 的改动必须有对应的
CHANGELOG 记录、版本号、附注 tag 与 GitHub Release。这样每一次线上变化
都能追溯到具体版本，出问题也能定位到是哪一次改动引入的。

约定：CHANGELOG 遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## 版本号怎么定

| 改动性质 | 版本位 | 例子 |
|---------|--------|------|
| 破坏性变更（技术栈更换、数据格式不兼容、用户进度需迁移） | major | v2.0.0 |
| 新功能、新题型、新练习模式（含 `feat:`） | minor | v2.1.0 |
| 纯 bug 修复、纯 UI 打磨（只有 `fix:` / `design:`） | patch | v2.1.1 |
| 只有文档 / 清理（`docs:` / `chore:`） | patch，或不单独发版 | v2.1.1 |

判断依据是**提交历史里的 type**，不是主观感觉。一批里只要有 `feat:` 就走 minor。

## 检查清单

按顺序执行，每一步都要看到预期结果再往下走。

### 1. 准备

```bash
npm run validate:questions   # 题库必须零 error
npm run build                # tsc 类型检查 + 构建必须通过
git status --short           # 确认没有意外的改动混进来
```

### 2. 更新版本与 CHANGELOG

- `CHANGELOG.md` 顶部新增一节，按 `### Fixed` / `### Changed` / `### Added` 分节，
  标题格式 `## [vX.Y.Z] - YYYY-MM-DD`，**版本倒序排列**
- `package.json` 的 `version` 改成同一个号
- **不要**只改根目录：`public/` 下的副本要同步（它是公开可访问的）

```bash
cp CHANGELOG.md public/CHANGELOG.md
cp README.md    public/README.md
```

### 3. 提交

```bash
git add -A
git commit -F <提交信息文件>     # 见下方「中文与编码」
```

发布提交本身用 `docs:` 类型，例如：

```
docs: 发布 v2.1.1 — 修复多选题无法多选
```

### 4. 打附注 tag

必须是**附注 tag**（`-a`），历史上 v1.0.0 起的 tag 都是附注的。
消息格式 `vX.Y.Z - 一句话概括`：

```bash
git tag -a v2.1.1 -F <tag信息文件>
```

验证指向正确（注意 `^{}` 在 PowerShell 里要用单引号包住）：

```bash
git rev-parse 'v2.1.1^{}'      # 应等于 git rev-parse HEAD
git show v2.1.1:package.json   # 应看到新版本号
```

### 5. 推送分支与 tag

```bash
git push origin main
git push origin v2.1.1
```

> ⚠️ **推送 `main` 会同时触发两条生产部署**（Vercel + Cloudflare Pages）。
> 推 tag 本身不触发部署。所以推之前要确认构建是通过的。

### 6. 创建 GitHub Release

Release 的 body 直接取 CHANGELOG 对应版本的那一节，不要另写一份。

仓库未安装 `gh` CLI，用 GitHub API（凭据由 git credential manager 提供）：

```
POST https://api.github.com/repos/Leesence1/psychology-quiz-app/releases
{ "tag_name": "vX.Y.Z", "name": "vX.Y.Z - 一句话", "body": "<CHANGELOG 该节>",
  "draft": false, "prerelease": false }
```

### 7. 验证线上

**必须验证，不能只看 push 成功。** 两个站点都要检查：

```bash
# 1) 构建产物哈希已更新为新构建
curl -s https://psychology-quiz-app.pages.dev/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
# 2) 公开的文档副本与本地逐字节一致
curl -s <站点>/CHANGELOG.md | sha256sum   # 对比本地
```

- 国内（可直连）：https://psychology-quiz-app.pages.dev/ — Cloudflare Pages
- 海外：https://psychology-quiz-app-gilt.vercel.app/ — Vercel

> 实测：`pages.dev` 国内可直连；`vercel.app` 国内直连超时，需代理。

部署通常 30–60 秒完成，建议轮询而不是只查一次。

## 环境注意事项

这些是实际踩过的坑，换机器时容易再遇到：

### github.com 直连不通，git 需要代理

Windows 的系统代理设置**不会**被 git 采用。本机已配置为只对 github.com 生效：

```bash
git config --global http.https://github.com.proxy http://127.0.0.1:7897
```

（只影响 github.com，其它 remote 不受影响；撤销用
`git config --global --unset http.https://github.com.proxy`。
代理未启动时 git 会立刻报连接失败，不会卡住。）

### PowerShell 写中文会乱码

**Windows PowerShell 5.1 读取无 BOM 的 UTF-8 `.ps1` 文件时按 ANSI/GBK 解码**，
脚本里的中文字面量会在执行前就损坏（曾导致 GitHub Release 标题变成乱码），
而 `Get-Content` 不加 `-Encoding UTF8` 时读中文文件也会乱码。

对策：中文内容放在独立文件里、用 `-Encoding UTF8` 读；
或用 `git commit -F <文件>` / `git tag -F <文件>` 而不是把中文塞进命令行参数。
校验时用 Node 读文件（Node 的 UTF-8 处理是可靠的），不要用 PowerShell 控制台肉眼判断。

### 不要用 PowerShell 的 `Set-Content -Encoding UTF8` 改 JSON

PowerShell 5.1 的 `Set-Content -Encoding UTF8` 会写入 **UTF-8 BOM**，
而 `JSON.parse` 不接受 BOM —— 曾导致 `package.json` 直接变成"不是合法 JSON"、
`vite build` 报 `"name"... is not valid JSON`。

改 `package.json` / `questions.json` 这类文件请用编辑器或 Node 写，
写完务必确认：

```bash
node -e "const b=require('fs').readFileSync('package.json');console.log('has BOM:',b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF)"
```

### 不要用 `* { margin: 0; padding: 0 }`

见 [CONTRIBUTING.md 的已知的坑](./CONTRIBUTING.md#已知的坑改代码前请读)。
