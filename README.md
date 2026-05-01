# 拿个offer - JD 深度分析工具

AI 驱动的职位描述（JD）深度分析工具，帮助求职者看清 JD 背后的真实工作内容、隐藏要求和发展前景。

支持接入 **DeepSeek**、**OpenAI**、**硅基流动** 等兼容 OpenAI 协议的模型。

[在线访问](https://baijidot.github.io/Find-a-job) · [报告问题](https://github.com/Baijidot/Find-a-job/issues)

---

## 功能一览

### 首页分析（快速扫描）

| 功能 | 说明 |
|------|------|
| **真实日常工作** | JD 写的"参与重要项目"实际在干什么？AI 帮你还原 |
| **隐藏要求** | JD 没写但面试会问的：抗压能力、资源协调、应急处理… |
| **风险预警** | 加班文化、薪资虚高、团队不稳定等信号 |
| **投递建议** | 推荐 / 谨慎考虑 / 不建议，给出决策依据 |
| **薪资分析** | 估算真实薪资范围，识别绩效/期权猫腻 |
| **行动计划** | 投递前 → 面试前 → 入职前的具体准备方案 |

### 专项深度分析

- **技能全景地图** - 技术栈、软技能、工具技能分类提取，附学习路径
- **角色拆解** - 在团队中的定位、汇报线、时间分配
- **洞察报告** - 市场趋势、行业对标、职业发展路径
- **对比分析** - 两个 Offer 同时对比，多维度量化打分

### 简历与面试

- **简历匹配度** - 量化 JD 与简历的匹配程度，给出优化建议
- **技能差距热力图** - 明确当前技能与岗位要求的差距
- **面试问题生成** - 基于 JD 生成个性化面试题，附答题思路
- **AI 模拟面试** - 模拟真实面试，评分 + 改进建议
- **简历定制** - 针对目标公司定制简历，突出匹配项

### 辅助功能

- **薪资可信度检测** - 市场对比、水分指数、谈判建议
- **公司调研** - 基于公开信息分析公司口碑与风险
- **收藏与历史** - 分析记录本地保存，随时回顾

---

## 技术栈

- **前端框架**: React 18 + Vite 5
- **样式**: Tailwind CSS
- **AI**: OpenAI 协议（支持 DeepSeek / OpenAI / 硅基流动等）
- **存储**: LocalStorage
- **协议**: MIT 开源

---

## 快速上手

### 方式一：直接访问（推荐）

访问 [在线版本](https://baijidot.github.io/Find-a-job)，无需任何配置。

### 方式二：本地运行

```bash
git clone https://github.com/Baijidot/Find-a-job.git
cd Find-a-job/jd-reality-analyzer
npm install
npm run dev
```

然后打开 `http://localhost:5173`。

---

## 配置 API Key

1. 点击左侧边栏底部的 **设置**（齿轮图标）
2. 填写你的 API Key、模型地址和模型名称
3. 点击 **保存并测试** 验证连接

支持的模型配置示例：

| 模型 | Base URL | 模型名称 |
|------|----------|----------|
| DeepSeek V4 | `https://api.deepseek.com/v1` | `deepseek-chat` |
| DeepSeek V4-flash | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 硅基流动 (免费额度) | `https://api.siliconflow.cn/v1` | `Qwen/Qwen2.5-72B-Instruct` |
| OpenAI GPT-4o | `https://api.openai.com/v1` | `gpt-4o` |

> **隐私提示**: 你的 API Key 仅存储在浏览器本地（LocalStorage），不会上传到任何服务器。

---

## 项目结构

```
jd-reality-analyzer/
├── src/
│   ├── components/          # React 组件
│   │   ├── pages/            # 各功能页面
│   │   │   ├── CompareAnalysis.jsx      # 对比分析
│   │   │   ├── Favorites.jsx           # 收藏
│   │   │   ├── History.jsx             # 历史记录
│   │   │   ├── InsightReport.jsx       # 洞察报告
│   │   │   ├── InterviewPrep.jsx        # 面试准备
│   │   │   ├── MockInterview.jsx       # 模拟面试
│   │   │   ├── ResumeMatch.jsx          # 简历匹配
│   │   │   ├── ResumeTailor.jsx         # 简历定制
│   │   │   ├── RoleBreakdown.jsx       # 角色拆解
│   │   │   ├── SalaryCheck.jsx          # 薪资检测
│   │   │   ├── SkillExtract.jsx        # 技能提取
│   │   │   └── SkillGap.jsx            # 技能差距
│   │   ├── AnalysisRecordContent.jsx
│   │   ├── FeatureGrid.jsx
│   │   ├── HeroSection.jsx
│   │   ├── InputSection.jsx
│   │   ├── JdUrlInput.jsx
│   │   ├── JobRealityCard.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── PlanCard.jsx
│   │   ├── ReportExportMenu.jsx
│   │   ├── ResultPanel.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── Sidebar.jsx
│   │   └── SkillsCard.jsx
│   ├── hooks/
│   │   └── useAnalysisTask.js           # 分析任务状态管理
│   ├── utils/
│   │   ├── ai.js                         # AI 调用与 JSON 解析
│   │   ├── analysisPipeline.js          # 分析流程编排
│   │   ├── analysisSchemas.js          # JSON Schema 验证
│   │   ├── jdFetcher.js                 # JD 内容抓取
│   │   ├── reportExport.js              # 报告导出
│   │   ├── resultModel.js               # 结果数据结构
│   │   └── storage.js                   # 本地存储
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## License

MIT © [白芨](https://github.com/Baijidot)
