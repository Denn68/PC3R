#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "tapis.h"

// J'ai utilisé ChatGpt pour la bibliothèque de thread

Tapis *creer_tapis(int capacite) {
    Tapis *tapis = (Tapis *)malloc(sizeof(Tapis));

    tapis->tete = NULL;
    tapis->queue = NULL;
    tapis->taille = 0;
    tapis->capacite = capacite;

    return tapis;
}


void enfiler(Tapis *tapis, Paquet paquet) {

    FilePaquet *nouveau = (FilePaquet *)malloc(sizeof(FilePaquet));

    nouveau->paquet = paquet;
    nouveau->suivant = NULL;

    if (tapis->queue == NULL) { 
        tapis->tete = nouveau;
        tapis->queue = nouveau;
    } else {
        tapis->queue->suivant = nouveau;
        tapis->queue = nouveau;
    }

    tapis->taille++;
}

Paquet defiler(Tapis *tapis) {

    FilePaquet *tmp = tapis->tete;
    Paquet paquet = tmp->paquet;
    tapis->tete = tmp->suivant;

    if (tapis->tete == NULL) {
        tapis->queue = NULL;
    }

    free(tmp);
    tapis->taille--;
    return paquet;
}

