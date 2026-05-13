package model

type User struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

// Skill 技能项
type Skill struct {
	Name  string `json:"name"`
	Level int    `json:"level"`
}

// TimelineItem 时间线条目
type TimelineItem struct {
	Period      string `json:"period"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Stat 统计数据
type Stat struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// Profile 个人展示信息
type Profile struct {
	Name     string         `json:"name"`
	Title    string         `json:"title"`
	Bio      string         `json:"bio"`
	Avatar   string         `json:"avatar"`
	Email    string         `json:"email"`
	Phone    string         `json:"phone"`
	GitHub   string         `json:"github"`
	LinkedIn string         `json:"linkedin"`
	Website  string         `json:"website"`
	Location string         `json:"location"`
	Greeting string         `json:"greeting"`
	Tagline  string         `json:"tagline"`
	Skills   []Skill        `json:"skills"`
	Timeline []TimelineItem `json:"timeline"`
	Interests []string      `json:"interests"`
	Stats    []Stat         `json:"stats"`
}
