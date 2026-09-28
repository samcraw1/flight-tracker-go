package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Response struct {
	Time   int64   `json:"time"`
	States [][]any `json:"states"`
}

var client = &http.Client{Timeout: 10 * time.Second}

func FetchFlight(callsign string) ([]any, error) {
	url := "https://opensky-network.org/api/states/all"

	res, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", res.Status)
	}

	var data Response
	if err := json.NewDecoder(res.Body).Decode(&data); err != nil {
		return nil, err
	}

	for _, s := range data.States {
		cs, _ := s[1].(string)
		if strings.EqualFold(strings.TrimSpace(cs), callsign) {
			return s, nil
		}
	}
	return nil, fmt.Errorf("flight %q not found", callsign)
}

// FetchAll returns every tracked aircraft. query is an optional raw query
// string (e.g. a bounding box) passed through to OpenSky.
func FetchAll(query string) ([][]any, error) {
	url := "https://opensky-network.org/api/states/all"
	if query != "" {
		url += "?" + query
	}
	res, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", res.Status)
	}

	var data Response
	if err := json.NewDecoder(res.Body).Decode(&data); err != nil {
		return nil, err
	}
	return data.States, nil
}
