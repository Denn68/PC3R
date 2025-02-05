#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fthread.h>
#include "tapis.h"

ft_scheduler_t sched_production, sched_consommation;
ft_thread_t producteurs[5];
ft_thread_t consommateurs[5];
ft_thread_t messagers[3];
ft_event_t enfile, defile;
int compteur = 0;

// Structures des producteurs, consommateurs et messagers
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
} Consommateur;

typedef struct {
    Tapis *tapis_production;
    Tapis *tapis_consommation;
    int id;
    int *compteur;
    ft_scheduler_t *sched_production;
    ft_scheduler_t *sched_consommation;
} Messager;


void producteur_thread(void *arg) {
    Producteur *producteur = (Producteur *)arg;
    
    int i = 0;
    while ( i < producteur->cible_production) {
        if(producteur->tapis->taille < producteur->tapis->capacite){
            Paquet paquet;
            snprintf(paquet.name, sizeof(paquet.name), "%s %d", producteur->produit_nom, i + 1);
            enfiler(producteur->tapis, paquet);
            printf("[Producteur %d] a produit : %s\n", producteur->id, paquet.name);
            ft_thread_generate(enfile);
            i++;
        } else {
            ft_thread_await(defile);
        }
        ft_thread_cooperate();
    }
    
}

void consommateur_thread(void *arg) {
    Consommateur *consommateur = (Consommateur *)arg;
    
    int i = 0;
    while (i < compteur) {
        if(*consommateur->compteur > 0){
            Paquet paquet = defiler(consommateur->tapis);
            printf("[Consommateur %d] Consomme : %s\n", consommateur->id, paquet.name);
            (*consommateur->compteur)--;
            i++;
            
        } else {
            ft_thread_await(defile);
        }
        ft_thread_cooperate();
    }
}

void messager_thread(void *arg) {
    Messager * messagers = (Messager*)arg;

	while((*(messagers->compteur))>0){
        
        ft_thread_link(*messagers->sched_production);
        Paquet paquet = defiler(messagers->tapis_production);
        ft_thread_unlink();
        printf("[Messager %d] Défile : %s\n", messagers->id, paquet.name);
        
        ft_thread_link(*messagers->sched_consommation);
        enfiler(messagers->tapis_consommation, paquet);
        ft_thread_generate(defile);
        ft_thread_unlink();
        printf("[Messager %d] Enfile : %s\n", messagers->id, paquet.name);
        
        (*(messagers->compteur))--;
        ft_thread_cooperate();ft_thread_cooperate();
	}
}

int main() {

    sched_production = ft_scheduler_create();
    sched_consommation = ft_scheduler_create();

    enfile = ft_event_create(sched_production);
    defile = ft_event_create(sched_consommation);
    
    int n_producteurs = 5, m_consommateurs = 5, p_messagers = 3, cible_production = 5;
    compteur = n_producteurs * cible_production;

    Tapis *tapis_production = creer_tapis(10);
    Tapis *tapis_consommation = creer_tapis(10);
    
    Producteur prod_data[n_producteurs];
    char *produits[] = {"Pomme", "Fraise", "Kiwi", "Framboise", "Banane"};

    for (int i = 0; i < n_producteurs; i++) {
        snprintf(prod_data[i].produit_nom, sizeof(prod_data[i].produit_nom), "%s", produits[i]);
        prod_data[i].tapis = tapis_production;
        prod_data[i].id = i + 1;
        prod_data[i].cible_production = cible_production;
        producteurs[i] = ft_thread_create(sched_production, producteur_thread, NULL, &prod_data[i]);
    }

    Messager msg_data[p_messagers];
    for (int i = 0; i < p_messagers; i++) {
        msg_data[i].tapis_production = tapis_production;
        msg_data[i].tapis_consommation = tapis_consommation;
        msg_data[i].id = i + 1;
        msg_data[i].compteur = &compteur;
        msg_data[i].sched_production = &sched_production;
        msg_data[i].sched_consommation = &sched_consommation;
        messagers[i] = ft_thread_create(sched_consommation, messager_thread, NULL, &msg_data[i]);
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

    for (int i = 0; i < n_producteurs; i++) {
        ft_thread_join(producteurs[i]);
    }

    for (int i = 0; i < p_messagers; i++) {
        ft_thread_join(messagers[i]);
    }

    for (int i = 0; i < m_consommateurs; i++) {
        ft_thread_join(consommateurs[i]);
    }

    printf("Tous les producteurs, messagers et consommateurs ont fini leurs tâches.\n");
    return 0;
}
