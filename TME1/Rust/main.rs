use std::sync::{Arc, Condvar, Mutex};
use std::collections::VecDeque;
use std::thread;


struct Paquet {
    contenu: String,
}

struct Tapis {
    file_paquet: VecDeque<Paquet>,
    capacite: usize,
}

impl Tapis {
    fn new(capacite: usize) -> Self {
        Tapis {
            file_paquet: VecDeque::new(),
            capacite,
        }
    }

    fn enfiler(&mut self, paquet: Paquet) {
        if self.file_paquet.len() < self.capacite {
            self.file_paquet.push_back(paquet);  // push_back corresopnd à enfiler avec vecDeque
        }
    }

    fn defiler(&mut self) -> Option<Paquet> {
        self.file_paquet.pop_front()  // push_back corresopnd à défiler avec vecDeque
    }
}

struct Producteur {
    nom: String,
    id: usize,
    cible_production: usize,
    tapis: Arc<(Mutex<Tapis>, Condvar)>,
}

struct Consommateur {
    id: usize,
    compteur: Arc<Mutex<usize>>,
    tapis: Arc<(Mutex<Tapis>, Condvar)>,
}

fn produire(producteur: &Producteur) {
    for i in 0..producteur.cible_production {
        let paquet = Paquet {
            contenu: format!("{} {}", producteur.nom, i),
        };

        let (tapis_lock, condvar) = &*producteur.tapis;
        let mut tapis = tapis_lock.lock().unwrap();

        while tapis.file.len() >= tapis.capacite {
            tapis = condvar.wait(tapis).unwrap();
        }

        tapis.enfiler(paquet);
        println!("[Producteur {}] a produit un paquet.", producteur.nom);

        condvar.notify_all();
    }
}

fn consommer(consommateur: &Consommateur) {
    loop {
        let paquet;

        {
            let (tapis_lock, condvar) = &*consommateur.tapis;
            let mut tapis = tapis_lock.lock().unwrap();

            while tapis.file.is_empty() {
                tapis = condvar.wait(tapis).unwrap();
            }

            paquet = tapis.defiler().unwrap();
            println!("[Consommateur {}] a consommé : {:?}", consommateur.id, paquet);

            condvar.notify_all();
        }

        let mut compteur = consommateur.compteur.lock().unwrap();
        if *compteur > 0 {
            *compteur -= 1;
        } else {
            break;
        }
    }
}

fn main() {
    let tapis = Arc::new((Mutex::new(Tapis::new(5)), Condvar::new()));
    let compteur = Arc::new(Mutex::new(10)); 

    let producteurs: Vec<_> = (0..2)
        .map(|i| {
            let producteur = Producteur {
                nom: format!("Producteur{}", i),
                cible_production: 5,
                tapis: Arc::clone(&tapis),
            };

            thread::spawn(move || produire(&producteur))
        })
        .collect();

    let consommateurs: Vec<_> = (0..2)
        .map(|i| {
            let consommateur = Consommateur {
                id: i,
                compteur: Arc::clone(&compteur),
                tapis: Arc::clone(&tapis),
            };

            thread::spawn(move || consommer(&consommateur))
        })
        .collect();

    for handle in producteurs {
        handle.join().unwrap();
    }

    for handle in consommateurs {
        handle.join().unwrap();
    }
}
