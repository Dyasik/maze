/**
 * Returns a random integer value between two integers or between 0 and
 * the one given integer (including first and excluding second).
 * @param {number} from - Start value or 0 if end value isn't passed.
 * @param {number} [to] - End value.
 * @returns {number|null} - A random value or null, if something was wrong with
 *                          the argument(s).
 */
export const randRange = (from, to) => {
  if (!to) {
    if (!from) {
      return null;
    }

    return Math.floor(Math.random() * from);
  }

  return Math.floor(Math.random() * (to - from)) + from;
};