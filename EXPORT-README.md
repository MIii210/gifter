# 心意手账 v19 — 源码交接说明

## 核实的版本与项目
- 线上地址：https://little-gift-notebook.russet-heron-2447.chatgpt.site
- project_id：appgprj_6abb8b009ad08191956cbbdd3796a269
- 版本：v19
- version_id：appgprj_6abb8b009ad08191956cbbdd3796a269~appgver_7e02c997677481919cc7aedba0286b73
- Git 提交：3d9af2daf020a66edf68d01ad75fabbb419bc07b
- deployment_id：appgdep_6abd3e4c87b081918459dc532124fbe5，读取状态为 succeeded。
- 核对时间：2026-10-01（Asia/Shanghai）。Sites 最新版本为 19；本地该 Git 对象、线上版本 source.commit_sha 和 hosting.json 项目标识一致。
- ZIP 从这个 Git 提交逐文件导出，未修改原站或执行发布。仅额外加入本说明及 EXPORT-MANIFEST.json；排除项见清单。源码文件保持原字节。原 README 的部分产品/登录描述过时，数据和运行说明以本文件及实际源码为准。

## 运行与构建
要求 Node.js >=22.13.0、pnpm 11.25.0。需要联网下载锁定依赖；不包含 node_modules。普通本机可用 Corepack 启用指定 pnpm 后运行：

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

开发入口默认 http://localhost:5173；读取终端实际端口。未附带 .sites-runtime 的干净源码默认使用 portable 模式。本地登录是开发模拟，不是生产账号授权。首次本地数据库为空时，需要建表；以下完整构建/本地生产预览流程可初始化数据库：

```sh
pnpm build
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_windy_susan_delgado.sql
pnpm start
```

SQL 初始化仅对新的空数据库执行一次，已有表不要重复执行。pnpm start 默认 Wrangler 本地端口通常为 8787，以终端为准。pnpm dev 若报缺表，同样在本地配置/同一持久化目录初始化；不要加 --remote。dist/server/wrangler.json 是构建生成文件，不是遗漏的源码。托管 Linux 的 install:ci 脚本依赖 flock/timeout，不建议在 macOS 直接运行该脚本；使用上面的 pnpm 安装命令。

验证命令：
```sh
pnpm exec tsc --noEmit
node tests/calendar.mjs
node tests/integration.mjs
```
integration 需先 build，使用独立 Miniflare D1/R2，不触碰生产数据。tests/calendar.browser.mjs 也原样包含，但不是本次导出实测结果，不应以它替代当前样机 iframe 的浏览器检查。
此前 v19 的构建、类型检查、日历与接口回归通过；本次导出做版本/文件/ZIP 完整性和常见密钥特征检查，未重新安装或声称在接手电脑上运行通过。

## 源码与资源
- app/、components/、lib/：React 19 + Vinext/Vite 前端与业务逻辑，含手机样机。
- app/api/：state、survey、upload、media 后端路由；build/sites-worker.ts 及构建插件一并提供。
- db/、drizzle/：表结构和迁移。pnpm-lock.yaml、pnpm-workspace.yaml、package.json 保留锁定依赖与版本。
- public/：全部已提交图片、16 张邮票插画、SVG 和 5 个 WOFF 字体文件。邮票英文使用实际打包的 yefont-paws-latin.woff；中文标题和正文字体也包含，不依赖本机字体。
- .openai/hosting.json 原样保留 DB、BUCKET 逻辑绑定及真实 project_id。

## 数据存储与外部依赖
- 生产运行依赖 Sites 提供的 Cloudflare Workers、D1（绑定 DB）与 R2（绑定 BUCKET）。D1 notebooks 存每个 owner 的手账 JSON 和 revision；surveys 存问卷 token、归属和结果。R2 存上传图片及归属元数据。
- 已登录账号通过 Sites 可信身份头识别；公开访客通过 gift_demo_session HttpOnly Cookie 分隔。新库从 lib/model.ts 与 lib/demo-gifts.ts 的示例数据初始化；不是线上用户数据备份。前端 localStorage 不是主存储。
- 礼物推荐与线索整理是本地确定性 Demo 模拟，无需大模型 API key。问卷回传使用同站 API。包内通用 connector 支持代码不表示业务已连接第三方服务。
- 安装依赖 npm 包仓库；字体和插画运行时使用本地资源。迁出 Sites 时需另配 D1/R2 与身份认证；不得让公网任意请求伪造 oai-authenticated-* 头。当前配置里的全零 D1 ID 是本地占位，非生产数据库标识。

## 更新原网址的权限与授权方式
- 已核实当前账号角色 owner，站点访问范围 public，allowed_editors 为空。公开访问权限不等于源码编辑/发布权限。
- 接手者必须在原 Site 对应工作区取得 owner 或受支持的 editor 权限，并使用其获授权的 ChatGPT/Sites 登录会话。当前接口明确支持同工作区编辑者：由所有者在同一 Site 的共享/协作入口授予“编辑者”；或所有者明确授权后，通过 Sites update_site_access 的 editor_changes.add_editor_account_user_ids 加入已核实的账号 ID。不要把 viewer 或外部访问邀请当成 editor。
- 本次没有邀请、授权或转移任何人；接手账号尚未指定/核验。现有接口未证实外部跨工作区编辑或所有权转移路径，不能保证另一个工作区账号能直接接管。
- 获权后保留原 project_id，在原 Site 源码仓库获取该账号自己的短期写凭据，推送源码，保存版本并发布到同一项目，才能更新原 URL。ZIP、本地 hosting.json 和复制网址都不会赋予这些权限；新建项目通常得到新 URL。
- 不交接当前账号密码、Cookie、API key 或短期 Git token。原项目数据库/对象存储绑定由 Sites 管理，继续更新同一项目不需要把这些数据装进 ZIP。

## 缺失及主动排除
1. 未发现线上提交所需源码、锁文件、后端路由或已引用打包资源缺失；唯一从该 Git 提交主动剔除的文件是 tsconfig.tsbuildinfo（增量编译缓存）。
2. 不含生产 D1 数据导出、R2 用户上传照片、生产物理资源 ID/绑定配置备份；本次为源码导出，并未读取或备份这些数据。
3. 不含原始 TTF/设计源文件及字体授权证明：线上提交实际使用的 WOFF 和插画已完整包含；不能将本 ZIP 当作原始设计档案或字体许可证明。
4. 按要求不含密钥、登录会话、环境私密值、.git 历史、node_modules、缓存和构建产物；第三方依赖需按锁文件安装。常见密钥特征扫描未发现实值凭据，变量名及示例身份不是密钥。
5. 不含 ChatGPT/Sites 平台本身、平台发布工具或平台账号授权；这些属于外部托管能力。接手权限需按上述方式另行授予。
