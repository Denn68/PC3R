#ifndef TAPIS_H
#define TAPIS_H

#include <pthread.h>

// J'ai utilisé ChatGpt pour la bibliothèque de thread

typedef struct {
    char name[256];
} Paquet;


typedef struct FilePaquet {
    Paquet paquet;           
    struct FilePaquet *suivant; 
} FilePaquet;


typedef struct {
    FilePaquet *tete;            
    FilePaquet *queue;           
    int taille;              
    int capacite;          
    pthread_mutex_t mutex;   
    pthread_cond_t non_plein; 
    pthread_cond_t non_vide; 
} Tapis;

Tapis *creer_tapis(int capacite);
void enfiler(Tapis *tapis, Paquet paquet);
Paquet defiler(Tapis *tapis);

#endif // TAPIS_H



