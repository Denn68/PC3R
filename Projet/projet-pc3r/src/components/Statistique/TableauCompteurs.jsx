import React, {useState} from 'react'
import Passagers from './Passages/Passages'

// inspiré de https://tailwind-elements.com/docs/standard/data/tables/

const TableauCompteurs = ( {compteurs, setCompteurs} ) => {

  const [triConfig, setTriConfig] = useState({
    key: "ID",
    ordre: "decroissant",
  });

  const [buttonPopup, setButtonPopup] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");

  const triTableau = (key) => {
    
    let ordre = "decroissant";
    if (triConfig.key === key && triConfig.ordre === "decroissant") ordre = "croissant";
    setTriConfig({ key, ordre });

    const sortedCompteurs = [...compteurs].sort((a, b) => {
      if (key === "Nom" || key === "Statut") {
        if (a[key].toLowerCase() < b[key].toLowerCase()) return ordre === "decroissant" ? -1 : 1;
        if (a[key].toLowerCase() > b[key].toLowerCase()) return ordre === "decroissant" ? 1 : -1;
      } else {
      if (Number(a[key]) < Number(b[key]))  return ordre === "decroissant" ? -1 : 1;
      if (Number(a[key]) > Number(b[key]))  return ordre === "decroissant" ? 1 : -1;
      }
      return 0;
    });

    setCompteurs(sortedCompteurs);
  };

  return (
    <>
      {
      compteurs.length > 0 ? 
          <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block w-full py-2 sm:px-6 lg:px-8 overflow-y-auto max-h-[35rem]">
              {/* Set a fixed maximum height with overflow-y-auto */}
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium">
                  <tr>
                  <th scope="col" className="px-6 py-4" onClick={() => triTableau("ID")}>
                    Identifiant{" "}
                    {triConfig.key === "ID" && (
                      <i className={triConfig.ordre === "decroissant" ? "px-2 fa-solid fa-caret-up" : "px-2 fa-solid fa-caret-down"}>
                      </i>
                    )}
                  </th>
                    <th scope="col" className="px-6 py-4" onClick={() => triTableau("Nom")}>
                      Nom{" "}
                      {triConfig.key === "Nom" && (
                        <i className={triConfig.ordre === "decroissant" ? "px-2 fa-solid fa-caret-up" : "px-2 fa-solid fa-caret-down"}>
                        </i>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-4" onClick={() => triTableau("Statut")}>
                      Statut{" "}
                      {triConfig.key === "Statut" && (
                        <i className={triConfig.ordre === "decroissant" ? "px-2 fa-solid fa-caret-up" : "px-2 fa-solid fa-caret-down"}>
                        </i>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-4" onClick={() => triTableau("Annee_implante")}>
                      Année d'implémentation{" "}
                      {triConfig.key === "Annee_implante" && (
                        <i className={triConfig.ordre === "decroissant" ? "px-2 fa-solid fa-caret-up" : "px-2 fa-solid fa-caret-down"}>
                        </i>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Statistiques
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compteurs.map((item) => (
                    <tr className="border-b transition duration-300 ease-in-out hover:bg-blue-100" key={item.ID}>
                      <td className="whitespace-nowrap px-6 py-3 font-medium">{item.ID}</td>
                      <td className="whitespace-nowrap px-6 py-3">{item.Nom}</td>
                      <td className="whitespace-nowrap px-6 py-3">{item.Statut}</td>
                      <td className="whitespace-nowrap px-6 py-3">{item.Annee_implante}</td>
                      <td className="whitespace-nowrap px-6 py-3">
                      <i class="fa-solid fa-chart-simple"></i>
                        <button className="px-1 " onClick={() => {
                          setButtonPopup(true);
                          setSelectedItemName(item.Nom);
                          setSelectedItemId(item.ID.toString());
                        }
                        }>
                          Passagers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        :
        <p className="inline-block w-full py-10 sm:px-6 lg:px-8 overflow-y-auto max-h-[30rem]">Aucun compteur trouvé</p>
      }
      {
      <div>
          <Passagers isOpen={buttonPopup} onClose={() => setButtonPopup(false)} selectedItemName={selectedItemName} selectedItemId={selectedItemId} ></Passagers>
      </div>
      }
    </>
  );
};
    

export default TableauCompteurs