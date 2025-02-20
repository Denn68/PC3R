

mtype = { NORD, SUD, EST, OUEST, TROUVE};

byte labyrinthe[6][8] =
{
    { 3, 0, 0, 0, 1, 0 },  // 2 = enter, 3 = exit
    { 0, 1, 1, 0, 1, 0 },
    { 0, 1, 0, 0, 1, 0 },
    { 1, 0, 0, 0, 1, 0 },
    { 0, 0, 1, 1, 1, 0 },
    { 1, 0, 0, 0, 0, 0 },
    { 1, 0, 1, 1, 1, 0 },
    { 1, 0, 0, 0, 1, 2 }
};

byte x = 5, y = 7;

chan chemin = [6*8] of { mtype };

active proctype explorateur() {
    byte i = 0;
    
    do
     :: (y > 0 && labyrinthe[x][y-1] != 1) ->  // Aller au NORD
        {
        y = y - 1;
        chemin ! NORD;
        }

    :: (x < 6-1 && labyrinthe[x+1][y] != 1) -> // Aller à l'EST
        {
        x = x + 1;
        chemin ! EST;   
        }
    :: (x > 0 && labyrinthe[x-1][y] != 1) ->  // Aller à l'OUEST
        {
        x = x - 1;
        chemin ! OUEST;
        }
    :: (y < 8-1 && labyrinthe[x][y+1] != 1) -> // Aller au SUD
        {
        y = y + 1;
        chemin ! SUD;
        }
    :: (labyrinthe[x][y] == 3) ->  // Vérification de l'arrivée à la sortie
        {
        break;
        }
    od

    chemin ! TROUVE;
}

active proctype observateur() {
    mtype dir;
    do
    :: chemin ? dir ->
        if
        :: dir == RIEN -> break;
        :: else -> skip;
        fi
    od
}


init {
    run explorateur();
    run observateur();
}