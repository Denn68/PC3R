mtype = {Rouge, Vert, Orange, Indetermine};
 
active proctype fin(chan obs) {
    bool clignotant = false;
    mtype couleur = Indetermine;
    clignotant = true;
    couleur = Orange;
    obs ? couleur, clignotant;
    evert:
    couleur = Vert;
    obs ! couleur, clignotant;
    if
    :: true -> goto evert
    :: true -> goto eorange
    :: true -> goto panne
    fi
    erouge:
    couleur = Rouge;
    obs ! couleur, clignotant;
    if
    :: true -> goto erouge
    :: true -> goto evert
    :: true -> goto panne
    fi
    eorange:
    couleur = Orange;
    obs ! couleur, clignotant;
    if
    :: true -> goto eorange;
    :: true -> goto erouge;
    :: true -> goto panne;
    fi
    panne:
    couleur = Orange;
    clignotant = true;
    obs ! couleur, clignotant;
    if
    :: true -> goto panne
    fi
}

active proctype observateur(chan obs){
    bool clignote = false;
    mtype ancienne = Indetermine;
    mtype coul = Indetermine;
    do
    ::obs ? coul, clignote ->
    if
    :: coul == Vert -> assert(ancienne==Rouge);
    :: coul == Rouge -> assert(ancienne==Orange);
    :: coul == Orange -> assert(ancienne!=Rouge);
    fi
    od
}

init {
    chan obs = [0] of {int, int};
    run fin(obs);
    run observateur(obs);
}