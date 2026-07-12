package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

const seerSessionCookieName = "seer_session"

func getSeerURL(c fiber.Ctx) (string, error) {
	serverKey, err := serverKeyFromRequest(c)
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(configFilePath(serverKey))
	if err != nil {
		return "", errors.New("failed to read config")
	}

	var cfg models.AppConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return "", errors.New("failed to parse config")
	}

	if cfg.SeerrURL == "" {
		return "", errors.New("seer URL not configured")
	}

	return strings.TrimRight(cfg.SeerrURL, "/"), nil
}

type seerLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func SeerLogin(c fiber.Ctx) error {
	var req seerLoginRequest
	if err := c.Bind().Body(&req); err != nil || req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Username and password are required"})
	}

	seerURL, err := getSeerURL(c)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Seer not configured"})
	}

	payload, err := json.Marshal(map[string]string{
		"username": req.Username,
		"password": req.Password,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Seer request"})
	}

	resp, err := http.Post(seerURL+"/api/v1/auth/jellyfin", "application/json", bytes.NewReader(payload))
	if err != nil {
		slog.Error("Seer login failed", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to reach Seer"})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to read Seer response"})
	}

	if resp.StatusCode != http.StatusOK {
		return c.Status(resp.StatusCode).Type("json").Send(body)
	}

	for _, cookie := range resp.Cookies() {
		if cookie.Name != "connect.sid" {
			continue
		}
		c.Cookie(&fiber.Cookie{
			Name:     seerSessionCookieName,
			Value:    cookie.Value,
			Path:     "/api/seerr",
			HTTPOnly: true,
			SameSite: "Lax",
			Expires:  cookie.Expires,
		})
		break
	}

	return c.Status(fiber.StatusOK).Type("json").Send(body)
}

func SeerLogout(c fiber.Ctx) error {
	session := c.Cookies(seerSessionCookieName)

	c.Cookie(&fiber.Cookie{
		Name:     seerSessionCookieName,
		Value:    "",
		Path:     "/api/seerr",
		HTTPOnly: true,
		SameSite: "Lax",
		Expires:  time.Unix(0, 0),
	})

	if session == "" {
		return c.SendStatus(fiber.StatusNoContent)
	}

	seerURL, err := getSeerURL(c)
	if err != nil {
		return c.SendStatus(fiber.StatusNoContent)
	}

	req, err := http.NewRequest(http.MethodPost, seerURL+"/api/v1/auth/logout", nil)
	if err != nil {
		slog.Error("Failed to build Seer logout request", "error", err)
		return c.SendStatus(fiber.StatusNoContent)
	}
	req.AddCookie(&http.Cookie{Name: "connect.sid", Value: session})

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		slog.Error("Seer logout failed", "error", err)
		return c.SendStatus(fiber.StatusNoContent)
	}
	defer resp.Body.Close()

	return c.SendStatus(fiber.StatusNoContent)
}

func proxySeerRequest(c fiber.Ctx, seerPath string) error {
	seerURL, err := getSeerURL(c)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Seer not configured"})
	}

	req, err := http.NewRequest(http.MethodGet, seerURL+seerPath, nil)
	if err != nil {
		slog.Error("Failed to build Seer request", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Seer request"})
	}

	if session := c.Cookies(seerSessionCookieName); session != "" {
		req.AddCookie(&http.Cookie{Name: "connect.sid", Value: session})
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		slog.Error("Seer request failed", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to reach Seer"})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error("Failed to read Seer response", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to read Seer response"})
	}

	return c.Status(resp.StatusCode).Type("json").Send(body)
}

func GetSeerMovieRecommendations(c fiber.Ctx) error {
	tmdbId := c.Params("tmdbId")
	return proxySeerRequest(c, "/api/v1/movie/"+tmdbId+"/recommendations")
}
