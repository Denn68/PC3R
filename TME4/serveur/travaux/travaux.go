package travaux

import (
	"math/rand"

	st "tme4/client/structures"
)

// *** LISTES DE FONCTION DE TRAVAIL DE Personne DANS Personne DU SERVEUR ***
// Essayer de trouver des fonctions *différentes* de celles du client

// Change le prénom
func f1(p st.Personne) st.Personne {
	np := p
	if np.Sexe == "M" {
		np.Prenom = "Jean-" + p.Prenom
	} else {
		np.Prenom = "Marie-" + p.Prenom
	}
	return np
}

// Change l'age
func f2(p st.Personne) st.Personne {
	np := p
	mod := rand.Intn(10)
	if p.Age > mod {
		np.Age = p.Age - mod
	}
	return np
}

// Change le nom
func f3(p st.Personne) st.Personne {
	np := p
	np.Nom = "DEMBOUUUZ"
	return np
}

// Change le code sexe
func f4(p st.Personne) st.Personne {
	np := p
	if p.Sexe == "M" {
		np.Sexe = "F"
	} else {
		np.Sexe = "M"
	}
	return np
}

func UnTravail() func(st.Personne) st.Personne {
	tableau := make([]func(st.Personne) st.Personne, 0)
	tableau = append(tableau, func(p st.Personne) st.Personne { return f1(p) })
	tableau = append(tableau, func(p st.Personne) st.Personne { return f2(p) })
	tableau = append(tableau, func(p st.Personne) st.Personne { return f3(p) })
	tableau = append(tableau, func(p st.Personne) st.Personne { return f4(p) })
	i := rand.Intn(len(tableau))
	return tableau[i]
}
