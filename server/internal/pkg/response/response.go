package response

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Success returns a successful response
func Success(c *echo.Context, statusCode int, message string, data interface{}) error {
	return (*c).JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error returns an error response
func Error(c *echo.Context, statusCode int, message string, err error) error {
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}

	return (*c).JSON(statusCode, Response{
		Success: false,
		Message: message,
		Error:   errMsg,
	})
}

// BadRequest returns a 400 error response
func BadRequest(c *echo.Context, message string, err error) error {
	return Error(c, http.StatusBadRequest, message, err)
}

// NotFound returns a 404 error response
func NotFound(c *echo.Context, message string) error {
	return Error(c, http.StatusNotFound, message, nil)
}

// InternalServerError returns a 500 error response
func InternalServerError(c *echo.Context, message string, err error) error {
	return Error(c, http.StatusInternalServerError, message, err)
}

// Unauthorized returns a 401 error response
func Unauthorized(c *echo.Context, message string) error {
	return Error(c, http.StatusUnauthorized, message, nil)
}

// Forbidden returns a 403 error response
func Forbidden(c *echo.Context, message string) error {
	return Error(c, http.StatusForbidden, message, nil)
}
