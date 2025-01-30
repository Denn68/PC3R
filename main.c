#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fthread.h>
#include "tapis.h"

ft_scheduler_t sched_production, sched_consommation;
ft_thread_t producteurs[5];
ft_thread_t consommateurs[5];
ft_event_t enfile, defile;

// Structures des producteurs, consommateurs et messagers
typedef struct {
    Tapis *tapis;
    int id;
    char produit_nom[256];
    int cible_production;
    //int *compteur;
} Producteur;

typedef struct {
    Tapis *tapis;
    int id;
    int *compteur;
} Consommateur;

typedef struct {
    Tapis *tapis_production;
    Tapis *tapis_consommation;
    int id;
    int *compteur;
    ft_scheduler_t *sched_production;
    ft_scheduler_t *sched_consommation;
} Messager;

/*void producteur_thread(ft_thread_t self, void *arg) {
    Producteur *producteur = (Producteur *)arg;
    for (int i = 0; i < producteur->cible_production; i++) {
        Paquet paquet;
        snprintf(paquet.name, sizeof(paquet.name), "%s %d", producteur->produit_nom, i + 1);
        enfiler(producteur->tapis, paquet);
        //(*consommateur->compteur)++;
        printf("[Producteur %d] a produit : %s\n", producteur->id, paquet.name);
        ft_thread_cooperate();
    }
}*/

void producteur_thread(ft_thread_t self, void *arg) {
    Producteur *producteur = (Producteur *)arg;
    
    for (int i = 0; i < producteur->cible_production; i++) {
        if(producteur->tapis->taille < producteur->tapis->capacite){
            Paquet paquet;
            snprintf(paquet.name, sizeof(paquet.name), "%s %d", producteur->produit_nom, i + 1);
            enfiler(producteur->tapis, paquet);
            //(*consommateur->compteur)++;
            printf("[Producteur %d] a produit : %s\n", producteur->id, paquet.name);
        }
        ft_thread_cooperate();
    }
    
}

void consommateur_thread(ft_thread_t self, void *arg) {
    Consommateur *consommateur = (Consommateur *)arg;
    while (*consommateur->compteur > 0) {
        Paquet paquet = defiler(consommateur->tapis);
        printf("[Consommateur %d] Consomme : %s\n", consommateur->id, paquet.name);
        (*consommateur->compteur)--;
        ft_thread_cooperate();
    }
}

void messager_thread(ft_thread_t self, void *arg) {
    Messager * messagers = (Messager*)args;

	while((*(messagers->compteur))>0){
        ft_thread_link(*messagers->sched_production);
        Paquet paquet = defiler(messager->tapis_production);
        printf("[Messager %d] Défile : %s\n", messager->id, paquet.name);
        ft_thread_unlink();
        ft_thread_link(*messagers->sched_consommation);
        enfiler(messager->tapis_consommation, paquet);
        printf("[Messager %d] Enfile : %s\n", messager->id, paquet.name);
        ft_thread_unlink();
	}
	ft_thread_cooperate();
}

int main() {

    sched_production = ft_scheduler_create();
    sched_consommation = ft_scheduler_create();
    
    int n_producteurs = 5, m_consommateurs = 5, p_messagers = 3, cible_production = 5;
    int compteur = n_producteurs * cible_production;
    //int compteur = 0;

    Tapis *tapis_production = creer_tapis(10);
    Tapis *tapis_consommation = creer_tapis(10);
    
    Producteur prod_data[n_producteurs];
    char *produits[] = {"Pomme", "Fraise", "Kiwi", "Framboise", "Banane"};

    for (int i = 0; i < n_producteurs; i++) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "%s", produits[i]);
        prod_data[i].tapis = tapis_production;
        prod_data[i].id = i + 1;
        prod_data[i].cible_production = cible_production;
        //prod_data[i].compteur = &compteur;
        producteurs[i] = ft_thread_create(sched_production, producteur_thread, NULL, &prod_data[i]);
    }

    ft_thread_t messagers[p_messagers];
    Messager msg_data[p_messagers];
    for (int i = 0; i < p_messagers; i++) {
        msg_data[i].tapis_production = tapis_production;
        msg_data[i].tapis_consommation = tapis_consommation;
        msg_data[i].id = i + 1;
        msg_data[i].compteur = &compteur;
        msg_data[i].sched_production = &sched_production;
        msg_data[i].sched_consommation = &sched_consommation;
        messagers[i] = ft_thread_create(msg_data[i].sched_consommation, messager_thread, NULL, &msg_data[i]);
    }

    Consommateur cons_data[m_consommateurs];
    for (int i = 0; i < m_consommateurs; i++) {
        cons_data[i].tapis = tapis_consommation;
        cons_data[i].id = i + 1;
        cons_data[i].compteur = &compteur;
        consommateurs[i] = ft_thread_create(sched_consommation, consommateur_thread, NULL, &cons_data[i]);
    }

    ft_scheduler_start(sched_production);
    ft_scheduler_start(sched_consommation);
    printf("Tous les producteurs, messagers et consommateurs ont fini leurs tâches.\n");
    return 0;
}
