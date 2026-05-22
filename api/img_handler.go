package api

import (
	"webproject/dao"

	"github.com/gin-gonic/gin"
)

func GetImage(c *gin.Context) {
	imageList, err := dao.GetImage()
	if err != nil {
		c.JSON(500, gin.H{
			"code":      500,
			"message":   "图片数据加载失败",
			"imageList": nil,
		})
		return
	}
	c.JSON(200, gin.H{
		"code":      200,
		"message":   "图片数据加载成功",
		"imageList": imageList,
	})
}
