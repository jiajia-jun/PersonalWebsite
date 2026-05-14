package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// 定义一个密钥
var jwtSecret = []byte("MyFirstJWTSecret123")

// CustomClaims  “令牌内容”结构体（存用户名、过期时间等）
type CustomClaims struct {
	Username string `json:"username"` // 存用户名
	jwt.RegisteredClaims
}

// GenerateToken 生成令牌的函数
// 参数：用户名
// 返回值：字符串/错误信息
func GenerateToken(username string) (string, error) {
	// 登录后2小时失效
	expireTime := time.Now().Add(2 * time.Hour)

	// 内容
	claims := CustomClaims{
		Username: username, // 把用户名存进去
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()), // 签发时间（现在）
			ExpiresAt: jwt.NewNumericDate(expireTime), // 过期时间
			Issuer:    "SheckHall",                    // 签发者（随便写，标识你的项目）
		},
	}

	// “HS256算法 + 密钥”
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 转字符串
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err // 生成失败返回错误
	}
	return tokenString, nil // 生成成功返回令牌
}

// ParseToken 验证令牌的函数（改密码时调用）
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

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {

		return claims.Username, nil
	}

	return "", errors.New("令牌无效或已过期")
}
