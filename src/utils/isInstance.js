const Manbo = require('manbo')

/**
 * @param {any} target
 * @param {any} theClass
 */
module.exports = function (target, theClass) {
  if ((Array.isArray(target) || target instanceof Manbo.Collection) && target.map(f => f instanceof theClass).includes(false)) return false
  else return target instanceof theClass
}
