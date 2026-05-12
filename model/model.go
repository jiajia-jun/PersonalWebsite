package model

type User struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

// Profile 个人展示信息
type Profile struct {
	Name     string `json:"name"`
	Title    string `json:"title"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	GitHub   string `json:"github"`
	LinkedIn string `json:"linkedin"`
	Website  string `json:"website"`
	Location string `json:"location"`
	Greeting string `json:"greeting"`
	Tagline  string `json:"tagline"`
}
