package api

import (
	"Goland/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetPublicProfile 公开获取个人信息
func GetPublicProfile(c *gin.Context) {
	profile := dao.GetProfile()
	c.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"data": profile,
	})
}

// UpdateProfile 管理员更新个人信息（需要 JWT）
func UpdateProfile(c *gin.Context) {
	var profile = dao.GetProfile()
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    http.StatusBadRequest,
			"message": "输入数据格式有误",
		})
		return
	}

	dao.UpdateProfile(profile)
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "个人信息更新成功",
		"data":    profile,
	})
}

// CheckAdminAuth 验证管理员 token 是否有效
func CheckAdminAuth(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    http.StatusInternalServerError,
			"message": "无法获取用户信息",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":     http.StatusOK,
		"message":  "令牌有效",
		"username": username,
	})
}
