import React from "react";

const selectRow = (e) => {
  const row = e.target.parentNode;
  const rows = row.parentNode.childNodes;
  rows.forEach((row) => {
    row.classList.remove("bg-blue-300");
  });
  row.classList.add("bg-blue-300");
  const toggleButton = document.getElementById("toggleButton");
  toggleButton.classList.remove("hidden");
};

const deletePointInteret = (id) => {
  fetch(`http://localhost:8000/gti525/v1/pointsdinteret/${id}`, {
    method: "DELETE",
  }).then((response) => response.json())
  .then((data) => {
    window.location.reload();
  })
};

const toggleMenu = () => {
  const toggleContrainer = document.getElementById("toggleButtonsContainer");
  toggleContrainer.classList.toggle("hidden");
};

const TableauPointsInteret = ({ data, selectedID, setSelectedID, setModifierPointInteret, setIsCarteOpen }) => {

  return (
    <>
      {data.length > 0 ? (
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block w-full py-2 sm:px-6 lg:px-8 overflow-y-auto min-h-[40rem] max-h-[40rem]">
            <div className="flex justify-end items-end">
              <div className="flex flex-row items-center">
                <div id="toggleButtonsContainer" className="hidden px-4">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => {
                    setIsCarteOpen(true);
                  }}>
                    <i className="fa-solid fa-map-location-dot"></i>
                  </button>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={ () => deletePointInteret(selectedID)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={ () => setModifierPointInteret(true)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
                <button id="toggleButton" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 hidden"
                        onClick={toggleMenu}>
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
            </div>

              {/* Set a fixed maximum height with overflow-y-auto = scroll bar */}
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Arrondissement
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Adresse
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      className="border-b transition duration-300 ease-in-out hover:bg-blue-100"
                      key={item.ID}
                      onClick={ (e) => {
                        selectRow(e);
                        setSelectedID(item.ID);
                      }}
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium">
                        {item.Arrondissement}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {item.type === "fontaine" ? "Fontaine à boire" : "Atelier de réparation"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {item.Nom_parc_lieu}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {item.Intersection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      ) : (
        <p className="inline-block w-full py-10 sm:px-6 lg:px-8 overflow-y-auto max-h-[30rem]">
          Aucun lieu trouvé
        </p>
      )}
    </>
  );
};

export default TableauPointsInteret;
