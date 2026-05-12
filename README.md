# 用户管理系统 - JWT验证实现

这是一个基于Gin框架的Go Web应用，实现了完整的用户认证系统，包括JWT令牌验证、用户注册、登录和主页面展示功能。

## 🚀 功能特性

### 核心功能
- ✅ **JWT令牌验证** - 完整的JWT生成、验证和管理
- ✅ **用户注册** - 新用户注册功能
- ✅ **用户登录** - 安全的用户登录验证
- ✅ **密码管理** - 忘记密码和密码修改功能
- ✅ **主页面展示** - 登录后的用户主页面
- ✅ **Docsy风格UI** - 现代化的用户界面设计

### 安全特性
- 🔐 JWT令牌认证
- 🔐 令牌过期机制（2小时）
- 🔐 Bearer令牌验证
- 🔐 受保护的路由中间件
- 🔐 输入验证和错误处理

### 用户体验
- 🎨 现代化Docsy设计风格
- 📱 响应式布局，支持移动设备
- ✨ 流畅的动画效果
- 🔄 自动登录跳转
- 💾 本地存储管理
- ⌨️ 键盘快捷键支持

## 📋 项目结构

```
WebProject 1/
├── main.go                          # 主程序入口
├── start.bat                        # 启动脚本
├── README.md                        # 项目说明文档
├── api/
│   ├── BuildRouter_handler.go       # 路由配置
│   ├── RegisterLogin_handler.go     # 注册登录处理器
│   ├── UpdatePassword_handler.go    # 密码更新处理器
│   └── Dashboard_handler.go         # 主页面处理器
├── middleware/
│   ├── logger.go                    # 日志中间件
│   └── auth.go                      # JWT验证中间件
├── model/
│   └── model.go                     # 数据模型
├── dao/
│   └── userdata.go                  # 数据访问层
├── utils/
│   └── jwt_demo.go                  # JWT工具函数
└── static/
    ├── docsy-styles.css             # Docsy样式系统
    ├── docsy-dashboard.html         # Docsy风格主页面
    ├── docsy-dashboard.js           # 主页面脚本
    ├── styles.css                   # 基础样式
    ├── login.html                   # 登录页面
    ├── login.js                     # 登录脚本
    ├── register.html                # 注册页面
    ├── register.js                  # 注册脚本
    ├── forgot-password.html         # 忘记密码页面
    ├── forgot-password.js           # 忘记密码脚本
    └── test.html                    # 测试页面
```

## 🛠️ 快速开始

### 环境要求
- Go 1.25 或更高版本
- 现代浏览器（Chrome、Firefox、Edge等）

### 安装依赖

```bash
go mod download
```

### 启动服务器

#### 方式一：使用启动脚本（推荐）
```bash
start.bat
```

#### 方式二：直接运行
```bash
go run main.go
```

#### 方式三：编译后运行
```bash
go build -o main.exe
./main.exe
```

### 访问应用

服务器启动后，访问以下URL：

- 🏠 **主页**: `http://10.17.92.32:8080/`
- 🔐 **登录页面**: `http://10.17.92.32:8080/login`
- 📝 **注册页面**: `http://10.17.92.32:8080/register`
- 🔑 **忘记密码**: `http://10.17.92.32:8080/forgot-password`
- 🎯 **主页面**: `http://10.17.92.32:8080/dashboard`
- 🧪 **测试页面**: `http://10.17.92.32:8080/test`

## 🔌 API接口

### 公开接口

#### 用户注册
```http
POST /register
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}
```

#### 用户登录
```http
POST /login
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}

响应:
{
  "code": 200,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 更新密码
```http
POST /updatepassword
Content-Type: application/json

{
  "username": "testuser",
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}
```

### 受保护接口（需要JWT令牌）

#### 获取用户信息
```http
GET /api/dashboard
Authorization: Bearer <your-jwt-token>

响应:
{
  "code": 200,
  "message": "欢迎访问主页面",
  "username": "testuser"
}
```

#### 退出登录
```http
POST /api/logout
Authorization: Bearer <your-jwt-token>

