package api

import (
	"net/http"
	"time"

	"webproject/dao"
	"webproject/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetMessages 获取所有留言
func GetMessages(c *gin.Context) {
	messages := dao.GetMessages()
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": messages,
	})
}

// LikeMessage 点赞留言
func LikeMessage(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "留言ID不能为空"})
		return
	}

	msg, found := dao.LikeMessage(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": msg,
	})
}

// DeleteMessage 删除留言（需认证）
func DeleteMessage(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "留言ID不能为空"})
		return
	}

	if !dao.DeleteMessage(id) {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

// CreateMessage 创建留言
func CreateMessage(c *gin.Context) {
	var req struct {
		Name    string `json:"name" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "昵称和留言内容不能为空",
		})
		return
	}

	msg := model.Message{
		ID:        uuid.New().String(),
		Name:      req.Name,
		Content:   req.Content,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
	}

	dao.AddMessage(msg)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "留言成功",
		"data":    msg,
	})
}
