package handlers

import (
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

func configFilePath(serverKey string) string {
	return filepath.Join(serverDataDir(serverKey), "config.json")
}

func GetConfig(c fiber.Ctx) error {
	var cfg models.AppConfig

	if serverKey, err := serverKeyFromRequest(c); err == nil {
		data, err := os.ReadFile(configFilePath(serverKey))
		if err != nil {
			if !os.IsNotExist(err) {
				slog.Error("Failed to read config file", "error", err)
				return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read config file"})
			}
		} else if err := json.Unmarshal(data, &cfg); err != nil {
			slog.Error("Failed to parse config file", "error", err)
			return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to parse config file"})
		}
	}

	cfg.ServerAddress = os.Getenv("SERVER_ADDRESS")

	out, err := json.MarshalIndent(cfg, "", "    ")
	if err != nil {
		slog.Error("Failed to encode config", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to encode config"})
	}

	return c.Status(fiber.StatusOK).
		Type("json").
		Send(out)
}

func UpdateConfig(c fiber.Ctx) error {
	serverKey, err := serverKeyFromRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	var cfg models.AppConfig

	if err := c.Bind().Body(&cfg); err != nil {
		slog.Error("Failed to decode config", "error", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid config"})
	}

	if cfg.ItemPage != nil {
		if cfg.ItemPage.FavoriteButton == nil {
			cfg.ItemPage.FavoriteButton = []models.BaseItemKind{}
		}
		if cfg.ItemPage.DeleteButton == nil {
			cfg.ItemPage.DeleteButton = []models.BaseItemKind{}
		}
		if cfg.ItemPage.DetailBadges == nil {
			cfg.ItemPage.DetailBadges = []models.DetailBadge{}
		}
	}

	// ServerAddress is controlled exclusively via the SERVER_ADDRESS env var, never persisted.
	cfg.ServerAddress = ""

	data, err := json.MarshalIndent(cfg, "", "    ")
	if err != nil {
		slog.Error("Failed to encode config", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to encode config"})
	}

	path := configFilePath(serverKey)
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		slog.Error("Failed to create config directory", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to create config directory"})
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		slog.Error("Failed to write config file", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save config"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
