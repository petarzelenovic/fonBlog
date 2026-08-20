export const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

export function isValidUsername(username) {
  return typeof username === "string" && USERNAME_PATTERN.test(username);
}
