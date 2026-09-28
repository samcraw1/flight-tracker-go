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
	all := flag.Bool("all", false, "print every tracked aircraft")
	flag.Parse()

	if *all {
		allFlights, err := FetchAll()
		if err != nil {
			fmt.Println("error:", err)
			os.Exit(1)
		}
		for _, flight := range allFlights {
			PrintFlight(flight)
		}
		return
	}

	if *callsign == "" && flag.NArg() > 0 {
		*callsign = flag.Arg(0)
	}
	if *callsign == "" {
		fmt.Println("usage: flighttracker [--watch] [--all] <callsign>")
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
