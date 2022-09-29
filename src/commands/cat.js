const fs = require('fs')
const Manbo = require('manbo')
const { ProcessManager, HLJS } = require('../utils')

module.exports = async function curl (message, parent) {
  if (!message.data.args) return message.channel.createMessage('Missing Arguments.')
  const filename = message.data.args
  let msg
  fs.readFile(filename, async (err, data) => {
    if (err) msg = new ProcessManager(message, err.toString(), parent, { lang: 'js' })
    else msg = new ProcessManager(message, data.toString(), parent, { lang: HLJS.getLang(filename.split('.').pop()) })
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
  })
}
