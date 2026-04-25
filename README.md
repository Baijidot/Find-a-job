# 拿个offer

> 从 JD 看清真实工作 — AI 驱动的职位描述深度分析工具

## ✨ 功能特性

### 🔍 核心 AI 分析（8 个独立维度）

| 功能 | 视角 | 说明 |
|------|------|------|
| **分析 JD** | 求职者利益 | 快速判断岗位值不值得投：真实日常、隐藏要求、风险信号、薪资分析 |
| **简历匹配** ⭐P0 | 候选人匹配 | 量化简历与岗位匹配度（0-100），5维评分 + 差距分析 + 简历优化建议 |
| **面试准备** ⭐P1 | 面试备战 | AI 生成针对性面试题 + 一键搜索小红书/牛客/知乎真实面经 |
| **洞察报告** | 宏观市场 | 行业趋势、市场供需、对标岗位、职业发展路径 |
| **技能提取** | 技能全景 | 技能雷达图、分类匹配度、3个月学习路径推荐 |
| **角色拆解** | 组织行为 | 团队定位、上下级关系、职责占比、协作关系、时间分配 |
| **对比分析** | 决策辅助 | 多维度量化对比两个岗位，辅助 Offer 选择 |

### 🔧 其他功能

- **收藏记录** — 收藏重要分析结果
- **历史记录** — 自动保存所有分析历史
- **JD 链接爬取** — 粘贴招聘链接自动提取 JD 内容（支持字节跳动等主流招聘平台）
- **设置** — 配置 OpenAI 兼容 API（支持 OpenAI / DeepSeek / 通义千问 / Moonshot 等）

## 🛠️ 技术栈

- **React 18** + **Vite 5** + **TailwindCSS 3**
- OpenAI 兼容协议 API 调用
- localStorage 本地持久化
- Jina Reader API 服务端渲染爬取 JD

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装与运行

```bash
# 克隆项目
git clone <repo-url>
cd 拿个offer

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 配置 API Key

1. 启动项目后，点击左侧边栏「设置」
2. 填入你的 OpenAI 兼容 API Key
3. 选择或填写 Base URL（默认 `https://api.openai.com/v1`）
4. 选择模型（默认 `gpt-4o-mini`）
5. 点击「测试连接」验证配置

> 支持任何 OpenAI 兼容协议的 API 服务（OpenAI、DeepSeek、通义千问、Moonshot 等）

## 📁 项目结构

```
拿个offer/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                    # 入口
    ├── App.jsx                     # 主应用（路由）
    ├── index.css                   # 全局样式
    ├── components/
    │   ├── Sidebar.jsx             # 侧边栏导航
    │   ├── HeroSection.jsx         # 首页标题
    │   ├── InputSection.jsx        # JD 输入区
    │   ├── JdUrlInput.jsx          # JD 链接爬取
    │   ├── ResultPanel.jsx         # 分析结果容器
    │   ├── JobRealityCard.jsx      # JD 真相卡片
    │   ├── SkillsCard.jsx          # 技能卡片
    │   ├── PlanCard.jsx            # 行动计划卡片
    │   ├── LoadingOverlay.jsx      # 加载动画
    │   ├── SettingsModal.jsx       # 设置弹窗
    │   └── pages/
    │       ├── InsightReport.jsx   # 洞察报告
    │       ├── SkillExtract.jsx    # 技能提取
    │       ├── RoleBreakdown.jsx   # 角色拆解
    │       ├── CompareAnalysis.jsx # 对比分析
    │       ├── ResumeMatch.jsx     # 简历匹配
    │       ├── InterviewPrep.jsx   # 面试准备
    │       ├── Favorites.jsx       # 收藏记录
    │       ├── History.jsx         # 历史记录
    │       └── HelpFeedback.jsx    # 帮助与反馈
    └── utils/
        ├── ai.js                   # AI 调用（9 个独立分析函数）
        ├── jdFetcher.js            # JD 爬取（多策略）
        └── storage.js              # 本地存储
```

## 👨‍💻 作者

**白芨**
- GitHub: [@Baijidot](https://github.com/Baijidot)

## 📄 License

MIT
