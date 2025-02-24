package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"net"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	st "tme4/client/structures" // contient la structure Personne
	tr "tme4/client/travaux"    // contient les fonctions de travail sur les Personnes
)

var ADRESSE string = "localhost"
var PORT int                                                              // adresse de base pour la Partie 2
var FICHIER_SOURCE string = "./client/elus-conseillers-municipaux-cm.csv" // fichier dans lequel piocher des personnes
var TAILLE_SOURCE int = 450000                                            // inferieure au nombre de lignes du fichier, pour prendre une ligne au hasard
var TAILLE_G int = 5                                                      // taille du tampon des gestionnaires
var NB_G int = 2                                                          // nombre de gestionnaires
var NB_P int = 2                                                          // nombre de producteurs
var NB_O int = 4                                                          // nombre d'ouvriers
var NB_PD int = 2                                                         // nombre de producteurs distants pour la Partie 2

var pers_vide = st.Personne{Nom: "", Prenom: "", Age: 0, Sexe: "M"} // une personne vide

var initializeChan = make(chan int)
var travailleChan = make(chan int)
var versStringChan = make(chan int)
var donneStatutChan = make(chan int)

var versStringAnswerChan = make(chan string)
var donneStatutAnswerChan = make(chan string)

type message_lec struct {
	ligne  int
	retour chan string
}

// paquet de personne, sur lequel on peut travailler, implemente l'interface personne_int
type personne_emp struct {
	personne st.Personne
	ligne    int
	aFaire   []func(st.Personne) st.Personne
	lecteur  chan message_lec
	statut   string
}

// paquet de personne distante, pour la Partie 2, implemente l'interface personne_int
type personne_dist struct {
	id int
}

// interface des personnes manipulees par les ouvriers, les
type personne_int interface {
	initialise()          // appelle sur une personne vide de statut V, remplit les champs de la personne et passe son statut à R
	travaille()           // appelle sur une personne de statut R, travaille une fois sur la personne et passe son statut à C s'il n'y a plus de travail a faire
	vers_string() string  // convertit la personne en string
	donne_statut() string // renvoie V, R ou C
}

// fabrique une personne à partir d'une ligne du fichier des conseillers municipaux
// à changer si un autre fichier est utilisé
func personne_de_ligne(l string) st.Personne {
	separateur := regexp.MustCompile(";") // oui, les donnees sont separees par des tabulations ... merci la Republique Francaise
	separation := separateur.Split(l, -1)
	//fmt.Println(separation)
	naiss, _ := time.Parse("2/1/2006", separation[9])
	a1, _, _ := time.Now().Date()
	a2, _, _ := naiss.Date()
	agec := a1 - a2
	return st.Personne{Nom: separation[6], Prenom: separation[7], Sexe: separation[8], Age: agec}
}

// *** METHODES DE L'INTERFACE personne_int POUR LES PAQUETS DE PERSONNES ***

func (p *personne_emp) initialise() {
	chanLigne := make(chan string)
	msg := message_lec{ligne: p.ligne, retour: chanLigne}
	p.lecteur <- msg
	ligne := <-chanLigne
	p.personne = personne_de_ligne(ligne)
	nbTravaux := rand.Intn(5) + 1
	for i := 0; i < nbTravaux; i++ {
		p.aFaire = append(p.aFaire, tr.UnTravail())
	}
	p.statut = "R"
	//fmt.Println("######## Personne initialisee:", p.personne)
}

func (p *personne_emp) travaille() {
	if len(p.aFaire) > 0 {
		p.personne = p.aFaire[0](p.personne)
		p.aFaire = p.aFaire[1:]
	}
	if len(p.aFaire) == 0 {
		p.statut = "C"
	}
}

func (p *personne_emp) vers_string() string {
	return fmt.Sprintf("%s %s, %d ans, %s", p.personne.Prenom, p.personne.Nom, p.personne.Age, p.personne.Sexe)
}

func (p *personne_emp) donne_statut() string {
	return p.statut
}

// *** METHODES DE L'INTERFACE personne_int POUR LES PAQUETS DE PERSONNES DISTANTES (PARTIE 2) ***
// ces méthodes doivent appeler le proxy (aucun calcul direct)

func (p personne_dist) initialise() {
	initializeChan <- p.id
}

func (p personne_dist) travaille() {
	travailleChan <- p.id
}

func (p personne_dist) vers_string() string {
	versStringChan <- p.id
	return <-versStringAnswerChan
}

func (p personne_dist) donne_statut() string {
	donneStatutChan <- p.id
	return <-donneStatutAnswerChan
}

// *** CODE DES GOROUTINES DU SYSTEME ***

