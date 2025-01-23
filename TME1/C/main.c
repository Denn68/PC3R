#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <string.h>
#include "tapis.h"

// J'ai utilisé ChatGpt pour la bibliothèque de thread

typedef struct {
    Tapis *tapis;
    int id;
    char produit_nom[256];
    int cible_production;
} Producteur;

typedef struct {
    Tapis *tapis;
    int id;
    int *compteur;
    pthread_mutex_t *compteur_mutex; 
} Consommateur;


void *producteur_thread(void *arg) {
    Producteur *producteur = (Producteur *)arg;
    for (int i = 0; i < producteur->cible_production; i++) {
        Paquet paquet;
        snprintf(paquet.name, sizeof(paquet.name), "%s %d", producteur->produit_nom, i+1);
        enfiler(producteur->tapis, paquet);
        printf("[Producteur %d] a produit : %s\n", producteur->id, paquet.name);
    }
    return NULL;
}


void *consommateur_thread(void *arg) {
    Consommateur *consommateur = (Consommateur *)arg;
    while (1) {
        pthread_mutex_lock(consommateur->compteur_mutex);
        if (*consommateur->compteur <= 0) {
            pthread_mutex_unlock(consommateur->compteur_mutex);
            break;
        }
        (*consommateur->compteur)--;
        pthread_mutex_unlock(consommateur->compteur_mutex);

        Paquet paquet = defiler(consommateur->tapis);
        printf("[Consommateur %d] Consomme : %s\n", consommateur->id, paquet.name);
    }
    return NULL;
}

int main() {
    int n_producteurs = 5, m_consommateurs = 5, cible_production = 5;
    int compteur = n_producteurs * cible_production;  // On veut avoir en valeur max du compteur la totalité des fruits produits.
    pthread_mutex_t compteur_mutex = PTHREAD_MUTEX_INITIALIZER;

    Tapis *tapis = creer_tapis(10);   // 10 est la taille du fichier

    pthread_t producteurs[n_producteurs];
    Producteur prod_data[n_producteurs];
    for (int i = 0; i < n_producteurs; i++) {
    	if (i == 0) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "Pomme");
        }
        if (i == 1) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "Fraise");
        }
        if (i == 2) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "Kiwi");
        }
        if (i == 3) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "Framboise");
        }
        if (i == 4) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "Banane");
        }
        prod_data[i].tapis = tapis;
        prod_data[i].id = i + 1;
        prod_data[i].cible_production = cible_production;
        pthread_create(&producteurs[i], NULL, producteur_thread, &prod_data[i]);
    }


    pthread_t consommateurs[m_consommateurs];
    Consommateur cons_data[m_consommateurs];
    for (int i = 0; i < m_consommateurs; i++) {
        cons_data[i].tapis = tapis;
        cons_data[i].id = i + 1;
        cons_data[i].compteur = &compteur;
        cons_data[i].compteur_mutex = &compteur_mutex;
        pthread_create(&consommateurs[i], NULL, consommateur_thread, &cons_data[i]);
    }


    for (int i = 0; i < n_producteurs; i++) {
        pthread_join(producteurs[i], NULL);
    }

    for (int i = 0; i < m_consommateurs; i++) {
        pthread_join(consommateurs[i], NULL);
    }

    pthread_mutex_destroy(&compteur_mutex);

    printf("Les producteurs ont du tous produire 5 fruits de chaque type et les consommateurs en consommé 5 de chaque type pour que ça soit juste.\n");
    return 0;
}

