// backend/src/utils/validateUUID.ts

/**
 * Checks if a given string is a valid UUID v4
 * @param id string to validate
 * @returns boolean
 */
export const isValidUUID = (id: string): boolean => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
};
