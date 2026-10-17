import partGroups from './partGroups.json';

/* ---------------- 模块/站位定义（仿喷气发动机实验台的站位导览） ----------------
   命名规范（L Pro 体系）：四个功能模块统一「动作/功能 + 对象」结构：
   ① 清洗+诊断（摄像头诊断 + 圆孔出水/沐浴露清洗）
   ② 末端清洗与按摩（下部气囊交替鼓扁，揉搓长发末端）
   ③ 护发护理（红光养护 + 精华胶囊）
   ④ 烘干吹发（黑色风道条；红黑交界区待模型精修后确认）
   不再使用「头皮诊断」「自动清洗」等旧错位名，也不用 LP1 / Sculpt 360 / K Pro。 */

export type ModuleId = 'shell' | 'washdiag' | 'ends' | 'care' | 'dry' | 'supply';

export type StationId = 'overview' | 'washdiag' | 'ends' | 'care' | 'dry' | 'structure' | 'exploded';

export interface Readout {
  label: string;
  value: string;
}

export interface StationDef {
  id: StationId;
  /** 左侧目录编号 */
  num: string;
  name: string;
  en: string;
  color: string;
  /** 该站位聚焦的模块组（overview/exploded 为空 = 全部点亮） */
  focus: ModuleId[];
  /** 进入该站位时默认爆炸进度 */
  explode: number;
  camera: { pos: [number, number, number]; target: [number, number, number] };
  /** 底部读出行 */
  readouts: Readout[];
  /** 右侧信息卡 */
  story: { role: string; tech: string; iter: string };
  /** 左侧特性列表的一句话简介（Steampod 版式） */
  brief: string;
  /** 同上，英文版 */
  briefEn: string;
}

export interface ModuleDef {
  id: ModuleId;
  name: string;
  en: string;
  color: string;
  /** tripo_part_N 索引 */
  parts: number[];
  /** 爆炸时的组位移（three.js 坐标，模型 Y-up，正面 +Z，背面 -Z） */
  offset: [number, number, number];
  /** 个别零件的附加位移 */
  partExtra?: Record<number, [number, number, number]>;
  /** 护理机械臂：按零件位置 x 符号向两侧展开 */
  spreadX?: number;
  /** 3D 热点圆标编号（对应左侧特性列表 01-05；supply 无独立热点） */
  hotspot?: string;
  /** 热点圆标的屏幕空间错位（px），避免互相遮挡 */
  hotShift?: [number, number];
}

/* 模块爆炸位移（glTF 坐标：正面 +Z，背面 -Z）：
   - 清洗+诊断舱整体上移，从顶部取出
   - 末端气囊墙小幅上浮，水箱向背部抽出
   - 烘干风道杆向前抽出
   - 机械臂左右展开，胶囊仓向前抽出
   - 上壳/顶罩分层上提，胸面板/柜门向前翻开，背部屏幕盖板向后抽出，底盘下移 */
export const MODULES: ModuleDef[] = [
  {
    id: 'washdiag', name: '清洗+诊断', en: 'WASH + DIAGNOSIS', color: '#00a5c4',
    parts: partGroups.washdiag, offset: [0, 0.34, 0], hotspot: '01', hotShift: [0, -4],
  },
  {
    id: 'ends', name: '末端清洗与按摩', en: 'ENDS WASH & MASSAGE', color: '#2b6fe3',
    parts: partGroups.ends, offset: [0, 0.16, 0], hotspot: '02', hotShift: [34, 42],
    partExtra: { 4: [0, -0.18, -0.3] }, // 净水箱：留在低位、向背部检修口抽出
  },
  {
    id: 'care', name: '护发护理', en: 'HAIR CARE', color: '#a83ae0',
    parts: partGroups.care, offset: [0, 0, 0], hotspot: '03', hotShift: [-66, 48],
    spreadX: 0.26,
    partExtra: { 19: [0, 0, 0.32], 29: [0, 0, 0.32] }, // 胶囊仓向前抽出
  },
  {
    id: 'dry', name: '烘干吹发', en: 'RING DRYER', color: '#e06a00',
    parts: partGroups.dry, offset: [0, 0.02, 0.4], hotspot: '04', hotShift: [98, -14],
  },
  {
    id: 'shell', name: '舱体外壳', en: 'SHELL', color: '#5d748c',
    parts: partGroups.shell, offset: [0, 0, 0], hotspot: '05', hotShift: [-106, -6],
    partExtra: {
      122: [0, 0.1, -0.45],     // 背部屏幕盖板向后抽出
      123: [0, 0.55, 0],        // 上身整壳（穹顶+开口护圈+胸壳）向上提取
      124: [-0.1, -0.12, 0.38], // 下半身左向前下方拉出
      125: [0.1, -0.12, 0.38],  // 下半身右向前下方拉出
      126: [0, -0.2, 0],        // 底座下移
      127: [0, 0.02, 0.2], 128: [0, 0.02, 0.2], 129: [0, 0.02, 0.2],
      130: [0, 0.02, 0.2], 131: [0, 0.02, 0.2], 132: [0, 0.02, 0.2],
      133: [0, 0.02, 0.2], 134: [0, 0.02, 0.2], 135: [0, 0.02, 0.2],
      136: [0, 0.02, 0.2], 137: [0, 0.02, 0.2], 138: [0, 0.02, 0.2],
      139: [0, 0.02, 0.2], 140: [0, 0.02, 0.2], 141: [0, 0.02, 0.2],
    },
  },
  {
    id: 'supply', name: '底盘脚垫', en: 'CHASSIS', color: '#12a05f',
    parts: partGroups.supply, offset: [0, -0.2, 0],
  },
];

