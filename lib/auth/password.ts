/** Minimum password length for register / reset / profile change. */
export const PASSWORD_MIN_LENGTH = 8;

export function isPasswordLongEnough(password: string): boolean {
  return password.trim().length >= PASSWORD_MIN_LENGTH;
}
