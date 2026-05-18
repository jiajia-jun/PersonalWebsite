package main

import (
	"Goland/api"
	"Goland/dao"
)

func main() {
	dao.Pickdata()
	dao.LoadProfile()
	dao.LoadMessages()

	r := api.InitRouter()

	_ = r.Run("localhost:8080") // 启动服务器

	r.Static("/static", "./static") // 静态资源配置

}
