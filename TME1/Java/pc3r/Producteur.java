package pc3r;

public class Producteur implements Runnable {
    private String nomProduit;
    private int cibleProduction;
    private Tapis tapis;
    private int compteurProduction;

    public Producteur(String nomProduit, int cibleProduction, Tapis tapis) {
        this.nomProduit = nomProduit;
        this.cibleProduction = cibleProduction;
        this.tapis = tapis;
        this.compteurProduction = 0;
    }

    @Override
    public void run() {
        try {
            while (compteurProduction < cibleProduction) {

                Paquet paquet = new Paquet(nomProduit + " " + (compteurProduction + 1));
                tapis.enfiler(paquet);
                System.out.println(nomProduit + " produit " + paquet.getName());

                compteurProduction++;
            }
            System.out.println("Cible atteinte pour le produit " + nomProduit);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
