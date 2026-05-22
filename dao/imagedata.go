package dao

import (
	"os"
	"path/filepath"
	"strings"
	"webproject/model"
)

// GetImage 获取图片信息，返回 []model.ImageItem , error
func GetImage() ([]model.ImageItem, error) {
	// 读取文件夹
	files, err1 := os.ReadDir(model.ImagePath)
	if err1 != nil {
		return nil, err1
	}

	var imagesList []model.ImageItem
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		// 判断是否为图片类型
		ext := strings.ToLower(filepath.Ext(file.Name()))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".gif" {
			continue
		}
		// 添加图片item
		imagesList = append(imagesList, model.ImageItem{
			ImageName: file.Name(),
		})
	}
	return imagesList, nil
}
