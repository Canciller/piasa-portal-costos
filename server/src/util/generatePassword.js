import generator from 'generate-password';

/**
 * Generates password of length.
 * @param {int} length
 */
export default function (length) {
  return generator.generate({
    length: length || 10,
    numbers: true,
  });
}
