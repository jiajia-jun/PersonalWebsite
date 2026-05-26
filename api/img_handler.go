package api

import (
	"net/http"
	"path/filepath"
	"webproject/dao"

	"github.com/gin-gonic/gin"
)

func GetImageName(c *gin.Context) {
	imageNames, err := dao.GetImage()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":      500,
			"message":   "图片名称加载失败",
			"imageList": nil,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code":      200,
		"message":   "图片名称加载成功",
		"imageList": imageNames,
	})
}

func GetThumbNail(c *gin.Context) {
	thumbName := c.Param("imagename") + ".thumb.jpeg"
	data, ok := dao.GetThumbnailData(thumbName)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "缩略图未找到",
		})
		return
	}
	c.Data(http.StatusOK, "image/jpeg", data)
}

func GetImageData(c *gin.Context) {
	imagename := c.Param("imagename")
	data, ok := dao.GetImageData(imagename)
	if !ok {
		c.JSON(http.StatusOK, gin.H{
			"code":      http.StatusNotFound,
			"message":   "未找到相关图片数据",
			"imageData": nil,
		})
		return
	}
	ext := filepath.Ext(imagename)
	var contentType string
	switch ext {
	case ".jpg":
		contentType = "image/jpeg"
	case ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	case ".webp":
		contentType = "image/webp"
	}
	c.Data(http.StatusOK, contentType, data)
}
