const Manbo = require('manbo')
const { ProcessManager, count, inspect, table, type } = require('../utils')

module.exports = async function jsi (message, parent) {
  // eslint-disable-next-line no-unused-vars
  const { client } = parent
  if (!message.data.args) return message.channel.createMessage('Missing Arguments.')

  // eslint-disable-next-line no-eval
  const res = new Promise(resolve => resolve(eval(message.data.args)))
  let msg
  await res.then(output => {
    const typeofTheRes = type(output)
    const overview = inspect(output, { depth: -1 })
    const constructorName = output && output.constructor ? Object.getPrototypeOf(output.constructor).name : null
    const arrCount = count(output)
    msg = new ProcessManager(message, `=== ${overview.slice(0, 100)}${overview.length > 100 ? '...' : ''} ===\n\n${table({ Type: `${typeof output}(${typeofTheRes})`, Name: constructorName || null, Length: typeof output === 'string' && output.length, Size: output instanceof Manbo.Collection ? output.size : null, 'Content Types': arrCount ? arrCount.map(el => `${el.name} (${el.ratio}％)`).join(', ') : null })}`, parent, { lang: 'prolog' })
  }).catch(e => {
    msg = new ProcessManager(message, e.stack, parent, { lang: 'js' })
  })

  await msg.init()
  await msg.addAction([
    {
      button: {
        style: Manbo.Constants.ButtonStyles.DANGER,
        custom_id: 'manboDebugger$prev',
        label: 'Prev',
        type: Manbo.Constants.ComponentTypes.BUTTON
      },
      action: ({ manager }) => manager.previousPage(),
      requirePage: true
    },
    {
      button: {
        style: Manbo.Constants.ButtonStyles.SECONDARY,
        custom_id: 'manboDebugger$stop',
        label: 'Stop',
        type: Manbo.Constants.ComponentTypes.BUTTON
      },
      action: ({ manager }) => manager.destroy(),
      requirePage: true
    },
    {
      button: {
        style: Manbo.Constants.ButtonStyles.PRIMARY,
        custom_id: 'manboDebugger$next',
        label: 'Next',
        type: Manbo.Constants.ComponentTypes.BUTTON
      },
      action: ({ manager }) => manager.nextPage(),
      requirePage: true
    }
  ])
}
