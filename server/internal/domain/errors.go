package domain

import "errors"

var (
	// ErrNotFound is returned when a resource is not found
	ErrNotFound = errors.New("resource not found")

	// ErrInvalidInput is returned when input validation fails
	ErrInvalidInput = errors.New("invalid input")

	// ErrInternalServer is returned when an internal server error occurs
	ErrInternalServer = errors.New("internal server error")

	// ErrUnauthorized is returned when authentication fails
	ErrUnauthorized = errors.New("unauthorized")

	// ErrForbidden is returned when access is forbidden
	ErrForbidden = errors.New("forbidden")
)
