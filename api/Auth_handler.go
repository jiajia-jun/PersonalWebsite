package api

import (
	"Goland/dao"
	"Goland/model"
	"Goland/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// LoginUser 登录请求处理器
func LoginUser(c *gin.Context) {
	var lu model.User

	err := c.ShouldBindJSON(&lu)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    http.StatusBadRequest,
			"message": "输入有效用户名和密码（密码最小长度为八位数）",
		})
		return
	}

	if dao.ConfirmUser(lu.Username, lu.Password) {
		token, errGetTkn := utils.GenerateToken(lu.Username)
		if errGetTkn != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    http.StatusBadRequest,
				"message": "令牌创建失败",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code":    http.StatusOK,
			"message": "登录成功",
			"token":   token,
		})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "用户名或密码错误（密码最小长度需要八位数）",
		})
	}
}
