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

    pthread_mutex_init(&tapis->mutex, NULL);
    pthread_cond_init(&tapis->non_plein, NULL);
    pthread_cond_init(&tapis->non_vide, NULL);

    return tapis;
}


void enfiler(Tapis *tapis, Paquet paquet) {
    pthread_mutex_lock(&tapis->mutex);

    while (tapis->taille == tapis->capacite) {
        pthread_cond_wait(&tapis->non_plein, &tapis->mutex);
    }

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

    pthread_cond_signal(&tapis->non_vide);

    pthread_mutex_unlock(&tapis->mutex);
}

Paquet defiler(Tapis *tapis) {
    pthread_mutex_lock(&tapis->mutex);

    while (tapis->taille == 0) {
        pthread_cond_wait(&tapis->non_vide, &tapis->mutex);
    }

    FilePaquet *tmp = tapis->tete;
    Paquet paquet = tmp->paquet;
    tapis->tete = tmp->suivant;

    if (tapis->tete == NULL) {
        tapis->queue = NULL;
    }

    free(tmp);
    tapis->taille--;

    pthread_cond_signal(&tapis->non_plein);

    pthread_mutex_unlock(&tapis->mutex);
    return paquet;
}

