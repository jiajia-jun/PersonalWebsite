package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// 1. 定义一个密钥（相当于“加密钥匙”，别人没有这个钥匙就解不开令牌）
// 新手先随便写一串字符，比如下面这个，生产环境要保密
var jwtSecret = []byte("MyFirstJWTSecret123")

// CustomClaims 2. “令牌内容”结构体（存用户名、过期时间等）
type CustomClaims struct {
	Username string `json:"username"` // 存用户名（关键！用来识别是谁）
	// 下面这行是JWT库自带的，包含过期时间、签发时间等基础信息
	jwt.RegisteredClaims
}

// GenerateToken 3. 生成令牌的函数（登录成功后调用）
// 参数：用户名
// 返回：生成的令牌字符串 / 错误信息
func GenerateToken(username string) (string, error) {
	// 设置令牌过期时间：登录后2小时失效
	expireTime := time.Now().Add(2 * time.Hour)

	// 组装令牌的“内容”
	claims := CustomClaims{
		Username: username, // 把用户名存进去
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()), // 签发时间（现在）
			ExpiresAt: jwt.NewNumericDate(expireTime), // 过期时间
			Issuer:    "SheckHall",                    // 签发者（随便写，标识你的项目）
		},
	}

	// 用“HS256算法 + 密钥”生成令牌
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 把令牌转成字符串
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err // 生成失败返回错误
	}
	return tokenString, nil // 生成成功返回令牌
}

// ParseToken 4. 验证令牌的函数（改密码时调用）
// 参数：客户端传过来的令牌字符串
// 返回：解析出的用户名 / 错误信息
func ParseToken(tokenString string) (string, error) {
	// 解析令牌
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证加密算法是否正确（防止别人伪造）
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return "", errors.New("令牌算法不对，可能是伪造的")
		}
		// 返回密钥，用来验证签名
		return jwtSecret, nil
	})

	// 如果解析出错（比如令牌格式错、过期）
	if err != nil {
		return "", err
	}

	// 解析成功，取出里面的用户名
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {

		return claims.Username, nil
	}

	// 令牌无效（比如被篡改了）
	return "", errors.New("令牌无效或已过期")
}
