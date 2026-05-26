package dao

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"webproject/model"

	"github.com/disintegration/imaging"
	_ "golang.org/x/image/webp"
)

var valid = map[string]bool{
	".jpg":  true,
	".png":  true,
	".webp": true,
}

var imageCache = make(map[string][]byte)
var thumbnailCache = make(map[string][]byte)

func InitImageCache() {
	files, err1 := os.ReadDir(model.ImagePath)
	if err1 != nil {
		log.Println("目录读取失败")
		log.Fatal(err1)
		return
	}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if ext := strings.ToLower(filepath.Ext(file.Name())); !valid[ext] {
			continue
		}
		// 原图数据初始化
		path := filepath.Join(model.ImagePath, file.Name())
		data, err2 := os.ReadFile(path)
		if err2 != nil {
			log.Printf("路径为%s的文件读取失败\n", path)
			continue
		}
		imageCache[file.Name()] = data

		//缩略图数据初始化
		img, err3 := imaging.Decode(bytes.NewReader(data))
		if err3 != nil {
			log.Printf("图片%s解码失败: %v\n", file.Name(), err3)
			continue
		}
		thumb := imaging.Resize(img, 300, 0, imaging.Lanczos)
		var buff bytes.Buffer
		err4 := imaging.Encode(&buff, thumb, imaging.JPEG, imaging.JPEGQuality(80))
		if err4 != nil {
			log.Printf("缩略图%s编码失败: %v\n", file.Name(), err4)
			continue
		}
		thumbName := file.Name() + ".thumb.jpeg"
		thumbnailCache[thumbName] = buff.Bytes()
	}
	fmt.Println("图像数据初始化完成")
}

func GetImageData(name string) ([]byte, bool) {
	if data, ok := imageCache[name]; ok {
		return data, true
	}
	log.Println("图像数据获取失败")
	return nil, false
}

func GetThumbnailData(name string) ([]byte, bool) {
	if data, ok := thumbnailCache[name]; ok {
		return data, true
	}
	log.Println("缩略图数据获取失败")
	return nil, false
}

func GetImage() ([]model.ImageItem, error) {
	var imageNames []model.ImageItem

	for name := range imageCache {
		imageNames = append(imageNames, model.ImageItem{ImageName: name})
	}
	return imageNames, nil
}
