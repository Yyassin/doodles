/**
 * This file contains the logic to generate a random colour for a user based on their id.
 * @author Yousef Yassin
 */

/**
 * An array of 20 random colours to be used for user avatars.
 */
const userColours = new Array(20)
  .fill(0)
  .map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

/**
 * Hashes a string to an index between 0 and 19 to be used to select a colour from the userColours array.
 * @param str The string to be hashed
 * @returns The index of the userColours array to be used for the given string
 */
const hashStringToIndex = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return hash % 20; // Modulo operation to ensure the index is within 0 to 19
};

/**
 * Retrieves a colour from the userColours array based on the given id.
 * @param id The id to be used to select a colour
 * @returns The colour to be used for the given id
 */
export const idToColour = (id: string) => userColours[hashStringToIndex(id)];
