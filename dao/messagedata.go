package dao

import (
	"fmt"
	"os"
	"sync"

	"Goland/model"

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
	messageLock.RLock()
	jsonData, err := json.Marshal(messageData)
	messageLock.RUnlock()
	if err != nil {
		fmt.Println("留言数据序列化失败:", err.Error())
		return
	}

	os.MkdirAll("./data", 0755)
	err = os.WriteFile(messageDataPath, jsonData, 0644)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
}

// GetMessages 获取所有留言（返回副本）
func GetMessages() []model.Message {
	messageLock.RLock()
	defer messageLock.RUnlock()
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
	for i := range messageData {
		if messageData[i].ID == id {
			messageData = append(messageData[:i], messageData[i+1:]...)
			messageLock.Unlock()
			SaveMessages()
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
