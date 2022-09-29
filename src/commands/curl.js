const fetch = require('node-fetch')
const Manbo = require('manbo')
const { ProcessManager, HLJS } = require('../utils')

module.exports = async function curl (message, parent) {
  if (!message.data.args) return message.channel.createMessage('Missing Arguments.')

  let type
  const res = await fetch(message.data.args.split(' ')[0]).then(async r => {
    const text = await r.text()
    try {
      type = 'json'
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      type = HLJS.getLang(r.headers.get('Content-Type')) || 'html'
      return text
    }
  }).catch(e => {
    type = 'js'
    message.addReaction('❗')
    console.log(e.stack)
    return e.toString()
  })

  const msg = new ProcessManager(message, res || '', parent, { lang: type })
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
