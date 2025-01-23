package pc3r;

public class Compteur {
    private int valeur;

    public Compteur(int valeurInitiale) {
        this.valeur = valeurInitiale;
    }

    public synchronized int getValeur() {
        return valeur;
    }

    public synchronized void decrementer() {
        if (valeur > 0) {
            valeur--;
        }
    }
}
