package main

import (
	"Goland/api"
	"Goland/dao"
)

func main() {
	dao.Pickdata()
	dao.LoadProfile()

	r := api.InitRouter()

	_ = r.Run("localhost:8080") // 启动服务器
}
