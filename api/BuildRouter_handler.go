package api

import (
	"fmt"
	"os"

	"Goland/middleware"

	"github.com/gin-gonic/gin"
)

// InitRouter 初始化路由
func InitRouter() *gin.Engine {
	router := gin.Default()

	// 接入日志中间件
	router.Use(middleware.Logger())

	// 静态文件目录
	const staticPath = "./static"

	if _, err := os.Stat(staticPath); os.IsNotExist(err) {
		fmt.Printf("警告: 静态文件目录不存在: %s\n", staticPath)
	} else {
		fmt.Printf("静态文件目录存在\n")
	}

	router.Static("/static", staticPath)

	// HTML 页面路由
	router.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})
	router.GET("/admin", func(c *gin.Context) {
		c.File("./static/admin.html")
	})

	// 公开 API
	router.GET("/api/profile", GetPublicProfile)
	router.GET("/api/messages", GetMessages)
	router.POST("/api/messages", CreateMessage)
	router.POST("/api/messages/:id/like", LikeMessage)
	router.POST("/api/login", LoginUser)
	router.POST("/api/updatepassword", UpdateUserPassword)

	// 受保护的 API - 需要 JWT 验证
	authGroup := router.Group("/api")
	authGroup.Use(middleware.AuthMiddleware())
	{
		authGroup.PUT("/profile", UpdateProfile)
		authGroup.GET("/admin/check", CheckAdminAuth)
	}

	return router
}
