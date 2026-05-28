package dao

import (
	"fmt"
	"os"
	"sync"

	"webproject/model"

	"github.com/goccy/go-json"
)

const messageDataPath = "./data/messages.json"

var messageData = []model.Message{}
var messageLock sync.RWMutex

// LoadMessages 加载留言数据
func LoadMessages() {
	data, err := os.ReadFile(messageDataPath)
	if err != nil {
		if os.IsNotExist(err) {
			messageData = []model.Message{}
			SaveMessages()
			return
		}
		fmt.Println(err.Error())
		return
	}

	messageLock.Lock()
	defer messageLock.Unlock()

	err = json.Unmarshal(data, &messageData)
	if err != nil {
		fmt.Println("留言数据加载失败:", err.Error())
		return
	}
	fmt.Println("留言数据加载成功")
}

// SaveMessages 保存留言数据到文件（自带读锁，可在锁外调用）
func SaveMessages() {
	// 序列化数据
	messageLock.RLock()
	jsonData, err := json.MarshalIndent(messageData, "", "  ")
	messageLock.RUnlock()
	if err != nil {
		fmt.Println("留言数据序列化失败:", err.Error())
		return
	}

	file, err := os.OpenFile(messageDataPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0666)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer file.Close()
	// 存储数据
	_, err2 := file.Write(jsonData)
	if err2 != nil {
		fmt.Println("留言数据保存失败", err2.Error())
		return
	}

}

// GetMessages 获取所有留言
func GetMessages() []model.Message {
	messageLock.RLock()
	defer messageLock.RUnlock()
	// 创建并返回副本
	result := make([]model.Message, len(messageData))
	copy(result, messageData)
	return result
}

// AddMessage 添加一条留言
func AddMessage(msg model.Message) {
	messageLock.Lock()
	messageData = append(messageData, msg)
	messageLock.Unlock()
	SaveMessages()
}

// DeleteMessage 按 ID 删除留言，返回是否成功
func DeleteMessage(id string) bool {
	messageLock.Lock()
	for i := range messageData { // 常规遍历
		if messageData[i].ID == id {
			messageData = append(messageData[:i], messageData[i+1:]...)
			SaveMessages()
			messageLock.Unlock()
			return true
		}
	}
	messageLock.Unlock()
	return false
}

// LikeMessage 点赞留言，返回更新后的留言
func LikeMessage(id string) (model.Message, bool) {
	messageLock.Lock()
	for i := range messageData {
		if messageData[i].ID == id {
			messageData[i].Likes++
			result := messageData[i]
			messageLock.Unlock()
			SaveMessages()
			return result, true
		}
	}
	messageLock.Unlock()
	return model.Message{}, false
}
