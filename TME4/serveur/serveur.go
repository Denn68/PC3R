package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"net"
	"os"
	"strconv"
	"strings"

	st "tme4/client/structures"
	tr "tme4/serveur/travaux"
)

var ADRESSE = "localhost"

var pers_vide = st.Personne{Nom: "", Prenom: "", Age: 0, Sexe: "M"}

// type d'un paquet de personne stocke sur le serveur, n'implemente pas forcement personne_int (qui n'existe pas ici)
type personne_serv struct {
	id int
	st.Personne
	aFaire []func(st.Personne) st.Personne
	statut string
}

type message_maint struct {
	valeur string
	retour chan string
}

// cree une nouvelle personne_serv, est appelé depuis le client, par le proxy, au moment ou un producteur distant
// produit une personne_dist
func creer(id int) *personne_serv {
	new_p := pers_vide
	new_tr := make([]func(st.Personne) st.Personne, 0)
	return &personne_serv{
		statut:   "V",
		id:       id,
		aFaire:   new_tr,
		Personne: new_p}
}

// Méthodes sur les personne_serv, on peut recopier des méthodes des personne_emp du client
// l'initialisation peut être fait de maniere plus simple que sur le client
// (par exemple en initialisant toujours à la meme personne plutôt qu'en lisant un fichier)
func (p *personne_serv) initialise() {
	p.Nom = "DEMBOUZ"
	p.Prenom = "Ous"
	p.Age = 26
	for i := 0; i < rand.Intn(6)+1; i++ {
		p.aFaire = append(p.aFaire, tr.UnTravail())
	}
	p.statut = "R"
}

func (p *personne_serv) travaille() {
	p.Personne = p.aFaire[0](p.Personne)
	p.aFaire = p.aFaire[1:]
	if len(p.aFaire) == 0 {
		p.statut = "C"
	}
}

func (p *personne_serv) vers_string() string {
	var add string
	if p.Sexe == "F" {
		add = "Madame "
	} else {
		add = "Monsieur "
	}
	return fmt.Sprint(add, p.Prenom, " ", p.Nom, " : ", p.Age, " ans.")
}

func (p *personne_serv) donne_statut() string {
	return p.statut
}

// Goroutine qui maintient une table d'association entre identifiant et personne_serv
// il est contacté par les goroutine de gestion avec un nom de methode et un identifiant
// et il appelle la méthode correspondante de la personne_serv correspondante
func mainteneur(maintenir chan message_maint) {
	table := make(map[int]*personne_serv)

	for {
		msg := <-maintenir
		//fmt.Println("Message:", msg)
		args := strings.Split(msg.valeur, " ")
		if len(args) < 2 {
			fmt.Println("Commande invalide :", msg.valeur)
			msg.retour <- "Erreu de commande"
			continue
		}
		id, err := strconv.Atoi(strings.TrimSpace(args[1]))
		if err != nil {
			fmt.Println("Erreur de conversion:", err)
		}
		switch args[0] {
		case "creer":
			table[id] = creer(id)
			fmt.Println("Creation de", id)
			msg.retour <- "OK"
		case "initialise":
			table[id].initialise()
			fmt.Println("Initialisation de", id)
			msg.retour <- "OK"
		case "travaille":
			table[id].travaille()
			fmt.Println("Travail de", id)
			msg.retour <- "OK"
		case "vers_string":
			fmt.Println("Vers string de", id)
			msg.retour <- table[id].vers_string()
		case "donne_statut":
			fmt.Println("Statut de", id)
			msg.retour <- table[id].donne_statut()
		default:
			fmt.Println("Erreur")
			msg.retour <- "OK"
		}
	}
}

// Goroutine de gestion des connections
// elle attend sur la socketi un message content un nom de methode et un identifiant et appelle le mainteneur avec ces arguments
// elle recupere le resultat du mainteneur et l'envoie sur la socket, puis ferme la socket
func gere_connection(conn net.Conn, maintenir chan message_maint) {
	defer conn.Close()
	rd, _ := bufio.NewReader(conn).ReadString('\n')
	//fmt.Println("Recu:", string(rd))
	ret := make(chan string)
	maintenir <- message_maint{valeur: string(rd), retour: ret}
	res := <-ret
	conn.Write([]byte(res + "\n"))
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Format: client <port>")
		return
	}
	maintenir := make(chan message_maint)
	port, _ := strconv.Atoi(os.Args[1]) // doit être le meme port que le client
	addr := ADRESSE + ":" + fmt.Sprint(port)
	// A FAIRE: creer les canaux necessaires, lancer un mainteneur
	go mainteneur(maintenir)
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		fmt.Println("Erreur lors de l'écoute :", err)
		return
	}
	fmt.Println("Ecoute sur", addr)
	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println("Erreur lors de l'acceptation de connexion :", err)
			continue
		}

		//fmt.Println("Accepte une connection.")
		go gere_connection(conn, maintenir) // passe la connection a une routine de gestion des connections
	}
}
