package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		me := c.Request.Method
		path := c.Request.URL.Path

		c.Next()

		duration := time.Since(start)
		log.Printf("请求完成 | 方法 %s | 路径 %s | 耗时 %v", me, path, duration)
	}
}
