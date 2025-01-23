package pc3r;

public class Tapis {

    private Paquet[] paquets;
    private int capacite;
    private int nbPaquets;
    private int debut;
    private int fin;

    public Tapis(int capacite) {
        this.capacite = capacite;
        this.paquets = new Paquet[capacite];
        this.nbPaquets = 0;
        this.debut = 0;
        this.fin = 0;
    }

    public int getCapacite() {
        return capacite;
    }
    
    public synchronized void enfiler(Paquet paquet) throws InterruptedException {
    	

        while (nbPaquets == capacite) {
            wait();
        }

        paquets[fin] = paquet;
        fin = (fin + 1) % capacite;
        nbPaquets++;

        notifyAll();
    }
    
    public synchronized Paquet defiler() throws InterruptedException {
    	

        while (nbPaquets == 0) {
            wait();
        }

        Paquet paquet = paquets[debut];
        debut = (debut + 1) % capacite;
        nbPaquets--;

        notifyAll();
        
        return paquet;
    }
}
