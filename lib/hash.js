'use strict'

/**
 * Using Knuth's multiplicative method, assign integer into bucket
 */
module.exports = (size = 8) => {
  const mod = Math.pow(2, size)
  return i => i * 2654435761 % mod
}