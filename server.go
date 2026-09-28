package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"sync"
	"time"
)

const cacheTTL = 10 * time.Second

// Flight is the typed shape sent to the frontend.
type Flight struct {
	ICAO24       string  `json:"icao24"`
	Callsign     string  `json:"callsign"`
	Country      string  `json:"country"`
	Lat          float64 `json:"lat"`
	Lon          float64 `json:"lon"`
	Alt          float64 `json:"alt"`          // metres, barometric
	Velocity     float64 `json:"velocity"`     // m/s
	Heading      float64 `json:"heading"`      // degrees clockwise from north
	VerticalRate float64 `json:"verticalRate"` // m/s
	OnGround     bool    `json:"onGround"`
}

type cacheEntry struct {
	flights []Flight
	fetched time.Time
}

var (
	cacheMu sync.Mutex
	cache   = map[string]cacheEntry{}
)

func str(v any) string  { s, _ := v.(string); return s }
func num(v any) float64 { f, _ := v.(float64); return f }

// toFlights converts OpenSky state vectors, dropping ones with no position.
func toFlights(states [][]any) []Flight {
	out := make([]Flight, 0, len(states))
	for _, s := range states {
		if len(s) < 12 || s[5] == nil || s[6] == nil {
			continue
		}
		onGround, _ := s[8].(bool)
		out = append(out, Flight{
			ICAO24:       str(s[0]),
			Callsign:     trim(str(s[1])),
			Country:      str(s[2]),
			Lon:          num(s[5]),
			Lat:          num(s[6]),
			Alt:          num(s[7]),
			OnGround:     onGround,
			Velocity:     num(s[9]),
			Heading:      num(s[10]),
			VerticalRate: num(s[11]),
		})
	}
	return out
}

func trim(s string) string {
	for len(s) > 0 && s[len(s)-1] == ' ' {
		s = s[:len(s)-1]
	}
	return s
}

// cachedFlights returns fresh data when the cache is older than cacheTTL,
// and falls back to stale data if OpenSky errors (e.g. 429).
func cachedFlights(query string) ([]Flight, error) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	entry, ok := cache[query]
	if ok && time.Since(entry.fetched) < cacheTTL {
		return entry.flights, nil
	}

	states, err := FetchAll(query)
	if err != nil {
		if ok {
			log.Println("upstream error, serving stale data:", err)
			return entry.flights, nil
		}
		return nil, err
	}
	flights := toFlights(states)
	cache[query] = cacheEntry{flights: flights, fetched: time.Now()}
	return flights, nil
}

func Serve(addr string) error {
	http.HandleFunc("/api/flights", func(w http.ResponseWriter, r *http.Request) {
		// pass through only the bounding-box params
		q := url.Values{}
		for _, k := range []string{"lamin", "lomin", "lamax", "lomax"} {
			if v := r.URL.Query().Get(k); v != "" {
				q.Set(k, v)
			}
		}

		flights, err := cachedFlights(q.Encode())
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(flights)
	})

	log.Println("listening on", addr)
	return http.ListenAndServe(addr, nil)
}
