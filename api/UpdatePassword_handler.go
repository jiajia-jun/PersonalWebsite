package api

import (
	"Goland/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdatePassword 重新定义模型
type UpdatePassword struct {
	Username    string `json:"username" binding:"required"`
	OldPassword string `json:"old_password" binding:"required,min=8"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// UpdateUserPassword 更新密码处理器
func UpdateUserPassword(c *gin.Context) {
	var update UpdatePassword
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    http.StatusBadRequest,
			"message": "输入正确格式的密码或用户名（密码至少八位数）",
		})
		return
	}

	if update.OldPassword == update.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    http.StatusBadRequest,
			"message": "新旧密码不可相同",
		})
		return
	}

	if dao.FindUser(update.Username, update.OldPassword) {
		dao.UpdatePassword(update.Username, update.NewPassword)
		c.JSON(http.StatusOK, gin.H{
			"code":    http.StatusOK,
			"message": "密码修改成功",
		})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "用户名或旧密码错误",
		})
	}
}
