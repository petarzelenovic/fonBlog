import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Tooltip,
} from "flowbite-react";
import { DEFAULT_CATEGORY_COLOR, POSTS_LIMIT } from "../constants.js";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import ConfirmModal from "./ConfirmModal";
import DashTable from "./DashTable";

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "dj")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryErrorMessage(message) {
  if (message?.includes("already exists")) {
    return "Kategorija sa ovim identifikatorom već postoji.";
  }
  return message || "Došlo je do greške";
}

const emptyForm = {
  name: "",
  color: DEFAULT_CATEGORY_COLOR,
};

export default function DashCategories() {
  const { categories, loading, refreshCategories } = useCategories();
  const { showError } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const filtered = useMemo(() => {
    const query = searchTerm.toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query),
    );
  }, [categories, searchTerm]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / POSTS_LIMIT) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * POSTS_LIMIT,
    safePage * POSTS_LIMIT,
  );
  const from = total === 0 ? 0 : (safePage - 1) * POSTS_LIMIT + 1;
  const to = Math.min(safePage * POSTS_LIMIT, total);
  const slug = slugify(form.name);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      color: category.color || DEFAULT_CATEGORY_COLOR,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleNameChange = (event) => {
    setForm((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const color = form.color.trim();
    if (!name || !slug || !color) {
      showError("Ime, identifikator i boja su obavezni");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        editing ? `/api/categories/${editing._id}` : "/api/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, color }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        showError(categoryErrorMessage(data.message));
        return;
      }
      await refreshCategories();
      closeForm();
    } catch (error) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setShowDeleteModal(false);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showError(categoryErrorMessage(data.message));
        return;
      }
      await refreshCategories();
    } catch (error) {
      showError(error.message);
    } finally {
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <DashTable
        title="Sve kategorije"
        searchId="table-search-categories"
        searchPlaceholder="Pretraži kategorije..."
        searchValue={searchInput}
        onSearchChange={(e) => setSearchInput(e.target.value)}
        onSearchSubmit={(e) => {
          e.preventDefault();
          setSearchTerm(searchInput.trim());
          setCurrentPage(1);
        }}
        toolbarEnd={
          <Button
            type="button"
            className="cursor-pointer bg-fon-navy text-white hover:bg-fon-navy-hover"
            onClick={openCreate}
          >
            Dodaj kategoriju
          </Button>
        }
        total={total}
        from={from}
        to={to}
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        isEmpty={pageItems.length === 0}
        hasSearch={Boolean(searchTerm)}
        emptyTitle="Još nema kategorija"
        emptyDescription="Dodaj prvu kategoriju da možeš da razvrstavaš objave."
      >
        <Table hoverable className="w-full table-fixed">
          <TableHead>
            <TableRow>
              <TableHeadCell className="h-11 py-0">Kategorija</TableHeadCell>
              <TableHeadCell className="h-11 w-48 py-0">
                Identifikator
              </TableHeadCell>
              <TableHeadCell className="h-11 w-28 py-0">Objave</TableHeadCell>
              <TableHeadCell className="h-11 w-36 py-0">
                <span className="sr-only">Akcije</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((category) => {
              const inUse = (category.postsCount || 0) > 0;
              return (
                <TableRow
                  key={category._id}
                  className="bg-white dark:bg-gray-800"
                >
                  <TableCell className="h-18 py-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-8 w-8 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="h-18 truncate py-0 text-gray-500 dark:text-gray-400">
                    {category.slug}
                  </TableCell>
                  <TableCell className="h-18 py-0 text-gray-500 dark:text-gray-400">
                    {category.postsCount || 0}
                  </TableCell>
                  <TableCell className="h-18 py-0">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
                        onClick={() => openEdit(category)}
                      >
                        Izmeni
                      </button>
                      {inUse ? (
                        <Tooltip content="Kategorija se koristi u postojećim objavama i ne može se obrisati.">
                          <span>
                            <button
                              type="button"
                              className="cursor-not-allowed font-medium text-gray-400 dark:text-gray-500"
                              disabled
                            >
                              Obriši
                            </button>
                          </span>
                        </Tooltip>
                      ) : (
                        <button
                          type="button"
                          className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setShowDeleteModal(true);
                          }}
                        >
                          Obriši
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DashTable>

      <Modal show={showForm} onClose={closeForm} dismissible>
        <ModalHeader>
          {editing ? "Izmeni kategoriju" : "Nova kategorija"}
        </ModalHeader>
        <ModalBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="category-name">Ime</Label>
              <TextInput
                id="category-name"
                className="mt-2"
                value={form.name}
                onChange={handleNameChange}
                placeholder="npr. Studije"
              />
            </div>
            <div>
              <Label htmlFor="category-slug">Identifikator</Label>
              <TextInput
                id="category-slug"
                className="mt-2"
                value={slug}
                readOnly
                placeholder="npr. studije"
              />
              <p className="mt-1 text-xs text-fon-muted dark:text-fon-dark-muted">
                Koristi se u URL-ovima i popunjava se automatski iz imena.
                {editing
                  ? " Ako se identifikator promeni, postojeće objave će se automatski prebaciti."
                  : ""}
              </p>
            </div>
            <div>
              <Label htmlFor="category-color">Boja</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="category-color"
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {form.color}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                color="gray"
                className="cursor-pointer"
                onClick={closeForm}
              >
                Otkaži
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-fon-navy text-white hover:bg-fon-navy-hover"
                disabled={saving}
              >
                {editing ? "Sačuvaj" : "Dodaj"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDelete}
        message={`Da li si siguran da želiš da obrišeš kategoriju „${categoryToDelete?.name || ""}”? Ova radnja se ne može opozvati.`}
      />
    </>
  );
}
