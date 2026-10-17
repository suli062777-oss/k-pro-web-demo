# L Pro Exclusive Features（L Pro 独家功能全解析）

单页交互站：仿 L'Oréal Professionnel 官网 Steampod 产品页版式，展示 **L Pro 立式智能护发舱** 的
模块构成与爆炸拆解。左侧白底为模块特性列表，右侧深色舞台为 3D 整机 + 编号热点 + 连续可控的爆炸视图。

- 默认**英文**，右上角可一键切换**中文**（选择记忆在 localStorage，可用 `?lang=zh` 直达）
- 模型：Tripo 生成的整机 `public/models/pod-colored.glb`（meshopt + webp 压缩），122 个零件按空间聚类为 6 组
- 站位导览：00 整机总览 → 01 WASH + DIAGNOSIS → 02 ENDS WASH & MASSAGE → 03 HAIR CARE → 04 RING DRYER → 05 SHELL & CHASSIS → 06 EXPLODED VIEW
- 点击左侧列表或模型上的编号圆标：相机飞行聚焦、模块自发光高亮、其余淡出、自动爆炸
- EXPLODE 滑杆连续控制爆炸分离度；⟲ 回总览，←→ 步进；自动巡览每 7 秒推进一个站位
- 部件分组定义在 `src/pod/modules.ts`，聚类底稿见 `scripts/module_map.json`

## 运行

```bash
npm install
npm run dev      # 开发
npm run build    # 类型检查 + 构建
npm run preview  # 预览构建产物
```

## 部署（GitHub Pages）

推送到 `main` 分支即自动触发 `.github/workflows/deploy.yml`：
以 `GITHUB_PAGES=true` 构建（base = `/V2-L-Pro-Anatomy-main/`），产物发布到 GitHub Pages。

线上地址：`https://lzllzllzllzllzl.github.io/V2-L-Pro-Anatomy-main/`

## 技术栈

Vite 5 + React 18 + TypeScript + Three.js + @react-three/fiber + drei。

## 代码结构

```
index.html            入口（即本页）
src/pod/
  main.tsx            挂载（浅色主题 class）
  PodApp.tsx          左右分割骨架 + 站位/爆炸/巡览状态 + 语言状态
  ui.tsx              字标 / 语言切换 / 特性列表 / 胶囊按钮 / 场景控件 / 加载遮罩
  PodScene.tsx        模型分组爆炸 + 热点圆标 + 相机导览 + 深色舞台环境
  modules.ts          模块/站位定义（双语简介、爆炸位移、热点编号）
  i18n.ts             双语字典与记忆
  pod.css             Steampod 风格样式
src/product/animations.ts  damp 缓动工具
```
