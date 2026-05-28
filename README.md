# PersonalWebsite

基于本人曾经写的一个后端框架，使用 ClaudeCode 辅助编程，采用 Go/Gin 框架的个人展示网站，包含公开展示页面、留言板，以及 JWT 保护的管理后台，支持 HTTP/HTTPS 自适应启动。

## 技术栈😋

- **后端**: Go 1.25 + Gin v1.11
- **认证**: JWT (HS256, 2小时过期)
- **存储**: JSON 文件持久化
- **前端**: 原生 HTML/CSS/JS，Canvas 粒子背景，响应式布局

## 快速开始😮

```bash
go mod download          # 安装依赖
go run main.go           # 启动服务器 (自动检测证书，有证书走 HTTPS，否则走 HTTP)
go build -o main.exe     # 编译为可执行文件
```

双击 `start.bat` 也可以在 Windows 下快速启动😍😍（自动编译并运行），可以访问`localhost:8080`来查看效果。

## 启动模式🫡

程序启动时会自动检测 `ssl/` 目录下的证书文件：

- **证书存在** (`ssl/server.crt` + `ssl/server.key`): 以 HTTPS 模式启动，监听 `10.17.88.210:8443`
- **证书缺失**: 以 HTTP 模式启动，监听 `:8080`
- **如果需要启用HTTPS协议，请自行创建`ssl/`目录，添加`ssl/server.crt`和`ssl/server.key`**

## 项目结构😝
- **前言**：请自行创建`data/image/`文件夹存放要展示的照片，可以选择自行创建`ssl/`用于存放`.crt`与`.key`文件以启动HTTPS
```
├── main.go                          # 程序入口（数据初始化 + 自适应 HTTP/HTTPS 启动）
├── router/
│   └── init.go                      # 路由配置（静态文件、公开/受保护 API）
├── api/
│   ├── auth_handler.go              # 登录 + 密码修改处理器
│   ├── img_handler.go               # 缩略图 + 原图加载处理器
│   ├── message_handler.go           # 留言板处理器（CRUD + 点赞）
│   └── profile_handler.go           # 个人信息处理器（公开获取 + 管理员更新 + token 校验）
├── middleware/
│   ├── auth.go                      # JWT 验证中间件
│   ├── logger.go                    # 请求日志中间件
│   └── staticCache.go               # 静态资源缓存中间件
├── model/
│   ├── authModel.go                 # 认证相关模型（User, UpdatePassword）
│   ├── imageModel.go                # 图像模型（ImagePath, ImageItem）（说实话这没有多大用🫥
│   ├── messageModel.go              # 留言板模型（Message）
│   └── profileModel.go              # 个人信息模型（Profile, Skill, TimelineItem, Stat）
├── dao/
│   ├── userdata.go                  # 用户凭据数据访问层
│   ├── profiledata.go               # 个人信息数据访问层
│   ├── messagedata.go               # 留言板数据访问层
│   └── imagedata.go                 # 图片数据访问层
├── utils/
│   └── jwt_demo.go                  # JWT 生成/解析工具
├── static/
│   ├── index.html                   # 公开展示主页（打字机效果、粒子背景）
│   ├── admin.html                   # 管理后台（登录 + 个人信息编辑）
│   ├── js/
│   │   ├── home.js                  # 主页交互逻辑
│   │   └── admin.js                 # 后台交互逻辑
│   ├── css/
│   │   ├── docsy-styles.css         # 设计系统 CSS 变量
│   │   ├── showcase.css             # 展示页样式
│   │   └── styles.css               # 通用样式
│   ├── audio/
│   │   ├── his-theme.mp3            # 背景音乐 《HisTheme》
│   │   └── jian.mp3                 # 背景音乐 《涧》
│   └── img/                         # 个人头像存放处（其实后台登录是可以直接输入相对路径的）                
├── data/
│   ├── image/                       # 相册图片存放处（自行创建）
│   ├── userdata.json                # 用户凭据持久化存储（若不存在会自动创建）
│   ├── profile.json                 # 个人信息持久化存储（若不存在会自动创建）
│   └── messages.json                # 留言板持久化存储（若不存在会自动创建）
├── ssl/                             # SSL 证书存放目录（可选）
│   ├── server.crt
│   └── server.key
```

## API 路由😋

| 方法     | 路径                             | 认证  | 说明              |
|--------|--------------------------------|-----|-----------------|
| GET    | `/`                            | 无   | 公开展示主页          |
| GET    | `/admin`                       | 无   | 管理后台页面          |
| GET    | `/api/profile`                 | 无   | 获取公开个人信息        |
| GET    | `/api/messages`                | 无   | 获取留言列表          |
| POST   | `/api/messages`                | 无   | 创建留言            |
| POST   | `/api/messages/:id/like`       | 无   | 点赞留言            |
| GET    | `/api/images`                  | 无   | 获取图像名（好像没啥用）    |
| GET    | `/api/images/:imagename`       | 无   | 获取原图数据          |
| GET    | `/api/images/thumb/:imagename` | 无   | 获取缩略图数据         |
| POST   | `/api/login`                   | 无   | 管理员登录，返回 JWT    |
| POST   | `/api/updatepassword`          | 无   | 修改管理员密码         |
| PUT    | `/api/profile`                 | JWT | 更新个人信息          |
| GET    | `/api/admin/check`             | JWT | 验证管理员 token 有效性 |
| DELETE | `/api/messages/:id`            | JWT | 删除留言            |

## 功能特性😍

- **粒子背景**: Canvas 动态粒子效果，正弦漂动动画
- **侧边导航栏**: 页面区域滚动导航，IntersectionObserver 动画
- **打字机效果**: Hero 区域动态文字展示
- **相册系统**: 图片水平滚动展示，支持鼠标拖拽和自动滚动，灯箱大图
- **音乐播放**: 多曲目切换，圆形轮盘选曲，自动循环播放
- **留言板**: 访客留言 + 点赞，管理员可删除
- **管理后台**: JWT 登录，支持编辑个人信息、技能、时间线、统计数据
- **自适应协议**: 根据证书存在与否自动选择 HTTP/HTTPS
- **静态资源缓存**: `/static` 目录下资源缓存一周

## 初始管理员账号😎

在 `data/userdata.json` 中手动添加（首次运行自动创建空文件）：

```json
{"admin": "yourpassword"}
```
## 后台留言格式🤗

```json
{
  "id": "theID",
  "name": "theName",
  "content": "theText",
  "timestamp": "time",
  "likes": 0 
}
```
 
## JWT 认证流程

1. 客户端 `POST /api/login` 发送用户名密码
2. 服务端验证后返回 JWT token
3. 客户端将 token 存入 localStorage
4. 后续受保护请求携带 `Authorization: Bearer <token>` 请求头
5. `AuthMiddleware` 验证 token 并将 `username` 注入 Gin 上下文

## 前端静态资源版本控制

修改 `static/` 下的 CSS/JS 后，需在 HTML 中递增查询字符串版本号（`?v=N`）以强制浏览器刷新缓存，因为静态资源已启用一年的强缓存。
