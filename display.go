package main

import "fmt"

func PrintFlight(s []any) {
	lon, _ := s[5].(float64)
	lat, _ := s[6].(float64)
	alt, _ := s[7].(float64)
	fmt.Printf("%v  lat=%.3f lon=%.3f alt=%.0fm\n", s[1], lat, lon, alt)
}
