package pc3r;

// Utilisation de ChhatGPT pour les threads (synchronized, wait(), notifyAll(), run())

public class Main {
    public static void main(String[] args) {

        Tapis tapis = new Tapis(10);

        int nbProducteurs = 3;
        int nbConsommateurs = nbProducteurs;
        String[] produit = {"Pomme", "Poire", "Banane"}; 

        int cibleProduction = 5;
        
        final Compteur produitTotal = new Compteur(nbProducteurs * cibleProduction);


        for (int i = 0; i < nbProducteurs; i++) {
            String nomProduit = produit[i];
            Thread producteur = new Thread(new Producteur(nomProduit, cibleProduction, tapis));
            producteur.start();
        }

        for (int i = 0; i < nbConsommateurs; i++) {
            Thread consommateur = new Thread(new Consommateur(i + 1, produitTotal, tapis));
            consommateur.start();
        }

        try {
            while (produitTotal.getValeur() > 0) {
                Thread.sleep(100);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Fin");
    }
}


