import { useState, useCallback } from "react";

export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [search, setSearch] = useState("");

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setSearch("");
  }, [initialPage]);

  return {
    page,
    limit,
    search,
    setPage: handlePageChange,
    setSearch: handleSearchChange,
    resetPagination,
  };
};
