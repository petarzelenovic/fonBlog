import { Button, Label, Pagination, Spinner } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { POSTS_LIMIT } from "../constants.js";

export const TABLE_HEAD_PX = 44;
export const TABLE_ROW_PX = 72;

export default function DashTable({
  title,
  searchId,
  searchPlaceholder = "Pretraga...",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  toolbarEnd,
  total,
  from,
  to,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  isEmpty,
  hasSearch,
  emptyTitle,
  emptyDescription,
  emptySearchDescription = "Pokušaj sa drugom pretragom.",
  children,
}) {
  return (
    <div className="relative bg-white shadow-md sm:rounded-lg dark:bg-gray-800">
      <div className="flex flex-col items-stretch justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="flex flex-col items-stretch justify-between space-y-3 border-t border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <form
          className="flex w-full items-center md:max-w-md"
          onSubmit={onSearchSubmit}
        >
          <Label htmlFor={searchId} className="sr-only">
            Pretraga
          </Label>
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3">
              <HiOutlineSearch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              id={searchId}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className="block w-full rounded-s-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            className="cursor-pointer rounded-s-none bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Pretraži
          </Button>
        </form>
        {toolbarEnd}
      </div>

      <div
        className="relative overflow-x-auto overflow-y-hidden bg-white dark:bg-gray-800"
        style={{ height: TABLE_HEAD_PX + POSTS_LIMIT * TABLE_ROW_PX }}
      >
        {children}

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-800/70">
            <Spinner size="xl" />
          </div>
        )}
        {!loading && isEmpty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-gray-800/90">
            <div className="px-4 text-center">
              {hasSearch ? (
                <>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nema rezultata
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {emptySearchDescription}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {emptyTitle}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {emptyDescription}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <nav
        className="flex min-h-16 flex-col items-start justify-between space-y-3 border-t border-gray-200 p-4 md:flex-row md:items-center md:space-y-0"
        aria-label="Navigacija tabele"
      >
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {total > 0 ? (
            <>
              Prikazano{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {from}–{to}
              </span>{" "}
              od{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {total}
              </span>
            </>
          ) : (
            <span className="invisible">Prikazano 0–0 od 0</span>
          )}
        </span>
        <Pagination
          currentPage={Number(currentPage)}
          totalPages={Math.max(totalPages, 1)}
          onPageChange={onPageChange}
          showIcons
          className={totalPages > 1 ? "" : "invisible"}
        />
      </nav>
    </div>
  );
}
