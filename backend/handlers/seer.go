package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

func getSeerURL() (string, error) {
	path := configPath()
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read config: %w", err)
	}

	var cfg models.AppConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return "", fmt.Errorf("failed to parse config: %w", err)
	}

	if cfg.SeerURL == "" {
		return "", fmt.Errorf("seer URL not configured")
	}

	return strings.TrimRight(cfg.SeerURL, "/"), nil
}

func proxySeerRequest(c fiber.Ctx, seerPath string) error {
	seerURL, err := getSeerURL()
	if err != nil {
		log.Println("Seer proxy error:", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Seer not configured"})
	}

	resp, err := http.Get(seerURL + seerPath)
	if err != nil {
		log.Println("Seer request failed:", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to reach Seer"})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading Seer response:", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to read Seer response"})
	}

	return c.Status(resp.StatusCode).Type("json").Send(body)
}

func GetSeerMovie(c fiber.Ctx) error {
	tmdbId := c.Params("tmdbId")
	return proxySeerRequest(c, "/api/v1/movie/"+tmdbId)
}

func GetSeerMovieRecommendations(c fiber.Ctx) error {
	tmdbId := c.Params("tmdbId")
	return proxySeerRequest(c, "/api/v1/movie/"+tmdbId+"/recommendations")
}
