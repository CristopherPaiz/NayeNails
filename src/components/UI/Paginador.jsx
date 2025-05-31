import React from "react";
import PropTypes from "prop-types";
import { DynamicIcon } from "../../utils/DynamicIcon";

const Paginador = ({ currentPage, totalPages, onPageChange, maxPagesToShow = 5 }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className="px-3 py-1.5 text-xs rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 text-textPrimary dark:text-slate-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="px-3 py-1.5 text-xs text-textSecondary dark:text-slate-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors duration-150
            ${
              currentPage === i
                ? "bg-primary text-white font-semibold shadow-sm"
                : "hover:bg-primary/10 dark:hover:bg-primary/20 text-textPrimary dark:text-slate-300"
            }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="end-ellipsis" className="px-3 py-1.5 text-xs text-textSecondary dark:text-slate-400">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className="px-3 py-1.5 text-xs rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 text-textPrimary dark:text-slate-300"
        >
          {totalPages}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-8 py-4">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        <DynamicIcon name="ChevronLeft" className="w-4 h-4 text-textPrimary dark:text-slate-300" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página siguiente"
      >
        <DynamicIcon name="ChevronRight" className="w-4 h-4 text-textPrimary dark:text-slate-300" />
      </button>
    </div>
  );
};

Paginador.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPagesToShow: PropTypes.number,
};

export default Paginador;
