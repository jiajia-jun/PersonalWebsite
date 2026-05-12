package dao

import (
	"fmt"
	"os"
	"sync"

	"github.com/goccy/go-json"
)

const datapath = "E:\\test\\userdata.json"

var database = map[string]string{}
var lock sync.RWMutex

// Pickdata 抽取数据
func Pickdata() {
	data, err := os.ReadFile(datapath) // 读取用户数据文件
	if err != nil {
		if os.IsNotExist(err) { // 初次打开会出现文件为空，正常
			database = map[string]string{}
			return
		}
		fmt.Println(err.Error())
		return
	}

	lock.Lock()
	defer lock.Unlock()

	err = json.Unmarshal(data, &database)
	if err != nil {
		fmt.Println("data加载失败,错误原因为：", err.Error())
		return
	}
	fmt.Println("用户数据提取成功")
}

// Storedata 存储数据
func Storedata() {
	//lock.Lock()
	//defer lock.Unlock()
	//上面是错误代码

	//用 json.MarshalIndent() 完成“Go map → JSON 字节”的转换（序列化）
	// 参数1：要转换的内存数据（userDB，map 类型）
	// 参数2：JSON 前缀（空字符串，无前缀）
	// 参数3：JSON 缩进（"  "，两个空格，让生成的 JSON 文件格式工整，方便手动查看）
	jsonData, err := json.MarshalIndent(database, "", "  ")
	if err != nil {
		fmt.Println("错误：转换用户数据为 JSON 格式失败，原因：", err.Error())
		return
	}

	err = os.WriteFile(datapath, jsonData, 0644)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("录入用户数据")
}

// AddUser 添加用户
func AddUser(username string, password string) {
	lock.Lock()
	defer lock.Unlock()
	database[username] = password
	Storedata()
}

// FindUser 验证用户
func FindUser(username string, password string) bool {
	lock.Lock()
	defer lock.Unlock()
	if pwd, ok := database[username]; ok { // 先判断是否存在用户（Go 里查 map 时，返回 值 和 是否存在 两个）
		if pwd == password {
			return true
		}
	}
	return false
}

// IsUserExist 查找用户
func IsUserExist(username string) bool {
	lock.Lock()
	defer lock.Unlock()
	if _, ok := database[username]; ok {
		return true
	}
	return false
}

// UpdatePassword 更新密码
func UpdatePassword(username string, newpsd string) {
	lock.Lock()
	defer lock.Unlock()
	database[username] = newpsd
	Storedata()
}
