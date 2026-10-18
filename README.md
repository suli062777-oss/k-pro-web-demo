# L PRO 官网 Demo

这是 L PRO 本地产品官网（项目目录沿用 K-pro-web-demo）。首屏使用产品场景图替代视频，保留柔焦字标；依次展示产品概览、四建筑 3D 小世界、产品功能、App、价格方案、FAQ 与页尾。点击建筑或标签直达对应 360° 全景。

## 预览

- 当前本机预览：http://127.0.0.1:4173/
- 使用本机 HTTP 服务预览；3D 模块、GLB 与解码器需要通过 HTTP 加载，不能直接双击 `index.html`。渲染产物已包含在项目中，预览不需要安装依赖或构建。
- 如需重新启动本机服务，在此目录运行 `python3 -m http.server 4173 --bind 127.0.0.1`，或双击 `打开预览.command`。服务仅监听本机；终端按 Ctrl+C 停止。

## 文件

- `index.html`：首页结构、静态区块与导航。
- `app.html`：对应设计稿的 App 介绍页。
- `styles.css`：字体、颜色、版式、响应式规则与减少动态效果支持。
- `content.js`：媒体配置、纸条、场景卡片、热点说明、App 文案、FAQ 和收尾文案。
- `app.js`：小世界到全景的事件桥接、热点选择、弹窗和文案绑定。
- `background.js`：全局固定背景、按配置合并连续毛玻璃面板与全页视频进度控制。
- `worlds.js` / `worlds.css` / `src/world-renderer.js` / `src/world-backdrop.js`：当前完整小世界的生命周期、页面布局、3D 场景及环境。
- `islands.js` / `island-state.mjs` / `islands.css`：旧独立书签方案保留作历史源码，当前首页不加载。
- `src/island-renderer.js`：透明背景的 Three.js 渲染源码；已构建到 `assets/islands-engine.js`。
- `spaces.js` / `spaces.css` / `src/panorama-renderer.js` / `panorama-state.mjs`：站内全屏 360° 全景、固定视点环视、缩放、重置、资源降级和关闭清理。查看器入口与书签自转分别控制。
- `assets/panoramas/`：四个场景的桌面 / 手机 WebP 和来源 SHA-256 清单。
- `assets/world-engine.js` / `assets/panorama-engine.js` / `assets/viewer-chunks/`：小世界、全景和共享 Three.js 模块；发布时须一并保留。
- `assets/islands/`：四个轻量化建筑 GLB；`assets/worlds/`：参考场景树木；`assets/draco/`：本地解码器。
- `assets/spaces/`：四个独立室内 GLB、对应空间 WebP 封面、原始来源及优化统计。
- `验收/islands.test.mjs`：运动连续性、减少动态效果、离屏暂停和整圈相机构图测试。
- `验收/3D岛屿检查.json`：本轮实际浏览器验收与模拟降级检查记录。
- `assets/`：下载到本地的 Figma 图片、原始 SVG 与字体。页面不依赖临时 Figma URL 或外部字体服务。
- `验收/检查结果.json`：本次实际浏览器检查记录。
- `验收/背景滚动检查.json`：原渐变毛玻璃方案的历史检查记录，已被稳定面板方案替代。
- `验收/字标柔焦检查.json`：两行首屏字标的柔焦、手机适配与交互检查记录。
- `验收/稳定毛玻璃检查.json`：当前黑白长面板、边界、响应式与交互检查记录。
- `验收/页面收尾检查.json`：精简 FAQ 和页脚后的桌面、手机与交互检查记录。

## 本版交互

1. 全页共用固定的全屏背景，前景正常滚动。首屏背景清晰，正文由具有明确边界的黑白毛玻璃长面板承载；面板随内容滚动，模糊和透明度保持固定。当前用静态图片占位，不对图片做缩放或位移。
2. 四座建筑围绕十字路口展示，保留参考站的广场、街道树木、白色标注和远景环境。拖动旋转，按钮或双指缩放，可暂停 / 播放和重置；点击建筑或标签直接进入相同场景的 360° 全景，关闭后恢复街区方向、缩放、网页位置和焦点。普通滚轮滚动网页，手机单指纵向滑动仍可浏览下一章节。
3. 产品六个功能与模型互相联动，只展示当前选中的说明；桌面列表不再单独纵向滚动，手机保留横向功能选择。
4. 三项 FAQ 独立展开、收起。
5. App 下载区按最新设计展示手机图片及 Android / iOS 双按钮，按钮上方直接标明尚未开放。正式下载地址集中配置；未提供地址时按钮显示即将开放提示。页尾 App 链接直接定位首页下载区。
6. 所有原参考站外链已移除。社交与联系入口展示尚待发布的信息，不发送消息、不收集资料。

## 如何更换内容

### 完整四场景小世界（2026-10-17 更新）

本次开发计划已执行：先核对参考源码和素材 → 备份书签版 → 迁移完整街区 → 将场景点击接入现有全景 → 桌面 / 手机往返及降级验收。

