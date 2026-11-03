# 西溪且留下 · 万愿成灯

春节白墙互动祈福功能原型。游客在手机页面选灯、写下心愿与落款，生成个人愿灯，再将愿望送入公共白墙灯市，参与点灯接福与万灯同辉仪式。

## 在线体验

- [双屏联调：白墙与游客手机对照](https://andrewsive.github.io/qifu/#sync)
- [游客手机版](https://andrewsive.github.io/qifu/#mobile)
- [白墙投影](https://andrewsive.github.io/qifu/#wall)
- [演出控制](https://andrewsive.github.io/qifu/#control)

## 快速体验

需要 Node.js 20.19+ 或 22.12+，推荐使用 Chrome 或 Edge。

```sh
npm ci
npm run dev -- --port 4173
```

打开 http://localhost:4173/#sync，在同一页面对照白墙与游客手机。

| 页面 | 地址 |
| --- | --- |
| 双屏联调 | `/#sync` |
| 游客手机 | `/#mobile` |
| 白墙投影 | `/#wall` |
| 演出控制 | `/#control` |

## 互动流程

1. 开场号召与灯市开启：白墙自动进入收愿，二维码入口显示在左上角，多位模拟游客的心愿持续上墙。
2. 许愿入灯：游客选择灯型、填写心愿与昵称，点击“生成我的愿灯”，查看带编号的个人花灯。
3. 愿灯入市：点击“放愿望入灯市”，手机收走愿灯并提示看向白墙，白墙同步播放心愿从底部升起、融入灯市的动画。
4. 等待接福：手机显示仪式倒计时，游客等待自己的心愿成为幸运之选。
5. 点灯接福：抽取一个愿望，由宋韵少女点亮。被抽中的游客看到恭喜画面，其他游客同步观看仪式。
6. 万灯同辉：灯市逐步亮起，群灯升空、水面映光，形成仪式高潮；手机可生成并下载本次万灯同辉 PNG 纪念图。

控制台可手动切换节目、抽取指定愿灯、增加模拟游客、运行加速演示。万灯同辉在双屏页支持重播。

## 演示说明

- 本版本使用 localStorage / sessionStorage 模拟状态。相同浏览器、相同站点的页面共享演出状态；其他人的浏览器各自运行独立的体验。
- 手机端嵌入双屏联调页，可直接与左侧白墙对照。跨设备共同收愿需要后续接入服务端。
- 演示时序：开场约 10 秒、愿灯入市约 8 秒、收愿倒计时约 2 分钟、点灯约 8 秒、万灯同辉约 18 秒。现场方案约 15 分钟，另行配置。
- “保存愿灯图片”和收束页保存按钮目前为操作反馈演示；“保存万灯同辉纪念画面”已支持生成 PNG 下载。
- 四种花灯、街市与动画均使用 SVG、CSS、Canvas 绘制，无需摄像头或额外模型素材。

## 构建与部署

```sh
npm run build
npm run preview -- --port 4173
```

构建结果位于 `dist/`，可部署到静态网站托管服务。已使用相对资源路径，兼容根域名与 `/qifu/` 子路径。

网站通过 GitHub Pages 发布，`main` 保留源码，`gh-pages` 保存构建产物。发布配置为 `gh-pages` 分支根目录，具体机制参见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

修改完成并提交源码后，运行：

```sh
npm run deploy
```

该命令先构建，再将产物提交到 `gh-pages`，GitHub Pages 随后更新网站。需要当前电脑具有仓库的 Git 推送权限。发布过程中使用独立临时目录，不切换当前源码分支。

## 版本管理

```sh
git status
git add src scripts index.html package.json package-lock.json vite.config.js README.md .gitignore .gitattributes
git commit -m "Describe the demo update"
git push
```

仓库仅收录当前祈福 Demo。依赖目录、构建产物、临时截图以及早期手影项目均排除在版本管理外。

## 主要文件

- `src/main.js`：游客流程、节目状态、队列与三端页面。
- `src/wish-lantern.js`：四种个人花灯的 SVG 绘制。
- `src/generated-preview.css`：愿灯生成页的一屏布局。
- `src/celebration.js`：万灯同辉动画与纪念图导出。
- `src/*.css`：白墙、手机与双屏联调的视觉样式。
- `scripts/deploy-pages.mjs`：将构建产物发布到 GitHub Pages。