/* ---------------- 站位列表 ---------------- */

export const STATIONS: StationDef[] = [
  {
    id: 'overview', num: '00', name: '整机总览', en: 'ASSEMBLED', color: '#1a6fd4',
    focus: [], explode: 0,
    camera: { pos: [1.35, 1.05, 1.7], target: [0, 0.52, 0] },
    readouts: [
      { label: '整机高度', value: '980 mm' },
      { label: '功能模块', value: '4 组' },
      { label: '服务流程', value: '诊→洗→护→烘' },
    ],
    story: {
      role: 'L Pro 立式智能护发舱。默认合壳展示：正面头部舱口与舱面板，背部屏幕带 L\'Oréal Paris 品牌标识；站入舱位后按「诊断→清洗→护理→烘干」完成整套服务。',
      tech: '四大功能模块沿头部→发梢的服务轴分层布置：清洗+诊断 / 末端清洗与按摩 / 护发护理 / 烘干吹发，背部为全开式检修舱。',
      iter: '点击模型任意部位或左侧目录进入站位：外壳与盖板自动分离，呈现内部结构；拖动爆炸滑杆可连续控制。',
    },
    brief: '站入舱位后按「诊断→清洗→护理→烘干」完成整套服务，点击圆标进入各模块。',
    briefEn: 'Step in for a full service — diagnose, wash, care, then dry. Click a marker to explore each module.',
  },
  {
    id: 'washdiag', num: '01', name: '① 清洗+诊断', en: 'WASH + DIAGNOSIS', color: '#00a5c4',
    focus: ['washdiag'], explode: 1,
    camera: { pos: [0.75, 1.55, 1.35], target: [0, 0.95, 0.05] },
    readouts: [
      { label: '视觉精度', value: '4K' },
      { label: '清洗孔位', value: '360° 环阵' },
      { label: '工作水压', value: '0.2–0.4 MPa' },
    ],
    story: {
      role: '中央摄像头先做头皮诊断（AI 检测头屑/出油/泛红并生成报告），周边黑色圆孔随即出水与沐浴露完成清洗，诊断结果直接驱动后续护理配方。',
      tech: '4K 摄像头 + 白光/偏振/紫外三通道照明（复用卡诗 K-SCAN 检测专利）；环形孔位矩阵按诊断报告定量出水。',
      iter: '诊断与清洗合并为同一模块：先诊后洗一气呵成，孔位即诊断环带的出水阵列。',
    },
    brief: '中央 4K 摄像头先行头皮诊断，环形孔位随即按报告定量出水与沐浴露，完成清洗。',
    briefEn: 'A central 4K camera scans the scalp first, then the ring of nozzles dispenses water and shampoo exactly as the report prescribes.',
  },
  {
    id: 'ends', num: '02', name: '② 末端清洗与按摩', en: 'ENDS WASH & MASSAGE', color: '#2b6fe3',
    focus: ['ends'], explode: 1,
    camera: { pos: [1.15, 1.0, 1.7], target: [0, 0.55, 0.05] },
    readouts: [
      { label: '气囊动作', value: '交替鼓/扁' },
      { label: '作用区域', value: '长发末端' },
      { label: '同步出水', value: '水+沐浴露' },
    ],
    story: {
      role: '下部气囊区负责长发末端：气囊一边鼓起一边压扁交替动作，对长发做揉搓按摩，同时出水与沐浴露完成末端清洗。',
      tech: '分区气囊阵列，独立气路交替充放气；水路与气路物理隔离，揉搓与冲洗同步进行。',
      iter: '长发的末端清洁与按摩由本模块独立完成，与顶部「清洗+诊断」分区协作、互不占用。',
    },
    brief: '分区气囊交替鼓扁，揉搓按摩长发末端；水路气路隔离，边揉边冲同步进行。',
    briefEn: 'Zoned air cushions inflate and deflate alternately to knead long hair ends, while water and shampoo rinse in sync — air and water circuits are fully separated.',
  },
  {
    id: 'care', num: '03', name: '③ 护发护理', en: 'HAIR CARE', color: '#a83ae0',
    focus: ['care'], explode: 1,
    camera: { pos: [-1.35, 0.6, 1.35], target: [0, 0.35, 0.1] },
    readouts: [
      { label: '红光养护', value: '头皮/发丝' },
      { label: '药剂载体', value: '护发胶囊' },
      { label: '剂量匹配', value: '按诊断报告' },
    ],
    story: {
      role: '红光区域负责护发护理：红光养护头皮与发丝，配合护发精华胶囊以微雾形式均匀喷洒，机械臂梳理延展。',
      tech: '红光养护模组 + 护发精华胶囊自动分配技术，剂量按诊断报告自动匹配。',
      iter: '护理只做养护不做清洗：取下洗发胶囊、换上护发胶囊即可，一孔两用。',
    },
    brief: '红光养护头皮与发丝，护发精华胶囊以微雾喷洒，剂量按诊断报告自动匹配。',
    briefEn: 'Red-light therapy nourishes scalp and strands while serum capsules mist on, dosed automatically from the diagnosis report.',
  },
  {
    id: 'dry', num: '04', name: '④ 烘干吹发', en: 'RING DRYER', color: '#e06a00',
    focus: ['dry'], explode: 1,
    camera: { pos: [1.55, 0.62, 1.3], target: [0, 0.42, 0.18] },
    readouts: [
      { label: '出风形式', value: '独立圆环' },
      { label: '控温范围', value: '35–55 ℃' },
      { label: '风速档位', value: '全干/半干' },
    ],
    story: {
      role: '黑色风道条构成独立出风结构，环绕发丝输出层流气流，可选全干或半干模式，风温风速连续可调。',
      tech: '电机 + 独立风道，与水路物理分离，杜绝电机进水风险；红色区域功能待模型精修后确认。',
      iter: '红黑交界区先按吹风相关保留占位，待 Lin Zhili 精修模型、辨认红黑区功能后再定文案。',
    },
    brief: '独立环形风道环绕发丝输出层流气流，35–55℃ 连续可调，全干/半干两档。',
    briefEn: 'An independent ring duct delivers laminar airflow around the hair — 35–55℃ continuously adjustable, with full-dry and half-dry modes.',
  },
  {
    id: 'structure', num: '05', name: '结构与底盘', en: 'SHELL & CHASSIS', color: '#5d748c',
    focus: ['shell', 'supply'], explode: 1,
    camera: { pos: [1.8, 1.5, 2.1], target: [0, 0.62, 0.1] },
    readouts: [
      { label: '整机功率', value: '1800 W' },
      { label: '供电', value: '220 V / 50 Hz' },
      { label: '净重', value: '18.4 kg' },
    ],
    story: {
      role: '一体化舱体外壳承托全部功能模块：上身整壳（穹顶/开口护圈/胸壳）、下半身、腰带饰件与背部屏幕盖板分层拆解，底盘集成供水回路与电控。',
      tech: '工程塑料壳体 + 钛灰涂层，水路/电路物理分区，IPX4 防泼溅。',
      iter: '模块化快拆设计：松开锁扣即可整体取下任一功能模块，免工具维护。',
    },
    brief: '一体化舱体分层快拆：穹顶、胸壳、下身与底盘逐一分离，底盘集成供水与电控。',
    briefEn: 'The monocoque shell splits layer by layer — dome, chest panel, lower body and chassis, which integrates the water circuit and control core.',
  },
  {
    id: 'exploded', num: '06', name: '爆炸总览', en: 'EXPLODED VIEW', color: '#1a6fd4',
    focus: [], explode: 1,
    camera: { pos: [2.5, 2.05, 2.85], target: [0, 0.7, 0.1] },
    readouts: [
      { label: '拆解层级', value: '6 组 / 137 件' },
      { label: '拆解方向', value: '沿服务轴分层' },
      { label: '装配顺序', value: '底盘→芯轴→顶罩' },
    ],
    story: {
      role: '整机完整爆炸视图：外壳与盖板分层拆解后呈现完整内部结构，四大功能模块沿服务轴分离，机械臂与水箱/胶囊仓横向抽出。',
      tech: '137 个独立零件按“装配顺序 = 拆解顺序”布点，彩色分组对应左侧模块目录。',
      iter: '拖动爆炸滑杆可连续控制分离程度；点击左侧模块可单独聚焦检查。',
    },
    brief: '137 个零件沿服务轴完整分离，机械臂横展、水箱后抽；拖动滑杆连续控制爆炸程度。',
    briefEn: 'All 137 parts separate along the service axis — arms spread wide, tanks withdrawn. Drag the slider to control the explosion continuously.',
  },
];

export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
) as Record<ModuleId, ModuleDef>;

/** 功能模块 → 站位（用于点击模型部位跳转） */
export const STATION_OF_MODULE: Partial<Record<ModuleId, StationId>> = {
  washdiag: 'washdiag',
  ends: 'ends',
  care: 'care',
  dry: 'dry',
  shell: 'structure',
  supply: 'structure',
};
