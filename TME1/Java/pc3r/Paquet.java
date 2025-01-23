package pc3r;

public class Paquet implements IPaquet {

    private String name;

    public Paquet(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
