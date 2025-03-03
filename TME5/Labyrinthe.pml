mtype = { NORD, SUD, EST, OUEST, TROUVE };

byte x = 5, y = 5;
bool en_cours = false;  

chan chemin = [6*8] of { mtype };

active proctype explorateur() {
    en_cours = true; 
    
    do
    :: (x == 5 && y == 5) -> 
        atomic {
            chemin ! NORD; 
            y = y - 1;
        }

    :: (x == 5 && y == 4) -> 
        atomic {
            if
            :: chemin ! NORD; y = y - 1; 
            :: chemin ! SUD; y = y + 1; 
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 5 && y == 3) -> 
        atomic {
            if
            :: chemin ! NORD; y = y - 1; 
            :: chemin ! SUD; y = y + 1; 
            fi;
        }

    :: (x == 5 && y == 2) -> 
        atomic {
            if
            :: chemin ! NORD; y = y - 1; 
            :: chemin ! SUD; y = y + 1;
            fi;
        }
    
    :: (x == 5 && y == 1) -> 
        atomic {
            chemin ! SUD; 
            y = y + 1;
        }

    :: (x == 4 && y == 4) -> 
        atomic {
            if
            :: chemin ! OUEST; x = x - 1;
            :: chemin ! EST; x = x + 1;
            fi;
        }

    :: (x == 3 && y == 4) -> 
        atomic {
            if
            :: chemin ! OUEST; x = x - 1;
            :: chemin ! EST; x = x + 1;
            fi;
        }

    :: (x == 2 && y == 4) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! NORD; y = y - 1;
            :: chemin ! SUD; y = y + 1;
            fi;
        }
    
    :: (x == 2 && y == 5) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! NORD; y = y - 1;
            fi;
        }

    :: (x == 3 && y == 5) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 4 && y == 5) -> 
        atomic {
            chemin ! OUEST; 
            x = x - 1;
        }

    :: (x == 2 && y == 3) -> 
        atomic {
            if
            :: chemin ! OUEST; x = x - 1;
            :: chemin ! NORD; y = y - 1;
            :: chemin ! SUD; y = y + 1;
            fi;
        }

    :: (x == 1 && y == 3) -> 
        atomic {
            chemin ! EST; 
            x = x + 1;
        }

    :: (x == 2 && y == 2) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! SUD; y = y + 1;
            fi;
        }

    :: (x == 3 && y == 2) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 4 && y == 2) -> 
        atomic {
            if
            :: chemin ! NORD; y = y - 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 4 && y == 1) -> 
        atomic {
            if
            :: chemin ! SUD; y = y + 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 3 && y == 1) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 2 && y == 1) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! OUEST; x = x - 1;
            fi;
        }

    :: (x == 1 && y == 1) -> 
        atomic {
            if
            :: chemin ! EST; x = x + 1;
            :: chemin ! NORD; y = y - 1;
            :: chemin ! SUD; y = y + 1;
            fi;
        }

    :: (x == 1 && y == 2) -> 
        atomic {
            chemin ! NORD; 
            y = y - 1;
        }

    :: (x == 1 && y == 0) -> 
        atomic {
            chemin ! TROUVE;
            break; 
        }
    od;

    en_cours = false; 
}

active proctype observateur() {
    mtype dir;
    byte compteur = 0;  // Initialise un compteur pour les tours

    do
    :: chemin ? dir -> 
        atomic {
            compteur = compteur + 1;  // Incrémente le compteur à chaque tour
            if
            :: dir == TROUVE -> 
                printf("Chemin trouvé\n");
                break;
            :: dir == NORD ->
                printf("Direction reçue : NORD\n");
            :: dir == SUD ->
                printf("Direction reçue : SUD\n");
            :: dir == EST ->
                printf("Direction reçue : EST\n");
            :: dir == OUEST ->
                printf("Direction reçue : OUEST\n");
            fi;
        }
    od;

    // Affichage du nombre total de tours après la fin du processus
    printf("Nombre total de tours : %d\n", compteur);
}


