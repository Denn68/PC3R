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

	"github.com/google/uuid"

	st "client/structures" // contient la structure Personne
	tr "client/travaux"    // contient les fonctions de travail sur les Personnes
)

var ADRESSE string = "localhost"                                   // adresse de base pour la Partie 2
var FICHIER_SOURCE string = "./elus-conseillers-municipaux-cm.csv" // fichier dans lequel piocher des personnes
var TAILLE_SOURCE int = 450000                                     // inferieure au nombre de lignes du fichier, pour prendre une ligne au hasard
var TAILLE_G int = 5                                               // taille du tampon des gestionnaires
var NB_G int = 2                                                   // nombre de gestionnaires
var NB_P int = 2                                                   // nombre de producteurs
var NB_O int = 4                                                   // nombre d'ouvriers
var NB_PD int = 2                                                  // nombre de producteurs distants pour la Partie 2

var pers_vide = st.Personne{Nom: "", Prenom: "", Age: 0, Sexe: "M"} // une personne vide

var initializeChan = make(chan int)
var travailleChan = make(chan int)
var versStringChan = make(chan int)
var donneStatutChan = make(chan int)

var versStringAnswerChan = make(chan string)
var donneStatutAnswerChan = make(chan string)

// paquet de personne, sur lequel on peut travailler, implemente l'interface personne_int
type personne_emp struct {
	personne st.Personne
	ligne    int
	aFaire   []func(st.Personne) st.Personne
	statut   string
}

// paquet de personne distante, pour la Partie 2, implemente l'interface personne_int
type personne_dist struct {
	id string
	proxy chan string
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
	fmt.Println(separation)
	naiss, _ := time.Parse("2/1/2006", separation[7])
	a1, _, _ := time.Now().Date()
	a2, _, _ := naiss.Date()
	agec := a1 - a2
	return st.Personne{Nom: separation[4], Prenom: separation[5], Sexe: separation[6], Age: agec}
}

// *** METHODES DE L'INTERFACE personne_int POUR LES PAQUETS DE PERSONNES ***

func (p *personne_emp) initialise() {
	chanLigne := make(chan string)

	go func() { lecteur(p.ligne, chanLigne) }()

	ligne := <-chanLigne
	p.personne = personne_de_ligne(ligne)
	nbTravaux := rand.Intn(5) + 1
	for i := 0; i < nbTravaux; i++ {
		p.aFaire = append(p.aFaire, tr.UnTravail())
	}
	p.statut = "R"
}

