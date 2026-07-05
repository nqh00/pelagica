package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

const maxBrandingLogoSizeBytes int64 = 10 * 1024 * 1024

func resolveBrandingLogoMode(mode string) (string, error) {
	switch mode {
	case "light", "dark":
		return mode, nil
	default:
		return "", errors.New("mode must be either light or dark")
	}
}

func brandingLogoPath(serverKey, mode string) string {
	return filepath.Join(serverDataDir(serverKey), "branding", "logo-"+mode)
}

func brandingLogoURL(jellyfinURL, mode string) string {
	return "/api/branding/logo/" + mode + "?jellyfin_url=" + url.QueryEscape(jellyfinURL)
}

func loadAppConfig(serverKey string) (models.AppConfig, error) {
	var cfg models.AppConfig
	data, err := os.ReadFile(configFilePath(serverKey))
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return cfg, err
	}

	if len(data) == 0 {
		return cfg, nil
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, err
	}

	return cfg, nil
}

func saveAppConfig(serverKey string, cfg models.AppConfig) error {
	path := configFilePath(serverKey)
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func GetBrandingLogo(c fiber.Ctx) error {
	mode, err := resolveBrandingLogoMode(c.Params("mode"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	serverKey, err := serverKeyFromRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	logoData, err := os.ReadFile(brandingLogoPath(serverKey, mode))
	if err != nil {
		if os.IsNotExist(err) {
			return c.Status(fiber.StatusNotFound).JSON(models.APIError{Error: "Logo not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to load logo"})
	}

	c.Set("Content-Type", http.DetectContentType(logoData))
	return c.Send(logoData)
}

func UploadBrandingLogo(c fiber.Ctx) error {
	mode, err := resolveBrandingLogoMode(c.Params("mode"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	jellyfinURL := c.Query("jellyfin_url")
	serverKey, err := serverKeyFromURL(jellyfinURL)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	fileHeader, err := c.FormFile("logo")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Missing logo file"})
	}

	if fileHeader.Size > maxBrandingLogoSizeBytes {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Logo file is too large (max 10MB)"})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Failed to read uploaded file"})
	}
	defer file.Close()

	logoData, err := io.ReadAll(file)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Failed to read uploaded file"})
	}

	if !strings.HasPrefix(http.DetectContentType(logoData), "image/") {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Uploaded file must be an image"})
	}

	logoPath := brandingLogoPath(serverKey, mode)
	if err := os.MkdirAll(filepath.Dir(logoPath), 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to create branding directory"})
	}

	if err := os.WriteFile(logoPath, logoData, 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save logo"})
	}

	cfg, err := loadAppConfig(serverKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read config"})
	}

	logoURL := brandingLogoURL(jellyfinURL, mode)
	if mode == "light" {
		cfg.LogoLightURL = logoURL
	} else {
		cfg.LogoDarkURL = logoURL
	}

	if err := saveAppConfig(serverKey, cfg); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to update config"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"url": logoURL})
}

func ResetBrandingLogo(c fiber.Ctx) error {
	mode, err := resolveBrandingLogoMode(c.Params("mode"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	serverKey, err := serverKeyFromRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: err.Error()})
	}

	logoPath := brandingLogoPath(serverKey, mode)
	err = os.Remove(logoPath)
	if err != nil && !os.IsNotExist(err) {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to remove logo"})
	}

	cfg, err := loadAppConfig(serverKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read config"})
	}

	if mode == "light" {
		cfg.LogoLightURL = ""
	} else {
		cfg.LogoDarkURL = ""
	}

	if err := saveAppConfig(serverKey, cfg); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to update config"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
