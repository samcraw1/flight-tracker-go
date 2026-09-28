package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("Enter flight callsign (e.g. UAL123):")
	scanner.Scan()
	callsign := strings.TrimSpace(scanner.Text())

	flight, err := FetchFlight(callsign)
	if err != nil {
		fmt.Println("Error fetching flight:", err)
		return
	}
	PrintFlight(flight)
}