func (p *personne_emp) travaille() {
	if len(p.aFaire) > 0 {
		p.aFaire[0](p.personne)
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
	initializeChan <- 0
}

func (p personne_dist) travaille() {
	travailleChan <- 0
}

func (p personne_dist) vers_string() string {
	versStringChan <- 0
	return <-versStringAnswerChan
}

func (p personne_dist) donne_statut() string {
	donneStatutChan <- 0
	return <-donneStatutAnswerChan
}

// *** CODE DES GOROUTINES DU SYSTEME ***

// Partie 2: contacté par les méthodes de personne_dist, le proxy appelle la méthode à travers le réseau et récupère le résultat
// il doit utiliser une connection TCP sur le port donné en ligne de commande
func proxy(port string) {
	conn, err := net.Dial("tcp", ":"+port)
	if err != nil {
		fmt.Println("Erreur du lancement du proxy:", err)
		return
	}
	defer conn.Close()

	for {
		select {
		case <-initializeChan:
			_, err = conn.Write([]byte("initialize"))
			if err != nil {
				fmt.Println("Erreur d'envoi de la requête:", err)
				return
			}
			reponse, err := bufio.NewReader(conn).ReadString('\n')
			if err != nil {
				fmt.Println("Erreur de lecture de la réponse:", err)
				return
			}
			fmt.Println("Reponse:", reponse)
		case <-travailleChan:
			_, err = conn.Write([]byte("travaille"))
			if err != nil {
				fmt.Println("Erreur d'envoi de la requête:", err)
				return
			}
			reponse, err := bufio.NewReader(conn).ReadString('\n')
			if err != nil {
				fmt.Println("Erreur de lecture de la réponse:", err)
				return
			}
			fmt.Println("Reponse:", reponse)
		case <-versStringChan:
			_, err = conn.Write([]byte("vers_string"))
			if err != nil {
				fmt.Println("Erreur d'envoi de la requête:", err)
				return
			}
			reponse, err := bufio.NewReader(conn).ReadString('\n')
			if err != nil {
				fmt.Println("Erreur de lecture de la réponse:", err)
				return
			}
			versStringAnswerChan <- strings.TrimSpace(reponse)
		case <-donneStatutChan:
			_, err = conn.Write([]byte("donne_statut"))
			if err != nil {
				fmt.Println("Erreur d'envoi de la requête:", err)
				return
			}
			reponse, err := bufio.NewReader(conn).ReadString('\n')
			if err != nil {
				fmt.Println("Erreur de lecture de la réponse:", err)
				return
			}
			donneStatutAnswerChan <- strings.TrimSpace(reponse)
		default:
			fmt.Println("Rien ne se passe")
		}
	}
}

// Partie 1 : contacté par la méthode initialise() de personne_emp, récupère une ligne donnée dans le fichier source
func lecteur(nbLigne int, chanLigne chan string) {
	file, err := os.Open(FICHIER_SOURCE)
	if err != nil {
		fmt.Println("Erreur d'ouverture du fichier", err)
		return
	}
	defer file.Close()
	for {
		scanner := bufio.NewScanner(file)
		for i := 0; i < nbLigne; i++ {
			scanner.Scan()
		}
		chanLigne <- scanner.Text()
	}
}

// Partie 1: récupèrent des personne_int depuis les gestionnaires, font une opération dépendant de donne_statut()
// Si le statut est V, ils initialise le paquet de personne puis le repasse aux gestionnaires
// Si le statut est R, ils travaille une fois sur le paquet puis le repasse aux gestionnaires
// Si le statut est C, ils passent le paquet au collecteur
func ouvrier(gestionnaires chan personne_int, collecteurs chan personne_int) {
	for {
		p := <-gestionnaires
		switch p.donne_statut() {
		case "V":
			p.initialise()
			
			select {
				case gestionnaires <- p:
					fmt.Println("Le paquet a été initialisé par l'ouvrier")
				default:
					fmt.Println("Le gestionnaire est inondé")
			}
			gestionnaires <- p
		case "R":
			p.travaille()
			
			select {
				case gestionnaires <- p:
					fmt.Println("Le paquet a été travaillé par l'ouvrier")
				default:
					fmt.Println("Le gestionnaire est inondé")
			}
			gestionnaires <- p
		case "C":
			collecteurs <- p
		}
	}
}

// Partie 1: les producteurs cree des personne_int implementees par des personne_emp initialement vides,
// de statut V mais contenant un numéro de ligne (pour etre initialisee depuis le fichier texte)
// la personne est passée aux gestionnaires
func producteur(gestionnaires chan personne_int) {
	for {
		rand.Seed(time.Now().UnixNano())
		p := &personne_emp{
			personne: pers_vide,
			ligne: rand.Intn(TAILLE_SOURCE),
			aFaire: nil, statut: "V"}
		gestionnaires <- p
	}
}

// Partie 2: les producteurs distants cree des personne_int implementees par des personne_dist qui contiennent un identifiant unique
// utilisé pour retrouver l'object sur le serveur
// la creation sur le client d'une personne_dist doit declencher la creation sur le serveur d'une "vraie" personne, initialement vide, de statut V
func producteur_distant() {
	for {
		p := &personne_dist{id: uuid.New().String()}

		// Informer le serveur de la création d'une nouvelle personne
		conn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", ADRESSE, PORT))
		if err != nil {
			fmt.Println("Erreur de connexion au serveur pour la création de personne distante:", err)
			continue
		}
		defer conn.Close()

		_, err = conn.Write([]byte("create:" + id + "\n"))
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

// Partie 1: les gestionnaires recoivent des personne_int des producteurs et des ouvriers et maintiennent chacun une file de personne_int
// ils les passent aux ouvriers quand ils sont disponibles
// ATTENTION: la famine des ouvriers doit être évitée: si les producteurs inondent les gestionnaires de paquets, les ouvrier ne pourront
// plus rendre les paquets surlesquels ils travaillent pour en prendre des autres
func gestionnaire(entree chan personne_int, sortie chan personne_int) {
	queue := make([]personne_int, 0)

	for {
		select {
		case p := <-entree:
			queue = append(queue, p)
		default:
			fmt.Println("Inondé")
		}

		if len(queue) > 0 {
			select {
			case sortie <- queue[0]:
				queue = queue[1:]
			default:
				time.Sleep(15 * time.Millisecond)
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
			journal += p.vers_string() + "\n"
		case <-fin:
			fmt.Println("Journal:\n", journal)
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
	// A FAIRE
	// creer les canaux
	// lancer les goroutines (parties 1 et 2): 1 lecteur, 1 collecteur, des producteurs, des gestionnaires, des ouvriers
	// lancer les goroutines (partie 2): des producteurs distants, un proxy
	gestionnaires := make(chan personne_int, TAILLE_G)
	collecteurs := make(chan personne_int)
	fin := make(chan int)

	for i := 0; i < NB_P; i++ {
		go producteur(gestionnaires)
	}
	for i := 0; i < NB_G; i++ {
		go gestionnaire(gestionnaires, gestionnaires)
	}
	for i := 0; i < NB_O; i++ {
		go ouvrier(gestionnaires, collecteurs)
	}
	go collecteur(collecteurs, fin)

	time.Sleep(time.Duration(millis) * time.Millisecond)
	fin <- 0
	<-fin
}
