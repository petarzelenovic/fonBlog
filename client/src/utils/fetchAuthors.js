export async function fetchAuthorsByIds(userIds, existingAuthors = {}) {
  const uniqueIds = [...new Set(userIds.map(String))].filter(
    (id) => id && !existingAuthors[id],
  );

  if (uniqueIds.length === 0) {
    return existingAuthors;
  }

  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const response = await fetch(`/api/user/${id}`);
        if (!response.ok) {
          return [id, null];
        }
        return [id, await response.json()];
      } catch {
        return [id, null];
      }
    }),
  );

  return { ...existingAuthors, ...Object.fromEntries(results) };
}
