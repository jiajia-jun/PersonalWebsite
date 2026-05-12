package middleware

import (
	"Goland/utils"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT验证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    http.StatusUnauthorized,
				"message": "未授权，请先登录",
			})
			c.Abort()
			return
		}

		// 检查Bearer前缀
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    http.StatusUnauthorized,
				"message": "令牌格式错误",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 验证token
		username, err := utils.ParseToken(tokenString)
		if err != nil {
			log.Printf("Token验证失败: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    http.StatusUnauthorized,
				"message": "令牌无效或已过期",
			})
			c.Abort()
			return
		}

		// 将用户名存入上下文
		c.Set("username", username)
		log.Printf("用户 %s 访问受保护资源", username)
		c.Next()
	}
}
