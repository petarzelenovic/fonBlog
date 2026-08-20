import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { POSTS_LIMIT } from "../constants.js";
import { formatDate } from "../utils/formatDate.js";
import ConfirmModal from "./ConfirmModal";
import DashTable from "./DashTable";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          startIndex: String((currentPage - 1) * POSTS_LIMIT),
          limit: String(POSTS_LIMIT),
        });
        if (searchTerm) params.set("searchTerm", searchTerm);

        const response = await fetch(`/api/user/getusers?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.total);
          setTotalPages(Math.ceil(data.total / POSTS_LIMIT) || 1);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id, currentUser.isAdmin, currentPage, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
      setTotalUsers((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.log(error.message);
    }
  };

  const from = totalUsers === 0 ? 0 : (currentPage - 1) * POSTS_LIMIT + 1;
  const to = Math.min(currentPage * POSTS_LIMIT, totalUsers);

  return (
    <>
      <DashTable
        title="Svi korisnici"
        searchId="table-search-users"
        searchPlaceholder="Pretraži korisnike..."
        searchValue={searchInput}
        onSearchChange={(e) => setSearchInput(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        total={totalUsers}
        from={from}
        to={to}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        isEmpty={users.length === 0}
        hasSearch={Boolean(searchTerm)}
        emptyTitle="Još nema korisnika"
        emptyDescription="Registrovani korisnici će se pojaviti ovde."
      >
        <Table hoverable className="w-full table-fixed">
          <TableHead>
            <TableRow>
              <TableHeadCell className="h-11 w-36 py-0">
                Registrovan
              </TableHeadCell>
              <TableHeadCell className="h-11 py-0">Korisnik</TableHeadCell>
              <TableHeadCell className="h-11 py-0">Email</TableHeadCell>
              <TableHeadCell className="h-11 w-32 py-0">Uloga</TableHeadCell>
              <TableHeadCell className="h-11 w-28 py-0">
                <span className="sr-only">Akcije</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="bg-white dark:bg-gray-800">
                <TableCell className="h-18 py-0 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="h-18 max-w-0 py-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 truncate font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="h-18 truncate py-0 text-gray-500 dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="h-18 py-0">
                  {user.isAdmin ? (
                    <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                      Admin
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Korisnik
                    </span>
                  )}
                </TableCell>
                <TableCell className="h-18 py-0 text-right">
                  {user._id !== currentUser._id && (
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
                      }}
                    >
                      Obriši
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashTable>
      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteUser}
        message="Da li si siguran da želiš da obrišeš ovog korisnika? Ova radnja se ne može opozvati."
      />
    </>
  );
}
