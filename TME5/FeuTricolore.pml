mtype = {Rouge, Vert, Orange, Indetermine};

chan obs = [0] of {mtype, int};
 
active proctype fin() {
    bool clignotant = false;
    mtype couleur = Indetermine;
    initial:
    couleur = Orange;
    if
    :: true -> goto initial
    :: true -> goto erouge
    fi
    obs ! couleur, clignotant;
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
    :: true -> goto eorange
    :: true -> goto erouge
    :: true -> goto panne
    fi
    panne:
    printf("Panne\n");
    couleur = Orange;
    clignotant = true;
    obs ! couleur, clignotant;
    if
    :: true -> goto panne
    fi
}

active proctype observateur(){
    bool clignote = false;
    mtype ancienne = Indetermine;
    mtype coul = Indetermine;
    do
    ::obs ? coul, clignote ->
    /*
    Version avec la trace 1
    if
    :: coul == Vert -> assert(ancienne==Rouge);
    :: coul == Rouge -> assert(ancienne==Orange);
    :: coul == Orange -> assert(ancienne!=Rouge);
    fi
    */
    if
    :: clignote == false ->
        if
        :: coul == Vert -> assert(ancienne!=Orange); ancienne = Vert;
        :: coul == Rouge -> assert(ancienne!=Vert); ancienne = Rouge;
        :: coul == Orange -> assert(ancienne!=Rouge); ancienne = Orange;
        fi
    //:: clignote == true -> break
    fi
    od
}