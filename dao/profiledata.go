package dao

import (
	"fmt"
	"os"
	"sync"

	"Goland/model"

	"github.com/goccy/go-json"
)

const profileDataPath = "./data/profile.json"

var profileData = model.Profile{}
var profileLock sync.RWMutex

// LoadProfile 加载个人信息文件
func LoadProfile() {
	data, err := os.ReadFile(profileDataPath)
	if err != nil {
		if os.IsNotExist(err) {
			profileData = model.Profile{
				Name:     "你的姓名",
				Title:    "你的职位/头衔",
				Bio:      "在这里写一段个人简介，介绍你的背景、兴趣和专长。",
				Greeting: "你好，我是",
				Tagline:  "欢迎来到我的个人主页",
			}
			SaveProfile()
			return
		}
		fmt.Println(err.Error())
		return
	}

	profileLock.Lock()
	defer profileLock.Unlock()

	err = json.Unmarshal(data, &profileData)
	if err != nil {
		fmt.Println("个人数据加载失败，错误原因为：", err.Error())
		return
	}
	fmt.Println("个人数据加载成功")
}

// SaveProfile 保存个人信息到文件
func SaveProfile() {
	os.MkdirAll("./data", 0755)

	jsonData, err := json.MarshalIndent(profileData, "", "  ")
	if err != nil {
		fmt.Println("错误：转换个人数据为 JSON 格式失败，原因：", err.Error())
		return
	}

	err = os.WriteFile(profileDataPath, jsonData, 0644)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("个人数据保存成功")
}

// GetProfile 获取个人信息（返回副本）
func GetProfile() model.Profile {
	profileLock.RLock()
	defer profileLock.RUnlock()
	return profileData
}

// UpdateProfile 更新个人信息
func UpdateProfile(p model.Profile) {
	profileLock.Lock()
	defer profileLock.Unlock()
	profileData = p
	SaveProfile()
}
