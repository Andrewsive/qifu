# 西溪且留下 · 万愿成灯

春节白墙互动祈福功能原型。游客生成个人愿灯，送入低处漂浮的愿池，共同参与点灯放飞；幸运主灯同步白墙，群灯随后汇成“新年快乐”，以烟花收尾。

## 在线体验

- [双屏联调：白墙与游客手机对照](https://andrewsive.github.io/qifu/#sync)
- [游客手机版](https://andrewsive.github.io/qifu/#mobile)
- [白墙投影](https://andrewsive.github.io/qifu/#wall)
- [演出控制](https://andrewsive.github.io/qifu/#control)
- [视频心愿实时合成：输入祝福并随灯放飞](https://andrewsive.github.io/qifu/video-wish.html)

## 视觉版本对比

- [国风夜游](https://andrewsive.github.io/qifu/?style=night-tour#sync)：深蓝夜色、朱砂花灯与暖金倒影；原版保存在 `backup/2026-11-04-night-tour` 标签。
- [宋韵工笔](https://andrewsive.github.io/qifu/?style=gongbi#sync)：绢本米金、淡青绿与精细水乡画卷，配独立工笔仕女美术。

- [水墨雅韵](https://andrewsive.github.io/qifu/?style=ink-wash#sync)：宣纸留白、烟墨水乡与淡青绿人物，点缀少量朱砂灯火。

顶部“视觉版本”菜单可在同一节目、同一盏愿灯上原地切换，便于对照。默认地址仍显示国风夜游，三个专属地址可分别分享。

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
| 视频心愿实时合成 | `/video-wish.html` |

视频合成验证与祈福仪式统一在本仓库管理、独立页面发布。`npm run build` 同时构建两个页面，视频素材随构建打包，在线链接可直接分享给厂家和其他体验者。素材与程序说明见 [视频合成验证](experiments/video-wish/README.md)。

## 互动流程

1. 开场号召与灯市开启：白墙自动进入收愿，二维码入口显示在左上角，多位模拟游客的心愿持续上墙。
2. 许愿入灯：游客选择灯型、填写心愿与昵称，点击“生成我的愿灯”，查看带编号的个人花灯。
3. 愿灯入池：点击“放愿望入灯市”，白墙立即新增一盏低空愿灯，短暂高亮后留在愿池；手机收起灯签，提示看向白墙，随后进入倒计时。收愿时不公开祝福文字，也不提前放飞。
4. 等待接福：引导、填写与等待期间，背景愿灯不断加入，灯海逐渐变密；已入池的灯一直保留。白墙题字下方显示大倒计时，与手机等待页共用本轮截止时间。后加入的游客沿用剩余时间，提交不重置倒计时；最后10秒加强亮度提示，归零后进入点灯放飞。
5. 点灯放飞：每位游客手机中间的主灯承载自己的祝福，与背景群灯一起放飞。系统抽取一位幸运游客，其主灯同步到白墙；幸运手机显示恭喜，其余手机仍呈现各自的愿灯。
6. 万灯同辉：景别拉远，保留整片灯海；群灯汇成“新年快乐”，停留后绽放烟花，并保留结尾灯阵。手机可下载个人新年纪念图。

控制台可手动切换节目、抽取指定愿灯、增加模拟游客、运行加速演示。万灯同辉在双屏页支持重播。

## 一键录屏演示

在双屏联调页点击“加速自动演示”，3秒准备倒数后，约95秒走完白墙与手机的完整流程：开场、参与、填写、生成愿灯、入池亮灯、倒计时、幸运主灯点亮放飞、灯海远景、汇字、烟花与收束。

演示使用一盏“小溪”的示例愿灯，并将其选为幸运愿灯，便于录制完整的个人参与过程。示例状态仅在当前页面内运行，返回手动体验后恢复原有页面与愿灯队列。

- “重新开始”可随时重播整段流程。
- “返回手动体验”停止时间轴并退出示例场景。
- “录屏净画面”隐藏导航与说明，把窗口留给双屏；鼠标移至顶部可显示控件，按 Esc 退出净画面。

游客手机的所有阶段共用一屏自适应布局：人物、花灯与动画根据可用高度调整，完整保留提示、心愿文字和操作按钮。支持小屏手机、竖屏/横屏切换和桌面双屏预览。

桌面手机预览采用 9:19.5 的固定竖屏比例，整个设备随窗口空间等比缩放，普通联调与净画面模式的外形保持一致。实际手机访问时使用设备本身的可用视口。

## 演示说明

- 本版本使用 localStorage / sessionStorage 模拟状态。相同浏览器、相同站点的页面共享演出状态；其他人的浏览器各自运行独立的体验。
- 手机端嵌入双屏联调页，可直接与左侧白墙对照。跨设备共同收愿需要后续接入服务端。
- 演示时序：开场约10秒、手机收灯约6秒、低处亮灯约4秒。手动体验收愿一轮约2分钟，自动录屏演示收愿段压缩为33秒；两端同时归零，再点灯放飞约12秒。高潮约30秒：先拉远7秒，再汇字10秒、停留3秒，然后放烟花，最后保留祝福灯阵。现场方案约15分钟，另行配置。
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

视觉改版前的完整功能版已封存为 `backup/2026-11-04-functional`（提交 `92eccfa`），并保留本地源码 ZIP。详细记录与恢复方式见 [版本基线](docs/版本基线.md)。

三种视觉的探索版各有分支及标签。节目调整基线在 `codex/ritual-release-flow`；持续累积灯池版本在 `codex/growing-wish-pool`，封存标签为 `ritual/2026-11-05-accumulating-pool`。流程说明见 [本轮方案](docs/祈福仪式流程调整-2026-11-05.md)。

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
- `src/mobile-fit.css`、`src/mobile-fit.js`：全部游客阶段的一屏布局与尺寸适配。
- `src/phone-preview.css`：桌面手机预览的固定比例与等比缩放。
- `src/wish-transfer.js`、`src/wish-transfer.css`：手机收灯后上墙的顺序、动画进度与防重播。
- `src/night-tour.css`、`src/night-tour-mobile.css`：国风夜游主题与各手机阶段的视觉。
- `src/gongbi.css`、`src/visual-variants.js`、`src/visual-variants.css`：独立工笔主题、专属链接与实时风格切换。
- `src/ink-wash.css`：独立水墨雅韵主题；独立素材与提示词见 [水墨雅韵美术记录](docs/水墨雅韵美术记录.md)。
- `public/assets/gongbi-town-v1.png`、`public/assets/gongbi-girl-v1.png`：工笔水乡和透明仕女插画，生成方式与提示词见 [美术记录](docs/宋韵工笔美术记录.md)。
- `public/assets/night-tour-town.svg`、`public/assets/song-lantern-girl.svg`：水乡灯市与宋韵少女插画，按引用打包。
- `src/recording-demo.js`、`src/recording-demo.css`：95秒完整演示时间轴、控制条与净画面模式。
- `src/ritual-motion.js`、`src/ritual-renderer.js`、`src/ritual-views.js`、`src/ritual-flow.css`：低处愿池、个人主灯放飞、远景汇字与烟花。
- `src/celebration.js`：万灯同辉动画与纪念图导出。
- `src/*.css`：白墙、手机与双屏联调的视觉样式。
- `scripts/deploy-pages.mjs`：将构建产物发布到 GitHub Pages。
