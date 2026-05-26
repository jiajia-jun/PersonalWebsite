package router

import (
	"log"
	"os"
	"webproject/api"
	"webproject/middleware"

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
		log.Println("静态文件目录不存在")
	} else {
		log.Println("静态文件目录存在")
	}

	// 静态文件映射
	router.StaticFS("/static", gin.Dir(staticPath, false))
	router.Use(middleware.Cache())

	// HTML 页面路由
	router.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})
	router.GET("/admin", func(c *gin.Context) {
		c.File("./static/admin.html")
	})

	// 公开信息路由
	router.GET("/api/profile", api.GetPublicProfile)

	// 图像路由
	router.GET("/api/images", api.GetImageName)
	router.GET("/api/images/thumb/:imagename", api.GetThumbNail)
	router.GET("/api/images/:imagename", api.GetImageData)

	// 留言路由
	router.GET("/api/messages", api.GetMessages)
	router.POST("/api/messages", api.CreateMessage)
	router.POST("/api/messages/:id/like", api.LikeMessage)

	// 后台路由
	router.POST("/api/login", api.LoginUser)
	router.POST("/api/updatepassword", api.UpdateUserPassword)
	// 受保护的 API - 需要 JWT 验证
	authGroup := router.Group("/api")
	authGroup.Use(middleware.AuthMiddleware())
	{
		authGroup.PUT("/profile", api.UpdateProfile)
		authGroup.GET("/admin/check", api.CheckAdminAuth)
		authGroup.DELETE("/messages/:id", api.DeleteMessage)
	}

	return router
}
