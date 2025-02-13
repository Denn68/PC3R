package main

import (
	"fmt"
	"os"
	"bufio"
	"time"
	"strings"
)

type Paquet struct{
	Arrivee string
	Depart string
	Arret int
}

type PaquetPrive struct{
	P Paquet
	C chan Paquet
}

func lecteur(c1 chan string, filePath string){
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier :", err)
		return
	}
	defer file.Close() 

	scanner := bufio.NewScanner(file)

	for {
		res := scanner.Scan()
		if res {
			c1 <- scanner.Text()
		} else {
			fmt.Println("Erreur lors de la lecture du fichier :", err)
			break
		}
	}
	fmt.Println("J'ai fini")
	/*
	for scanner.Scan() {
		c1 <- scanner.Text()
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Erreur lors de la lecture du fichier :", err)
	}*/

}

func travailleurs(c1 chan string, id int, c2 chan PaquetPrive, c3 chan Paquet){
	for {
		line := <- c1

		splittedLine := strings.Split(line, ",")
		pck := Paquet{
			Arrivee: splittedLine[1],
			Depart: splittedLine[2],
			Arret: 0,
		}
		c := make(chan Paquet, 0)
		pckPrivate := PaquetPrive{
			P: pck,
			C: c,
		}
		c2 <- pckPrivate
		newPck := <- c
		fmt.Println("Travailleur", id, "recoit ensuite:", newPck.Arrivee, newPck.Depart)
		c3 <- newPck
	}
}

func serveurCalcul(c2 chan PaquetPrive) {
	for {
		paquetPrive := <- c2
		go func(paquetPrive PaquetPrive){ 
			//paquet := <- paquetPrive.C
			// Parser les arrivees et departs
			t1, err := time.Parse("15:04:05", paquetPrive.P.Depart)
			if err != nil {
				fmt.Println("Erreur de parsing pour l'heure 1:", err)
				return
			}

			t2, err := time.Parse("15:04:05", paquetPrive.P.Arrivee)
			if err != nil {
				fmt.Println("Erreur de parsing pour l'heure 2:", err)
				return
			}

			newPaquet := Paquet{
				Depart: paquetPrive.P.Depart,
				Arrivee: paquetPrive.P.Arrivee,
				Arret: t2.Hour() - t1.Hour(),
			}
			paquetPrive.C <- newPaquet
		}(paquetPrive)
	}
}

func reducteur(c3 chan Paquet, c4 chan int, c5 chan float64) {
	compteur := 0
	temps := 0
	var moyenne float64
	moyenne = 0
	for {
		select {
		case paquet := <- c3:
			compteur++
			temps = temps + paquet.Arret
		case <- c4:
			break
		}
	}
	if (compteur > 0){
		moyenne = float64(temps) / float64(compteur)
		fmt.Println("Réducteur à renvoyer la différence de durée :" , moyenne)
	}
	c5 <- moyenne

}

func main(){
	nbRequetes := 10
	nbTravailleurs := 10
	lines := make(chan string, 0)
	paquetsServeur := make(chan PaquetPrive, nbRequetes)
	paquetsReducteur := make(chan Paquet)
	fin := make(chan int, 0)
	moyenne := make(chan float64, 0)

	go func() {lecteur(lines, "stop_times.txt")}()
	for i:=0; i<nbTravailleurs; i++ {
		go func() {travailleurs(lines, i, paquetsServeur, paquetsReducteur)}()
	}
	go func() {serveurCalcul(paquetsServeur)}()
	go func() {reducteur(paquetsReducteur, fin, moyenne)}()

	time.Sleep(10 * time.Second)
	fin <- 0
	result := <- moyenne
	fmt.Println(result)
}