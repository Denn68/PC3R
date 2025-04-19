import React from "react";

type PageSelectorProps = {
  pageNumber: number;
  setPageNumber: (page: number) => void;
  nbPages: number;
};

const PageSelector: React.FC<PageSelectorProps> = ({ pageNumber, setPageNumber, nbPages }) => {
  const pagesArray = Array.from({ length: nbPages }, (_, i) => i + 1);

  return (
    <div className="page-selector-container">
      <button
        className={`page-button ${pageNumber === 1 ? "disabled" : ""}`}
        onClick={() => setPageNumber(1)}
        title="Première page"
      >
        ««
      </button>
      <button
        className={`page-button ${pageNumber === 1 ? "disabled" : ""}`}
        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
        title="Page précédente"
      >
        ‹
      </button>

      <div className="page-numbers">
        {pagesArray.map((page) => (
          <button
            key={page}
            className={`page-number ${pageNumber === page ? "active" : ""}`}
            onClick={() => setPageNumber(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className={`page-button ${pageNumber === nbPages ? "disabled" : ""}`}
        onClick={() => setPageNumber(Math.min(nbPages, pageNumber + 1))}
        title="Page suivante"
      >
        ›
      </button>
      <button
        className={`page-button ${pageNumber === nbPages ? "disabled" : ""}`}
        onClick={() => setPageNumber(nbPages)}
        title="Dernière page"
      >
        »»
      </button>
    </div>
  );
};

export default PageSelector;