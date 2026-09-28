package main

import (
	"flag"
	"fmt"
	"os"
	"time"
)

func main() {
	callsign := flag.String("callsign", "", "flight callsign e.g.AAL1008")
	watch := flag.Bool("watch", false, "keep refreshing every 10 seconds")
	flag.Parse()

	if *callsign == "" && flag.NArg() > 0 {
		*callsign = flag.Arg(0)
	}
	if *callsign == "" {
		fmt.Println("usage: flighttracker [--watch] <callsign>")
		os.Exit(1)
	}
	for {
		flight, err := FetchFlight(*callsign)
		if err != nil {
			fmt.Println("error:", err)
		} else {
			PrintFlight(flight)
		}
		if !*watch {
			break
		}
		time.Sleep(10 * time.Second)
	}
}
