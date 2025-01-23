package pc3r;

public class Consommateur implements Runnable {
    private int idConsommateur;
    private Compteur compteur;
    private Tapis tapis;

    public Consommateur(int idConsommateur, Compteur compteur, Tapis tapis) {
        this.idConsommateur = idConsommateur;
        this.compteur = compteur;
        this.tapis = tapis;
    }

    @Override
    public void run() {
        try {
            while (compteur.getValeur() > 0) {

                Paquet paquet = tapis.defiler();
                System.out.println("C" + idConsommateur + " mange " + paquet.getName());

                compteur.decrementer();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