// Partie 2: contacté par les méthodes de personne_dist, le proxy appelle la méthode à travers le réseau et récupère le résultat
// il doit utiliser une connection TCP sur le port donné en ligne de commande
func proxy(port string) {

	for {
		/* msg := <-proxer
		valeur := msg.valeur */
		conn, err := net.Dial("tcp", ADRESSE+":"+port)
		if err != nil {
			fmt.Println("Erreur du lancement du proxy:", err)
			return
		} else {
			select {
			case id := <-initializeChan:
				_, err = conn.Write([]byte("initialise " + strconv.Itoa(id) + "\n"))
				if err != nil {
					fmt.Println("Erreur d'envoi de la requête:", err)
					return
				}
				reponse, err := bufio.NewReader(conn).ReadString('\n')
				if err != nil {
					fmt.Println("Erreur de lecture de la réponse:", err)
					return
				}
				if strings.TrimSpace(reponse) != "OK" {
					fmt.Println("Erreur lors de l'initialisation:", reponse)
					return
				}
			case id := <-travailleChan:
				_, err = conn.Write([]byte("travaille " + strconv.Itoa(id) + "\n"))
				if err != nil {
					fmt.Println("Erreur d'envoi de la requête:", err)
					return
				}
				reponse, err := bufio.NewReader(conn).ReadString('\n')
				if err != nil {
					fmt.Println("Erreur de lecture de la réponse:", err)
					return
				}
				if strings.TrimSpace(reponse) != "OK" {
					fmt.Println("Erreur lors du travail:", reponse)
					return
				}
			case id := <-versStringChan:
				_, err = conn.Write([]byte("vers_string " + strconv.Itoa(id) + "\n"))
				if err != nil {
					fmt.Println("Erreur d'envoi de la requête:", err)
					return
				}
				reponse, err := bufio.NewReader(conn).ReadString('\n')
				if err != nil {
					fmt.Println("Erreur de lecture de la réponse:", err)
					return
				}
				if strings.TrimSpace(reponse) == "" {
					fmt.Println("Erreur lors de vers_string")
					return
				}
				versStringAnswerChan <- strings.TrimSpace(reponse)
			case id := <-donneStatutChan:
				_, err = conn.Write([]byte("donne_statut " + strconv.Itoa(id) + "\n"))
				if err != nil {
					fmt.Println("Erreur d'envoi de la requête:", err)
					return
				}
				reponse, err := bufio.NewReader(conn).ReadString('\n')
				if err != nil {
					fmt.Println("Erreur de lecture de la réponse:", err)
					return
				}
				// Si la réponse est vide, c'est qu'il y a eu une erreur
				if strings.TrimSpace(reponse) == "" {
					fmt.Println("Erreur lors de donne_statut")
					return
				}
				donneStatutAnswerChan <- strings.TrimSpace(reponse)
			default:
				fmt.Println("Rien ne se passe")
				time.Sleep(1 * time.Second)
			}
		}

	}
}

// Partie 1 : contacté par la méthode initialise() de personne_emp, récupère une ligne donnée dans le fichier source
func lecteur(lec chan message_lec) {
	for {
		lec_message := <-lec
		nbLigne := lec_message.ligne
		file, err := os.Open(FICHIER_SOURCE)
		if err != nil {
			fmt.Println("Erreur d'ouverture du fichier", err)
			return
		}
		scanner := bufio.NewScanner(file)
		for i := 0; i < nbLigne; i++ {
			scanner.Scan()
		}
		lec_message.retour <- scanner.Text()

		file.Close()
	}
}

// Partie 1: récupèrent des personne_int depuis les gestionnaires, font une opération dépendant de donne_statut()
// Si le statut est V, ils initialise le paquet de personne puis le repasse aux gestionnaires
// Si le statut est R, ils travaille une fois sur le paquet puis le repasse aux gestionnaires
// Si le statut est C, ils passent le paquet au collecteur
func ouvrier(traiter chan personne_int, gestionnaires chan personne_int, collecteurs chan personne_int) {
	for {
		p := <-traiter
		switch p.donne_statut() {
		case "V":
			p.initialise()
			gestionnaires <- p
		case "R":
			p.travaille()
			gestionnaires <- p
		case "C":
			collecteurs <- p
		}
	}
}

// Partie 1: les producteurs cree des personne_int implementees par des personne_emp initialement vides,
// de statut V mais contenant un numéro de ligne (pour etre initialisee depuis le fichier texte)
// la personne est passée aux gestionnaires
func producteur(enfiler chan personne_int, lecteurs chan message_lec) {
	for {
		rand.Seed(time.Now().UnixNano())
		p := &personne_emp{
			personne: pers_vide,
			ligne:    rand.Intn(TAILLE_SOURCE),
			aFaire:   make([]func(st.Personne) st.Personne, 0),
			lecteur:  lecteurs,
			statut:   "V"}
		enfiler <- p // Envoie le paquet aux gestionnaires
	}
}