响应:
{
  "code": 200,
  "message": "退出登录成功"
}
```

## 🔐 JWT认证流程

### 1. 登录流程
```
用户输入凭证 → 服务器验证 → 生成JWT令牌 → 返回令牌 → 客户端存储
```

### 2. 访问受保护资源
```
客户端请求 → 携带JWT令牌 → 中间件验证 → 通过后访问资源
```

### 3. 令牌特性
- **算法**: HS256
- **有效期**: 2小时
- **包含信息**: 用户名、签发时间、过期时间
- **存储位置**: localStorage

## 🎨 前端页面

### 登录页面
- 用户名和密码输入
- 密码显示/隐藏切换
- 记住我功能
- 表单验证
- 登录成功自动跳转

### 主页面（Docsy风格）
- 现代化导航栏
- 用户信息展示
- 统计数据卡片（带数字动画）
- 功能特性展示
- 最近活动列表
- 退出登录功能
- 响应式设计

### 测试页面
- API功能测试
- 本地存储检查
- 系统信息展示
- 快速链接导航

## 🧪 测试指南

### 1. 基础功能测试

#### 注册测试
1. 访问 `http://10.17.92.32:8080/register`
2. 填写用户名和密码
3. 提交注册
4. 验证注册成功提示

#### 登录测试
1. 访问 `http://10.17.92.32:8080/login`
2. 输入注册的用户名和密码
3. 点击登录
4. 验证是否跳转到主页面

#### JWT验证测试
1. 登录成功后，打开浏览器开发者工具
2. 检查Application → Local Storage
3. 验证token是否存在
4. 访问 `http://10.17.92.32:8080/api/dashboard`
5. 验证是否能获取用户信息

### 2. 安全测试

#### 令牌过期测试
1. 登录获取token
2. 等待2小时令牌过期
3. 尝试访问受保护资源
4. 验证是否被拒绝

#### 无效令牌测试
1. 修改localStorage中的token
2. 尝试访问受保护资源
3. 验证是否被拒绝

#### 直接访问测试
1. 清除localStorage
2. 直接访问 `http://10.17.92.32:8080/dashboard`
3. 验证是否自动跳转到登录页面

### 3. 使用测试页面

访问 `http://10.17.92.32:8080/test` 使用内置的测试工具：
- API功能测试
- 本地存储管理
- 系统信息查看

## ⚙️ 配置说明

### 服务器配置
- **地址**: `10.17.92.32:8080`
- **静态文件路径**: `E:\GoProject\WebProject\static`

### JWT配置
- **密钥**: `MyFirstJWTSecret123` (生产环境请修改)
- **过期时间**: 2小时
- **算法**: HS256

## 🔧 故障排除

### 常见问题

#### 1. 服务器启动失败
- 检查端口8080是否被占用
- 检查Go环境是否正确配置
- 检查静态文件路径是否正确

#### 2. 登录失败
- 检查用户名和密码是否正确
- 检查服务器是否正在运行
- 查看浏览器控制台错误信息

#### 3. JWT验证失败
- 检查token是否过期
- 检查token格式是否正确
- 检查Authorization头是否正确设置

#### 4. 页面样式异常
- 检查CSS文件是否正确加载
- 清除浏览器缓存
- 检查网络连接

## 📝 开发说明

### 添加新功能

1. **后端API**
   - 在 `api/` 目录创建处理器函数
   - 在 `api/BuildRouter_handler.go` 中添加路由

2. **前端页面**
   - 在 `static/` 目录创建HTML文件
   - 添加对应的JavaScript文件
   - 在路由中添加页面重定向

3. **中间件**
   - 在 `middleware/` 目录创建中间件函数
   - 在路由中应用中间件

### 代码规范

- 遵循Go语言代码规范
- 使用有意义的变量和函数名
- 添加适当的注释
- 处理所有可能的错误

## 🚀 后续计划

- [ ] 添加用户个人资料编辑
- [ ] 实现令牌刷新机制
- [ ] 添加用户权限管理
- [ ] 实现文件上传功能
- [ ] 添加邮件通知功能
- [ ] 实现多语言支持
- [ ] 添加数据统计和分析
- [ ] 优化性能和安全性

## 📄 许可证

本项目仅供学习和研究使用。

## 🤝 贡献

欢迎提交问题和改进建议！

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交Issue
- 发送邮件

---

**注意**: 本项目使用测试配置，生产环境部署前请修改JWT密钥和其他安全配置。
