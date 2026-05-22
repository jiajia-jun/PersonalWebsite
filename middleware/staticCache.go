package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// Cache static文件缓存
func Cache() gin.HandlerFunc {
	return func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/static") {
			c.Header("Cache-Control", "public,max-age=31536000") // 一年的缓存时间
		} else if c.Request.URL.Path == "/api/images" {
			c.Header("Cache-Control", "public,max-age=3600") // 一小时的缓存时间
		}
		c.Next()
	}
}