参考来源：[V3-Halowash-little-worlds](https://lzllzllzllzllzl.github.io/V3-Halowash-little-worlds/index.html)。实际移植 `src/hw-index.js` 的广场、建筑归一化、树木分布、白色标注与相机布局，以及 `src/hw-backdrop.js` 的道路、斑马线、地面与远景。原始 HTML、打包文件、未压缩源码及 SHA-256 / Git blob 对照在 `tools/reference-world-20261017/`，来源清单为该目录下 `provenance.json`。现有四个建筑的原文件已与当前参考仓库逐一核对，内容一致；运行时继续使用本地优化版，另外加入参考站的树木 GLB。首页未嵌入外站 iframe。

`content.js` 的 `worldOverview` 集中管理：四场景 ID、建筑路径、树木路径、名字与短说明、初始建筑朝向、自动旋转速度、帧率和阴影质量。场景对应始终为 `home → 居家`、`ward → 病房`、`garden → 养老院`、`salon → 头皮沙龙`；全景图及其静态备用图继续由 `spaces.scenes` 管理。中英切换只改变小世界，不修改官网其他文案。

界面沿用参考的浅灰街区和白色标签，适配 K pro 品牌。移除原书签、封面展开与横向翻页步骤；点击建筑或标签即打开原生全屏全景弹窗。手机增加四个清晰的文字入口。模型不可用或 WebGL 不支持时，改用四张真实全景封面继续进入；不会停在无法操作的空白画面。

鼠标拖拽 / 手机单指横向滑动旋转，双指与 `+ / −` 按钮缩放；普通滚轮 / 手机纵向滑动用于滚动页面。键盘在画布聚焦时使用方向键、加减键、空格播放暂停、Esc / Home 复位；不会在其他章节全局拦截按键。用户操作或标签获得焦点时暂停自转，播放按钮可恢复。关闭全景恢复街区状态，街区离屏、页面隐藏或弹窗打开时停止绘制，减少动态效果设置下默认静止。

运行 `npm run build` 构建小世界与全景的共享模块。当前完整验收入口为 `验收/worlds-fixture.html`；`?mode=failed-world` 模拟建筑失败，`?mode=no-webgl` 模拟小世界无法创建 WebGL。测试脚本不进入正式首页。早期书签 / 全景 fixture 仅是历史验收文件，不再用于当前入口结构。结果记录见 `验收/完整小世界检查.json`。

本次备份：`backups/pre-world-overview-20261017-104947/`。以下历史章节保留改版过程；涉及书签和展开封面的描述以本节的新入口为准。360° 图片、全景渲染核心、首屏字标、固定背景与其他章节保持原有实现。

### 四场景 360° 全景（2026-10-15 更新）

本次按“确认对应关系 → 生成网页素材 → 接入原入口 → 桌面与手机验收”的计划执行。首页岛屿、文案和其他交互保持不变；右侧展开封面现为对应全景的透视画面，点击「进入 360° 空间」后，进入同一场景环视。相机始终位于球心，只旋转方向和调整视野，不包含行走、位移或自动旋转。

| 场景 ID | 网站场景 | 原始文件 |
| --- | --- | --- |
| home | 居家护理 | Modern Home Care Room Interior_pano.png |
| ward | 病房护理 | Modern Hospital Room with Advanced Device_pano.png |
| garden | 养老院护理 | Serene Senior Care Lounge_pano.png |
| salon | 头皮沙龙 | Inviting Scalp-Care Salon Interior_pano.png |

原图位于项目同级的 `世界场景360/`，均为 4608×2304、2:1 等距柱状全景。原 PNG 保持不变，网页版本由 `npm run prepare:panoramas` 生成：桌面保留原分辨率，每张约 0.8–1.1 MB；手机使用 2560×1280，每张约 0.28–0.37 MB。文件名、尺寸、体积和 SHA-256 在 `assets/panoramas/sources.json`。仅打开当前场景时加载其全景；650px 以下或设备纹理尺寸受限时选用手机版。

后续只需在 `content.js` 的 `spaces.scenes` 中按 ID 修改 `src`、`mobileSrc`、`width`、`height`、`title` 和 `cover`。图片必须保持完整 2:1 全景，不要裁成普通照片。`camera.yaw` 控制水平朝向、`pitch` 控制俯仰、`fov` 控制初始视野；以度为单位。全局 `minFov / maxFov / pitchLimit` 控制操作范围。缩放改变视野，不移动相机。每张图保留原有色彩；黑白界面和首页去色毛玻璃独立控制。

鼠标 / 单指拖动环视，滚轮 / 双指缩放；按钮支持左右环视、缩放和重置。画布聚焦后可用方向键、加减键、0 / Home；Esc 或关闭按钮返回原卡片、页面位置、轨道位置和焦点。静止时不持续重绘。关闭即取消未完成加载并释放当前纹理；旧请求不会覆盖新场景。失败时提供对应的全景静态封面和重试，始终可退出。

修改渲染源码后运行 `npm run build`，会构建岛屿、全景和保留的旧室内模型工具，并共享 Three.js。发布时带上整个 `assets/viewer-chunks/`，不要只复制入口 JS。`npm run test:panoramas` 检查转向、俯仰边界、缩放与重置。完整浏览器验收入口为 `验收/panorama-fixture.html`，`?mode=failed` 模拟图片失败后重试，`?mode=no-webgl` 模拟 WebGL 不可用；测试脚本不进入正式首页。结果与截图在 `验收/360-*`，综合记录见 `验收/360全景检查.json`。

修改前备份：`backups/pre-panorama-20261015-215546/`。主样式、固定背景、品牌 SVG、App 区域和岛屿渲染源码通过 SHA-256 对照，保持原样。以下旧室内模型章节仅记录历史来源与封面生成流程，当前全屏查看器已使用本节的全景图片方案。

### 全景静态封面（2026-10-15 更新）

四张展开封面与全景查看器使用同一场景资源和初始 `camera.yaw / pitch / fov`。通过透视投影渲染为 1200×1200 WebP，避免直接裁切 2:1 全景造成形变。路径集中在 `spaces.scenes.<id>.cover`，实际文件位于 `assets/panoramas/covers/`，每张约 89–123 KB；点击时仍进入可交互全景。加载失败的备用封面也使用同一张图片。旧的 `assets/spaces/*-cover.webp` 保留作历史素材。

更换全景或调整初始朝向后，运行 `npm run covers:panoramas` 重新生成四张封面。脚本读取现有全景 WebP 和集中配置，不修改全景原图。每张封面的来源、相机参数、尺寸和 SHA-256 记录在 `assets/panoramas/covers/sources.json`。本轮修改前备份为 `backups/pre-panorama-covers-20261015-222229/`。

### 精简页面收尾（2026-10-11 更新）

浅色区仅保留 “Before you begin.” 和三项折叠问答，移除重复的产品卡、产品介绍及 Explore 按钮；深色区改为 “Care, made simpler.” 品牌收尾和紧凑页脚。取消这两个章节原有的整屏最小高度，让高度随实际内容自然变化。桌面 FAQ 左侧为标题、右侧为问题；手机上下排列。

`content.js` 的 `copy` 管理 FAQ 标题和中文提示，`faq` 管理三项问答，`closing` 管理收尾文案。页脚 Product / App / FAQ 分别定位 `#product` / `#app` / `#readiness`，Contact 沿用现有信息弹窗。固定背景、黑白毛玻璃分组、品牌柔焦、3D 场景及 App 下载区继续沿用现有配置。修改前备份位于 `backups/pre-simple-ending-20261011-082457/`，含 SHA-256 清单。

### App 下载区域（2026-10-10 更新）

对应 Figma `51:2137`，标题为 “Your care. Your control.”，手机图使用旁边“切图”节点 `326:519` 内 `321:530` 的透明 PNG；图片存于 `assets/app-download-phone-cutout.png`，保持 355:678 比例。`app-download.css` 仅作用于首页 `#app`，桌面左右布局，650px 以下上下排列，最窄 320px 也保留并排的大尺寸按钮。背景仍沿用现有浅色毛玻璃面板。下载按钮普通和悬停状态均使用透明底，让同一背景透出；手机切图直接保留原始透明通道，不用混合模式或滤镜抹掉白色。

`content.js` 的 `app` 管理标题、介绍、图片、图片替代文字以及 `downloads`。将 Android / IOS 对应的 `url` 填为正式下载链接后，按钮自动成为可导航链接；地址为空时仅显示待发布提示，不伪造下载。当前没有正式地址，独立 `app.html` 保持原样。修改前备份为 `backups/pre-app-download-20261010-170235/`。之前交付的 ZIP 是更新前快照，本次修改在原项目目录生效。

常改文案集中在 `content.js`：`copy` 管理固定区块标题及说明，其他分组管理导航、纸条、场景、热点、App、FAQ 与收尾。`copy` 中换行用 `\n`。按钮内图标和基础结构仍保留在 `index.html`。颜色和字体在 `styles.css` 开头。

更换背景图片时，只需修改 `content.js` 中的 `site.heroImage`。`background.position` 和 `mobilePosition` 控制桌面、手机裁切重心。产品探索图片位于 `index.html`，可单独替换。

首页背景已接入用户提供的 `assets/hero-loop.mp4`。`site.heroVideo` 管理地址，`site.videoPlayback: "autoplay"` 表示进入页面静音自动播放，`site.videoLoop: true` 表示循环。页面滚动不再改变视频时间；全局固定位置、cover 裁切及恒定毛玻璃保持独立。首屏的暂停／播放按钮支持中英文。隐藏标签页或打开弹窗时暂停，返回后恢复；用户主动暂停后不会自行恢复。自动播放被浏览器阻止时可点击播放，加载失败或系统设置减少动态效果时保留静态封面。减少动态效果下仍可主动点击播放。

旧滚动控帧接口保留为可选配置：将 `site.videoPlayback` 改为 `"scroll"`，使用 `videoStart` / `videoEnd` 设定片段；它与自动播放模式互斥。

### 调整首屏标题与视频对比度

`content.js → hero.headlineLines` 管理首屏三行标题：`Effortless / Hair Care With / L Pro`。标题使用可选择的 HTML 文字和 DM Sans 700，保留英文品牌文案，导航与按钮继续按中英文切换。原泡泡 SVG 素材留在 assets 中，当前首页不再使用装饰模糊字标。

桌面文案置左，中央留给视频人物和产品；手机文案置于下部。`styles.css` 的 `.hero-scrim` 是恒定、无点击拦截的中性黑色渐变层，桌面由左向右衰减、手机由下向上衰减，不模糊视频或前景。渐变随首屏一起滚出，不影响正文毛玻璃。首屏高度扣除常驻导航，避免原来的 125svh 空白尾段；主按钮紧随标题，滚动提示和视频暂停按钮位于底部。

### 调整稳定毛玻璃面板

`content.js` 中的 `background.groups` 将章节 ID 分配给主题。当前分组为：`routine / settings / product` 共用深色面板，`app / readiness` 共用浅色面板，`closing` 使用深色面板。相邻同主题章节自动合并为一个连续面板；保留原 DOM 节点、阅读顺序、锚点和事件。`home` 不配置面板，保持首屏清晰。

`background.themes` 集中管理每个主题的 `blur`（像素）、`grayscale`（0～1）、`opacity`（0～1）、`tint`（六位十六进制底色）及 `foreground`（正文色）。当前深色为 `#141414 / 0.78`，浅色为 `#f5f5f5 / 0.86`，均为 `24px` 模糊和完整去色。保持透明度小于 1，背景才能隐约透出。面板参数在页面加载时赋值，滚动和尺寸变化不会改变它们；视频本身仍可带来细微的明暗变化。

每个面板随文档自然增高。其独立 `::before` 层用 `backdrop-filter: blur(...) grayscale(...)` 过滤底层媒体，设置 `pointer-events: none`；内容位于上层。`main`、面板及章节自身保持 `filter: none`、`opacity: 1`，素材图片和品牌柔焦分别保留。边界就是正文分组边界，无渐变带、无基于滚动的颜色插值。深浅面板交界处没有重叠、额外间距或复制的视频。

全局界面颜色已统一为中性黑白灰；选中热点采用黑底白字及白色外圈，选中详情使用下划线标识。原绿色、黄色交互强调色已移除，App 介绍页也使用中性配色。

可运行 `node 验收/background.test.cjs` 检查连续分组、原节点保留、滚动往返与缩放时面板参数不变、全页视频映射、快速反向定位、减少动态效果和失败回退。视频仍按滚动位置暂停定位；布局尺寸变化只重新计算视频的全页滚动范围，无持续空转循环。

### 调整四个 3D 岛屿

资源来自用户指定的 [HaloWash Little Worlds](https://lzllzllzllzllzl.github.io/V3-Halowash-little-worlds/?v=3)。参考站使用四个独立的 Draco 压缩 GLB，并非必须嵌入整个参考网页。保留原材质和纹理，对几何做保守简化、纹理限制到 1024px 并以 WebP 打包。模型总量由 14,207,648 字节降至 5,395,648 字节，三角形由 2,230,635 降至 667,213。原始 GLB 在 `tools/island-originals/`，不纳入上传。

| 卡片 | 模型 | 文案对应 |
| --- | --- | --- |
| home care | home.glb | 居家洗护 |
| bedside care | ward.glb | 床边及病房支持 |
| assisted living | garden.glb | 养老和辅助生活场景 |
| scalp salon | salon.glb | 专门的头皮洗护场景 |

原三张卡片已按用户确认调整为四张；不再把 salon 模型对应产后护理文案。原 PNG 保留为加载中或失败时的备用图，其中新增场景暂复用原通用岛屿插画。

`content.js` 的 `scenes` 管理标签、文案、倾角和 `image` 备用图片。`islands.models` 按同名 ID 管理 `src`、`initialAngle`（度）、`scale`（0～1，1 为安全最大构图）；每个模型可单独覆盖 `camera`、`rotationSeconds`、`floatSeconds`、`floatPixels` 和 `shadow`。全局默认参数如下：

- `rotationSeconds: 50`，`floatSeconds: 6`，`floatPixels: 3`。暂停冻结累计动画时间，恢复不会跳回初始角度。
- `camera.elevation: 35`、`azimuth: 38`、`padding: 1.16`。每个模型按自身边界归一化，固定正交相机预留整圈旋转空间。
- `shadow` 管理低透明度、模糊、宽度百分比及与模型包围范围的间距；阴影固定在纸张表面，不随模型旋转或浮动。
- `maxDpr: 1.5`、`maxFps: 30`、`maxRenderSize: 1200`、`preloadMargin: '240px'` 控制清晰度、帧率及预加载距离。

四个岛屿共用一个离屏 WebGL 渲染器，将画面复制到各自透明画布，兼容纸张原有 CSS 倾斜。GLB 串行解码，加载后缓存；离开视口、打开遮挡页面的弹窗或页面隐藏时，暂停对应动画和无用绘制。系统减少动态效果时默认静止，也可通过 play 主动播放。不提供拖拽或滚轮缩放，画布不截获点击和滚动。3D 不可用或资源失败时回到原图，展开和预览按钮仍然工作。

修改渲染源码后运行 `npm run build`（同时构建书签和室内查看器）；重新优化外观 GLB 运行 `npm run optimize:islands`。开发依赖版本锁定在 `package.json` 和 `pnpm-lock.yaml`，可使用 `pnpm install --frozen-lockfile` 安装。测试运行 `npm run test:islands`。`验收/islands-fixture.html` 是前一版独立岛屿组件的历史测试页面；本版完整往返验收使用下述 `bookmark-spaces-fixture.html`。

修改前备份位于 `backups/pre-3d-islands-20261004-020005/`，含 SHA-256 清单。背景逻辑、原有主样式、字标 SVG 和 App 页保持与备份逐字节一致。

### 横排书签与旧室内模型（历史记录，查看器已被全景替代）

本轮修改前又保存了 `backups/pre-bookmark-spaces-20261004-090611/`，含 57 个文件的 SHA-256 清单。

`islands.initialScene: null` 表示四张默认收起。`scenes` 中的 `position`、`rotation`、`decoration`、`divider` 管理小岛位置、纸张倾角与打字机式分隔符。书签宽度/高度和右侧展开宽度由 `islands.css` 的 `--book-width`、`--book-height`、`--preview-width` 控制。左栏固定尺寸，右栏以宽度动画展开，其他书签不会被压窄；内容超过视口时在独立轨道内横向滑动，不让整个页面横向溢出。手机展开后自动把右侧封面带入视口，用户仍可左右滑回小岛收起。

`spaces.scenes` 按同一 home / ward / garden / salon ID 分别配置 `title`、`src`（室内 GLB）、`cover`（室内封面）、`camera`。这些室内模型来自参考站四个 `scene-*.html` 的内嵌资源，与书签 `assets/islands/*` 外观建筑不同。源页固定版本、原始 SHA-256、原镜头设置记录在 `assets/spaces/sources.json`。室内原模型在 `tools/space-originals/`，经简化从 17,551,516 字节 / 5,935,581 三角形降至 6,008,812 字节 / 1,217,202 三角形。

全屏空间沿用同一个 ID 对应关系，首次点击才加载渲染模块和该室内 GLB；不为四个封面启动实时 3D。空间可通过鼠标/触摸拖拽环视，滚轮/双指及按钮缩放；画布获得键盘焦点后，方向键旋转、加减键缩放、0/Home 重置，Escape 关闭。关闭时停止绘制并释放当前室内几何、材质和纹理，书签重新按可见性运行。异步加载使用请求序号隔离；关闭或切换后到达的旧模型不会覆盖当前场景。加载失败或不支持 WebGL 时显示对应封面和重试入口，始终可返回。

室内光照固定，阴影仅在模型切换时重新生成；相机交互不反复重算静态阴影。`spaces.maxDpr` 限制像素比，`background` 控制中性空间底色，`camera.azimuth/elevation/padding` 控制初始构图。病房沿用原资源的 `focus` 和 `span`，聚焦床边护理区域。初始镜头保持静止，由用户主动操作。

可复现资源流程：`npm run fetch:spaces` 提取固定版本源页的内嵌 GLB，`npm run optimize:spaces` 生成轻量版。运行 `npm run covers` 后访问 `http://127.0.0.1:4175/验收/space-cover-studio.html`，通过工作台生成四张封面；该本机开发服务只接受四个指定封面文件，正式网站不使用它。封面来自真实室内模型的固定视角渲染，并非额外生成的概念图。

`验收/bookmark-spaces-fixture.html` 的“运行书签与空间验收”执行四张卡片的展开、封面加载、对应空间、缩放/重置、关闭恢复、收起、互斥切换和背景回归；`?mode=failed-space` 模拟模型 404，`?mode=no-webgl` 模拟空间 WebGL 不可用。测试脚本不进入正式首页。浏览器结果保存在 `验收/书签与空间检查.json`。

## 本版边界

- 首页固定背景和第二页右侧均已使用用户提供的视频；两者独立播放、静音循环。
- 首页小世界可整体旋转和缩放，建筑及标签直接进入对应全景；全景为固定视点环视，不包含第一人称行走。
- 已检查桌面及手机尺寸的浏览器视口；尚未在真实 iPhone、Android 低端机上进行性能测试，正式背景视频与 3D 同时使用时仍需实机验收。
- 产品探索与产品卡使用已有产品概念图替代色块。热点用于展示交互，后续需按最终产品图校准。
- App 界面沿用设计稿占位；未编造已发布 App、下载链接、售价或销售状态。
- 公网 Demo 已发布到 https://suli062777-oss.github.io/k-pro-web-demo/ 。当前线上提交为 `fc05c02`；后续本地未提交改动不自动上线。没有后台、账户、支付或真实硬件控制。

## 设计与素材来源

- [首页设计稿](https://www.figma.com/design/yBv7SO4vTSRjAX3h08fAfB/K-pro-%E7%95%8C%E9%9D%A2?node-id=51-2089)
- [首屏参考](https://www.figma.com/design/yBv7SO4vTSRjAX3h08fAfB/K-pro-%E7%95%8C%E9%9D%A2?node-id=51-2090)
- [App 介绍稿](https://www.figma.com/design/yBv7SO4vTSRjAX3h08fAfB/K-pro-%E7%95%8C%E9%9D%A2?node-id=72-690)
- `hero.png`：本地 `html网站搭建素材/切图.png`，原始文件复制，无修改。
- `wordmark.svg` / `tagline.svg` / 社交 SVG：Figma 原始资源，保留根尺寸，通过容器变换适配。
- `routine.png` / 三张场景 PNG：Figma 原始图片。
- Bodoni Moda、DM Sans、DM Mono：Google Fonts；对应许可保存在 `assets/licenses/`。
- 四个 GLB 来自上述 HaloWash 项目，固定版本、下载 URL 和原始 SHA-256 在 `assets/islands/sources.json`。来源仓库未附模型许可证，本项目未擅自为这些素材添加开源许可。
- 四张 360° 全景照片由用户提供，原 PNG 保留在项目同级的 `世界场景360/`，本次仅生成网页用 WebP 副本。
- Three.js 和 Draco 的许可文件保留在 `assets/licenses/`，渲染依赖已本地化，不依赖运行时外部 CDN。

所有文本文件使用 UTF-8。

## 版本留痕

### GitHub Pages 发布（2026-10-17）

`.github/workflows/deploy-pages.yml` 支持主分支更新与手动部署。使用已经纳入 Git 的静态渲染产物，无需在线安装依赖；`python3 tools/package-pages.py` 将网站入口、脚本、样式和素材复制到 `_site/`。网站产物排除 Git 历史、开发源码目录、设计参考稿目录、验收记录及素材来源清单。重复打包前需自行保留或删除旧 `_site/`，脚本不会覆盖已有目录。

经用户明确授权并完成 GitHub 身份验证，仓库已公开，Settings → Pages 的 Source 已设为 GitHub Actions。提交 `fc05c02` 已同步到 main，[首次发布工作流](https://github.com/suli062777-oss/k-pro-web-demo/actions/runs/39041185423) 的 package 和 deploy 均成功。访问 [公网 Demo](https://suli062777-oss.github.io/k-pro-web-demo/)；以后推送到 main 会自动重新部署。公开源码仓库的全部已提交内容均可访问，与网站产物排除规则无关。

线上导航与定价内容已显示，图片下载及脚本响应为 HTTP 200；当前网络下载较大 3D 脚本缓慢，线上 3D 完整交互尚未通过本轮验收。此次发布不包含后续本地新增、尚未提交的首页视频。具体记录见 `验收/GitHub部署检查-20261017.json`。

公开仓库：[suli062777-oss/k-pro-web-demo](https://github.com/suli062777-oss/k-pro-web-demo)。

初始版本保存固定背景、章节毛玻璃及现有交互。源代码、素材、字体许可与验收记录纳入版本管理；本机预览服务日志、进程号和系统临时文件由 `.gitignore` 排除。


### 完整产品功能页与全站白底顶栏（2026-10-17）

本次按先规划再实施的顺序，将原有产品图片及三个热点替换为用户指定的 L Pro Anatomy 完整功能页：先备份 → 核对参考源码和模型 → 移植六个功能站位和拆解交互 → 接入统一白底顶栏及语言状态 → 桌面、响应式手机、降级与官网回归验收。

参考站为 https://lzllzllzllzllzl.github.io/V2-L-Pro-Anatomy-main/ ，固定源码提交 `65535fc7f1bb54b4f07b1e4b9fcdd3d47e5e594b`。原始源码、文件哈希及改动说明保存在 `tools/reference-anatomy-20261017/`。当前原始模型为 `assets/anatomy/pod-colored.glb`，未经重建或图片替代；主要产品分组/双语文案/拆解位移继续来自 `src/anatomy/pod/modules.ts` 与 `partGroups.json`。源码中的产品描述为参考稿内容，本次仅做网站交互移植。

产品 UI 在 `src/anatomy/pod/`；`anatomy.js` 负责接近视口时加载，`anatomy.css` 将原来的固定全屏页面适配到官网章节。`site-header.css` 与 `site-ui.js` 管理白色常驻顶栏及全站中英文状态；语言选择记忆在 `kpro-language`，可用 `?lang=zh#product` 直达中文产品页。原来的小世界局部语言按钮已合并到全站顶栏。社交入口保留在页尾。

`content.js.productAnatomy` 配置模型路径、备用图片、像素比、加载时限与巡览间隔；`content.js.siteUI` 管理官网其他章节的双语文案。产品始终保留：六项功能、局部高亮、拆解滑杆、上一项/下一项、回到总览、自动巡览、模型热点、拖动和键盘旋转。普通滚轮用于滚动官网；模型可双指或加减键缩放。离开视口、切换标签、进入全景时暂停产品渲染。手机将六项功能变为横向选项，显示当前说明，避免选择功能与模型脱离。

运行 `npm run build` 会同时构建产品、小世界与全景，共享 Three.js。此项目使用现有 `tools/.pnpm-store` 缓存；增加依赖时继续指定该目录，避免全局缓存位置与已安装依赖不一致。参考 React 18 / Fiber 8 依赖保留，Three.js 沿用项目 0.185.0。

备份：`backups/pre-product-anatomy-20261017-112306/`。验收入口：`验收/anatomy-fixture.html`；`?mode=failed-model` 验证失败状态。另外可用 `?mode=no-webgl` 验证不支持 3D 时的备用界面。最终结果、截图与测试范围见 `验收/产品完整版检查.json`。该测试页不进入正式官网；当前修改仅在本地预览，不代表已推送或部署。手机验收为响应式视口与交互检查，不等同于实体手机性能测试。

### 第二页定稿还原（2026-10-17）

- 本地入口：`http://127.0.0.1:4173/?lang=en#routine`；中文可用顶部语言切换或 `?lang=zh#routine`。
- `#routine` 已改为原设计的白色双栏，左侧使用可选取的 HTML 标题、三项卖点、描边按钮和注释，右侧为同一张黑白肖像。旧纸条配置保留，主页面不再渲染；`app.js` 对历史页面的纸条容器作存在检查。
- 布局比例来自当前用户提供的定稿，并在项目旁的 `../K Pro/1.png` 找到原始 1920×1080 导出图。`assets/routine-intro/design-source.png` 为原图的无修改副本；SVG 视窗仅显示 x=925、y=0、w=995、h=1080 的人物区域，左侧文字与按钮均重新实现，不是整页截图。
- 新样式、交互分别位于 `routine-intro.css`、`routine-intro.js`；该章节从玻璃分组中移除，其他章节的背景、3D、360° 与固定白色导航不变。
- 本地 Poppins 400/700/800 字体来自 Google Fonts 官方仓库 `google/fonts/ofl/poppins`，许可证保存在 `assets/routine-intro/OFL.txt`。没有新增 npm 依赖。
- 所有新文案、媒体、按钮目标集中在 `content.js` 的 `routineIntro`。英文标题保留设计中的 L Pro，未全站重命名 K pro。
- 后续视频：将文件放在 `assets/routine-intro/`，填入 `routineIntro.media.video`。视频默认为静音循环、行内播放、进入可见区域播放、离开或页面隐藏/弹窗打开时暂停；拒绝自动播放时提供播放按钮，加载失败保留封面。`position` / `mobilePosition` 控制裁切；`grayscale` 控制去色。这段视频不接入全站背景的滚动控帧。
- 后续独立封面：修改 `media.poster.src`、真实 `width` / `height`，将 `crop` 设为 `[0, 0, 图片宽, 图片高]`。SVG 采用等比 cover 视窗，不会拉伸。
- 两个按钮名称保持设计。`actions.order.url` 为空时打开订购未开放说明；`actions.how.url` 为空时展示来自 `../K Pro/2.png`～`4.png` 的概念准备流程。配置真实地址后自动切换为链接，不模拟购买成功。
- 修改前备份：`backups/pre-routine-design-20261017-164732/`，含原源码、README、package.json、pnpm-lock.yaml 与 12 个保护文件的 SHA-256。
- 本轮已在浏览器检查 1440×894、960×900、390×844、320×740 的布局；检查中英文、两个按钮弹窗、Escape/焦点恢复、360° 打开关闭及产品功能选择。截图与结果保存在 `验收/第二页定稿-*` 和 `验收/第二页定稿检查.json`。正式视频尚未提供，本轮没有将视频播放描述为已验收。

### 定价与体验预约区域（2026-10-17）

入口：`http://127.0.0.1:4173/?lang=en#pricing`。它位于主页 App 介绍之后、FAQ 之前，可顺着主页滚动进入；第二页的 **Order now** 以及页尾 Pricing 均跳到这里。定价区域的按钮保持在同一章节内切换，没有接入支付或后台。

- 默认页还原白底双栏、产品图轮播与缩略图、价格、两个胶囊按钮和三组互斥折叠说明。`#pricing-refills`、`#pricing-specs` 可直接打开护理补充装或规格；`#pricing-demo`、`#pricing-online`、`#pricing-plans` 分别进入线下体验、线上咨询、套餐对比。浏览器前进/后退恢复对应视图。
- 价格、双语文案、产品图裁切、时段、时区和动效时间集中在 `pricing-content.js`；样式与交互分别在 `pricing.css`、`pricing.js`。设计稿中的 L PRO 与价格原样采用，没有改动全站其他品牌文案，也没有补造未确认的技术规格。
- 当前产品素材为用户图一的原始副本 `assets/pricing/product-source.png`，SVG 视窗只显示产品区域。前景文字、按钮和表单均为实际页面元素。细节缩略图是同一图片的局部放大，尚无独立高清产品图或其他视角；后续可替换素材并更新尺寸、裁切配置。八张参考原图保存在 `design-references/pricing-20261017/`。
- 页面切换淡入/位移 320ms，套餐布局列宽变化 460ms，折叠展开 300ms；遵循系统减少动态效果设置。静态参考未提供时间曲线，因此这些时长是本轮实现值，可集中调整。背景、首屏字标柔焦、第二页视频接口、3D 与全景模块未改动。
- 进入定价区域时，同一个白色固定顶栏显示 L PRO、Overview / Experience / Pricing、L’ORÉAL，并保留 EN/中文切换。离开后恢复原站导航。手机纵向排列，320px 窄屏日期/时间分行。
- 预约表单只做本地必填、邮箱与日期校验；两种预约方式共享已填内容，套餐选择会预选版本。提交后明确显示信息未发送、预约未创建、不涉及付款。**没有网络提交、个人信息持久化或实际购买行为**；刷新页面会清空输入。
- 修改前备份：`backups/pre-pricing-20261017-183306/`，含源文件和锁文件的 SHA-256。未安装依赖、未修改构建模块、未推送或部署。
- 验收记录与桌面、手机截图保存在 `验收/定价页检查.json`、`验收/pricing-*.png`。本轮手机检查是浏览器响应式视口，不等同于真实设备性能验收。

本轮固定 Workspace 查找结果：`/Volumes/*/AI/workspace` 无候选，`/Users/lisuhang1/AI/workspace` 不存在，因此 `WORKSPACE_ROOT` 未能确定，固定位置的规则及经验日志不可用。沿用用户已指定的现有项目目录完成修改；成功读取了旧位置 `/Users/lisuhang1/Desktop/欧莱雅/codex工作文档/踩坑日志.txt`，该目录的 `规矩文档.txt` 不存在。未新建替代 Workspace，也未向其他路径追加固定日志。

### App 与 FAQ 白底、章节顺序调整（2026-10-17）

按用户最新要求，App 手机展示区与 Before you begin 均从毛玻璃分组移出，采用不透明 `#fff` 背景；适用于桌面和手机。App 的白色表面铺满视口，内容继续按原 1440px 宽度上限对齐，避免超宽屏两侧露出背景。页面顺序为 App → Pricing → Before you begin → 页尾，原文案、下载按钮和 FAQ 展开行为保持不变。修改前备份：`backups/pre-white-app-faq-20261017-194118/`。

### How to Use 视频入口（2026-10-17）

按用户最新纠正，第二页 **How to Use／如何使用** 在当前标签页跳转到其提供的 Bilibili 视频 `https://www.bilibili.com/video/BV19oJQ69E5X/?share_source=copy_web&vd_source=8aa295a01e9dc9bc3cfdb93b2249a279`。按钮目标集中在 `content.js` 的 `routineIntro.actions.how.url`，HTML 默认链接同步；中英文使用同一目标，样式不变。此要求替代上一轮 How to Use 进入定价区域的行为，之前验收记录中的对应条目属于历史版本。Order now 继续进入 `#pricing`。


## 2026-10-17 体验改版

本轮按“语言与跳转 → 建筑反馈 → 内容密度 → 导航与手机表单 → 实际浏览器验收”的计划实施。视觉保留现有黑白布局、媒体素材及首屏两行柔焦；最新界面品牌统一为 L PRO，旧 K 字标素材仍保留供历史版本使用。

- 全站共用固定白色顶栏，手机通过 Menu / 菜单选择章节；支持当前章节指示、Escape 关闭和键盘焦点恢复。
- 语言按钮同步更新 `?lang=`，刷新与浏览器返回会恢复对应语言；四个全景的标题、操作提示和无障碍名称也支持中英文。
- `content.js → worldOverview.hover` 集中控制建筑 1.04 倍放大、200ms 过渡、白色轮廓宽度及暗色细边。建筑从基部放大，道路和底座不移动；标签与建筑联动。悬停暂停自动旋转，移开后恢复；清除残余镜头惯性，避免高亮建筑仍在漂移。键盘聚焦提供等效反馈，减少动态效果时保留轮廓而关闭缩放。
- 产品功能只展示当前说明，避免六段说明同时占据画面；桌面取消内层文字滚动，手机将说明与模型按正常文档顺序排列。App、Pricing 与 FAQ 使用明确分界和内容留白，不加入整页吸附或滚轮劫持。
- 手机预约使用紧凑产品图，进入预约时直接对齐表单；线下 / 线上切换保留位置及已填内容。价格、预约仍是本地概念演示，没有付款、外发预约或个人信息存储。
- 概览按钮使用 View plans / 查看方案；How to Use 仍指向用户指定的 Bilibili 视频，并带外站提示。App 页面直接说明 Coming soon，保留点击反馈。

当前交互回归入口为 `验收/ux-fixture.html`，默认生产页面副本加独立测试控件，不被正式首页引用。“运行交互回归”检查实际建筑射线命中、缩放/轮廓、移开复原、拖动防误触、全景对应、返回位置及焦点；`?mode=reduced` 检查减少动态效果。其 pointer/touch 为测试页面派发的 DOM 事件，不能等同于实体手机触控性能验证。“运行页面流程”检查语言、导航、单项功能说明、白色 App / FAQ、预约位置和表单保留、方案与折叠说明。

完整结果与截图见 `验收/体验改版检查.json` 与 `验收/ux-*.png`。浏览器视口验证与实体设备性能验证须明确区分；正式视频仍待后续素材。改版前主分支基线为 `717053a`，中途本地进度存档为 `0afba66`；远程上传须以实际 Git 结果为准。


### 首页自动播放视频（2026-10-17）

按用户最新要求，以静音自动循环播放替代首页背景的滚动控帧。源视频原样复制到 `assets/hero-loop.mp4`（1,676,679 字节，SHA-256 `c04ec874021d9be641acb2d5c62dd8ea07989b303a781d77f7c29aadf63b1d6f`），未移动或覆盖微信原文件。修改前文件备份在 `backups/pre-hero-video-20261017/`。正文布局、毛玻璃与品牌柔焦保持原样；第二页右侧媒体配置未改动。浏览器实测结果见 `验收/首页视频检查.json`。本轮未进行远程 Git 推送或发布。


### 第二页右侧人像视频（2026-10-18）

按用户要求，将第二页右侧人像占位替换为 `assets/routine-intro/portrait-loop.mp4`。源视频原样复制，未移动或覆盖原文件；大小 1,013,571 字节，SHA-256 `7ca8e689651a0e634f96cbccf0c37f5f2a8e3261dd8cdaa7e5220ffd0b43d4d4`。配置入口为 `content.js → routineIntro.media.video`。沿用既有静音循环与行内播放：进入可见区域自动播放，离开、隐藏标签页或打开弹窗时暂停；返回后恢复，用户主动暂停时保留暂停状态。保留黑白 cover 裁切、图片回退和中英文播放按钮。首页背景视频、左侧文案和两个链接保持不变。

修改前备份：`backups/pre-routine-video-20261018/`。本地检查见 `验收/第二页视频检查.json`。手机检查为浏览器响应式视口，不代表实体手机性能验收。
