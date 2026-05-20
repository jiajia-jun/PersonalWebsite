package main

import (
	"Goland/api"
	"Goland/dao"
	"log"
	"os"
)

func main() {
	dao.Pickdata()
	dao.LoadProfile()
	dao.LoadMessages()

	r := api.InitRouter()

	// 证书路径
	crtPath := "ssl/server.crt"
	keyPath := "ssl/server.key"
	_, errC := os.Stat(crtPath)
	_, errK := os.Stat(keyPath)

	if errC != nil || errK != nil {
		log.Println("启用HTTP")
		err := r.Run(":8080") // http启动
		if err != nil {
			log.Fatal(err)
		}

	} else { // https启动
		log.Println("启用HTTPS")
		err := r.RunTLS("10.17.88.210:8443", "ssl/server.crt", "ssl/server.key")
		if err != nil {
			log.Fatal(err)
		}
	}

}
