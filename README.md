# VibeCoding

基于 Go/Gin 框架的个人展示网站，包含公开展示页面和 JWT 保护的管理后台。

## 技术栈

- **后端**: Go + Gin
- **认证**: JWT (HS256, 2小时过期)
- **前端**: 原生 HTML/CSS/JS，Canvas 粒子背景，响应式布局

## 快速开始

```bash
go mod download          # 安装依赖
go run main.go           # 启动服务器 （本机服务器或局域网）
# 或
go build -o main.exe     # 编译为可执行文件
```

## 项目结构

```
├── main.go                          # 程序入口
├── api/
│   ├── BuildRouter_handler.go       # 路由配置
│   ├── Auth_handler.go              # 登录处理器
│   ├── Profile_handler.go           # 个人信息处理器（公开/受保护）
│   └── UpdatePassword_handler.go    # 密码修改处理器
├── middleware/
│   ├── auth.go                      # JWT 验证中间件
│   └── logger.go                    # 请求日志中间件
├── model/
│   └── model.go                     # 数据模型（User, Profile, Skill 等）
├── dao/
│   ├── userdata.go                  # 用户数据访问层
│   └── profiledata.go               # 个人信息数据访问层
├── utils/
│   └── jwt_demo.go                  # JWT 生成/解析工具
├── static/
│   ├── index.html / home.js         # 公开展示主页
│   ├── admin.html / admin.js        # 管理后台
│   └── css/                         # 样式文件
├── data/
│   └── profile.json                 # 个人信息持久化存储
└── E:\test\userdata.json            # 用户凭据存储（硬编码路径）
```

## 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 公开展示主页 |
| GET | `/admin` | 管理后台页面 |
| GET | `/api/profile` | 获取公开个人信息 |
| POST | `/api/login` | 用户登录 |
| POST | `/api/updatepassword` | 修改密码 |
| PUT | `/api/profile` | 更新个人信息（需 JWT） |
| GET | `/api/admin/check` | 验证管理员 token |

## 功能特性

- **粒子背景**: Canvas 动态粒子效果，正弦漂动动画
- **侧边导航栏**: 页面区域滚动导航
- **相册系统**: 16 张图片水平滚动展示，支持鼠标拖拽和自动滚动，点击查看灯箱大图
- **音乐播放**: 支持多曲目切换，圆形轮盘选曲，自动循环播放
- **管理后台**: JWT 登录，编辑个人信息、技能、时间线
- **打字机效果**: Hero 区域动态文字展示

## 初始管理员账号

在 `data/userdata.json` 中手动添加：

```json
{"admin": "yourpassword"}
```

## 前端缓存

静态资源使用查询字符串版本控制（`?v=N`），修改 CSS/JS 后需递增版本号以强制浏览器刷新缓存。
