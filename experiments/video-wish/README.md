# 视频心愿实时合成验证

本地入口：`http://localhost:4173/video-wish.html`。

在线入口：[视频心愿实时合成](https://andrewsive.github.io/qifu/video-wish.html)。与祈福仪式 Demo 共用 `Andrewsive/qifu` 仓库及 GitHub Pages，通过独立 HTML 入口发布。

这是一页独立的合成试验，读取用户提供的《视频节点 1.mp4》（1470×630，24 fps，约6.08秒）。

## 使用

素材在 `experiments/video-wish/media/` 中随源码管理。项目根目录运行 `npm run dev -- --port 4173` 可本地体验；运行 `npm run build` 会同时构建祈福仪式页、视频合成页及两份视频素材，发布到 GitHub Pages 后无需启动本地服务。

网页可实时修改祝福、昵称和编号；支持暂停、重播、拖动时间、半速、文字开关、原片声音、PNG截图。展开定位校准面板后，可在暂停时拖动四角，保存关键帧并导出 JSON。定位修改仅保存在当前浏览器，可随时恢复默认。

## 合成方式

`tracking.js` 存储人工测量的灯面四角关键帧。程序以视频帧的 `mediaTime` 读取同一时刻的四角位置，线性插值后用投影变换将独立文字纹理贴到灯面。Canvas 2D 使用细分三角网格近似投影变换，以正片叠底保留底片的明暗。文字在2.45–3.25秒随远去淡出。

这是当前视频的人工标定验证，不是自动跟踪。原片未提供遮挡层；本轮文字区域没有专门的人物遮挡合成。曲面变形、更复杂遮挡与镜头变化需后续更精确数据或三维主灯支持。

## MP4 样片

运行 `node scripts/render-video-wish-sample.mjs`，使用同一套四角定位，通过 FFmpeg 透视变换和遮罩合成，生成 `output/video-wish/wish-sample.mp4`。保留原音轨，输出 H.264、1470×630、24 fps。默认文案为“家人安康 / 小溪 / 018”。脚本需要 FFmpeg 和 Windows 楷体字体。

网页文字可在播放时更换；MP4是一次导出后的固定成片。两种方式共享定位与排版数据，但文字栅格化和插值实现不同，不作逐像素一致承诺。

2026-11-08 按用户要求将原片与 MP4 样片加入 `media/`，随本页公开发布；`output/` 继续保留本地分析帧和渲染过程文件。重新生成样片后，将 `output/video-wish/wish-sample.mp4` 复制到 `media/` 再构建。
