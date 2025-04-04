import React from "react";

function PageSelector({ pageNumber, setPageNumber, nbPages }) {
  const pagesArray = [];
  for (let page = 1; page <= nbPages; page++) {
    pagesArray.push(page);
  }
  return (
    <div className="flex justify-center items-center mt-4">
      <button>
        <i
          className={`px-3 py-1 fa fa-angles-left border-2 border-black rounded-md hover:bg-gray-400 ${pageNumber === 1 ? "text-gray-300" : ""}`}
          onClick={() => setPageNumber(1)}
          title="Première page"
        ></i>
      </button>
      <button>
        <i
          className={`px-3 py-1 fa fa-angle-left border-2 border-black rounded-md hover:bg-gray-400 ${pageNumber === 1 ? "text-gray-300" : ""}`}
          aria-hidden="true"
          onClick={() =>
            pageNumber === 1 ? setPageNumber(1) : setPageNumber(pageNumber - 1)
          }
          title="Page précédente"
        ></i>
      </button>
      <div>
        {pagesArray.map((page) => (
          <button>
            <span
              key={page}
              className={`m-1 py-1 px-3 border-2 border-black rounded-md hover:bg-gray-400 ${
                pageNumber === page ? "bg-blue-400" : "" // Highlight the current page
              }`}
              onClick={() => setPageNumber(page)}
            >
              {page}
            </span>
          </button>
        ))}
      </div>
      <button>
        <i
          className={`px-3 py-1 fa fa-angle-right border-2 border-black rounded-md hover:bg-gray-400 ${pageNumber === nbPages ? "text-gray-300" : ""}`}
          aria-hidden="true"
          onClick={() =>
            pageNumber === pagesArray.length
              ? setPageNumber(nbPages)
              : setPageNumber(pageNumber + 1)
          }
          title="Page suivante"
        ></i>
      </button>
      <button>
        <i
          className={`px-3 py-1 fa fa-angles-right border-2 border-black rounded-md hover:bg-gray-400 ${pageNumber === nbPages ? "text-gray-300" : ""}`}
          onClick={() => setPageNumber(nbPages)}
          title="Dernière page"
        ></i>
      </button>
    </div>
  );
}

export default PageSelector;