// Partie 2: les producteurs distants cree des personne_int implementees par des personne_dist qui contiennent un identifiant unique
// utilisé pour retrouver l'object sur le serveur
// la creation sur le client d'une personne_dist doit declencher la creation sur le serveur d'une "vraie" personne, initialement vide, de statut V
func producteur_distant(gestionnaires chan personne_int) {
	for {
		p := &personne_dist{id: rand.Intn(1000000)}
		// Informer le serveur de la création d'une nouvelle personne
		conn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", ADRESSE, PORT))
		if err != nil {
			fmt.Println("Erreur de connexion au serveur pour la création de personne distante:", err)
			continue
		}

		_, err = conn.Write([]byte("creer " + strconv.Itoa(p.id) + "\n"))
		if err != nil {
			fmt.Println("Erreur d'envoi de la requête de création:", err)
			continue
		}

		response, err := bufio.NewReader(conn).ReadString('\n')
		if err != nil || strings.TrimSpace(response) != "OK" {
			fmt.Println("Erreur lors de la création de la personne distante:", err, "Réponse:", response)
			continue
		}

		// Envoyer la personne distante au gestionnaire
		gestionnaires <- p
	}
}

// Code du gestionnaire pris depuis celui du professeur
func gestionnaire(entree chan personne_int, entree_prod chan personne_int, sortie chan personne_int) {
	queue := make([]personne_int, 0)

	// Boucle infinie pour recevoir et envoyer des paquets
	for {
		switch len(queue) {
		case TAILLE_G:
			sortie <- queue[0]
			queue = queue[1:]
			fmt.Println("La queue est pleine, on envoie un paquet aux ouvriers")
		case 0:
			// Si la queue est vide, attendre un peu pour ne pas saturer les canaux
			select {
			// Recevoir un paquet des producteurs ou ouvriers
			case p := <-entree:
				queue = append(queue, p)
			case p := <-entree_prod:
				queue = append(queue, p)
			}
		default:
			// Gérer l'inondation des producteurs
			if len(queue) < TAILLE_G/2 {
				select {
				case p := <-entree:
					queue = append(queue, p)
				case p := <-entree_prod:
					queue = append(queue, p)
				}
			} else {
				select {
				case p := <-entree:
					queue = append(queue, p)
				case sortie <- queue[0]:
					queue = queue[1:]
				}
			}
		}
	}
}

// Partie 1: le collecteur recoit des personne_int dont le statut est c, il les collecte dans un journal
// quand il recoit un signal de fin du temps, il imprime son journal.
func collecteur(collecteurs chan personne_int, fin chan int) {
	var journal string
	for {
		select {
		case p := <-collecteurs:
			fmt.Println("-------- Collecteur reçoit:", p.vers_string())
			journal += p.vers_string() + "\n"
		case <-fin:
			fmt.Println("\nJournal:\n", journal)
			fin <- 0
			return
		}
	}
}

func main() {
	rand.Seed(time.Now().UTC().UnixNano()) // graine pour l'aleatoire
	if len(os.Args) < 3 {
		fmt.Println("Format: client <port> <millisecondes d'attente>")
		return
	}
	port, _ := strconv.Atoi(os.Args[1])   // utile pour la partie 2
	millis, _ := strconv.Atoi(os.Args[2]) // duree du timeout
	PORT = port
	// A FAIRE
	// creer les canaux
	// lancer les goroutines (parties 1 et 2): 1 lecteur, 1 collecteur, des producteurs, des gestionnaires, des ouvriers
	// lancer les goroutines (partie 2): des producteurs distants, un proxy
	gestionnaires := make(chan personne_int, TAILLE_G)
	prod := make(chan personne_int)
	travail := make(chan personne_int)
	collecteurs := make(chan personne_int)
	lecteurs := make(chan message_lec)
	fin := make(chan int)

	go lecteur(lecteurs)
	for i := 0; i < NB_P; i++ {
		go producteur(prod, lecteurs)
	}
	for i := 0; i < NB_G; i++ {
		go gestionnaire(gestionnaires, prod, travail)
	}
	go proxy(os.Args[1]) // Lance le proxy en parallèle, en utilisant le port fourni en argument
	for i := 0; i < NB_PD; i++ {
		go producteur_distant(prod)
	}
	for i := 0; i < NB_O; i++ {
		go ouvrier(travail, gestionnaires, collecteurs)
	}
	go collecteur(collecteurs, fin)

	time.Sleep(time.Duration(millis) * time.Millisecond)

	fin <- 0
	<-fin
}
