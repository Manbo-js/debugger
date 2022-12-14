const Manbo = require('manbo')
const {InteractionCollector} = require('manbo-collector')

// eslint-disable-next-line no-unused-vars
const ManboDebugger = require('../')
const codeBlock = require('./codeBlock')
const regexpEscape = require('./regexpEscape')
/**
 * @typedef {ManboDebugger} ManboDebugger
 */

/**
 * @typedef ProcessManagerOptions
 * @property {number} [limit=1900]
 * @property {boolean} [noCode=false]
 * @property {string} [lang]
 */

/**
 * @typedef {Record.<string, any>} ActionArgs
 */
/**
 * @typedef {Function} onAction
 * @param {Record.<string, any>} arguments
 * @returns {any|Promise<any>}
 */

/**
 * @typedef Action
 * @property {Object} button
 * @property {onAction} action
 * @property {boolean} [requirePage]
 */

/**
 * Process Manager of every Process
 *
 * @param {Manbo.Message} message
 * @param {string} content
 * @param {ManboDebugger} manboDebugger
 * @param {ProcessManagerOptions} options
 */
module.exports = class ProcessManager {
    constructor(message, content, manboDebugger, options = {}) {
        this.target = message.channel
        this.manboDebugger = manboDebugger
        this.content = content || '​'
        this.messageContent = ''
        this.options = options
        this.limit = options.limit || 1900
        this.splitted = this.splitContent() || [' ']
        this.page = 1
        this.author = message.author
        this.actions = []
        this.wait = 1
        this.message = null
        this.argument = []
        if (typeof this.content !== 'string') throw new Error('Please pass valid content')
    }

    async init() {
        this.messageContent = this.genText()
        this.message = await this.target.createMessage(this.filterSecret(this.messageContent))
    }

    /**
     *
     * @param {Action} actions
     * @param {Record<string, any>} args
     */
    async addAction(actions, args) {
        if (!this.message) return

        this.actions = actions
        this.args = args || {}

        this.args.manager = this

        this.createMessageComponentMessage()

        this.messageComponentCollector =
            new InteractionCollector(this.manboDebugger.client, {
                componentType: Manbo.Constants.ComponentTypes.BUTTON,
                interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
                filter: (interaction) => (this.message.id === interaction?.message.id ?? this.message.id) && this.actions.find(e => e.button.custom_id === interaction.data.custom_id) && (interaction.member.id === this.author.id),
                time: 300_000,
                dispose: true
            })

        this.messageComponentCollector.on('collect', component => {
            const event = this.actions.find(e => e.button.custom_id === component.data.custom_id)
            if (!event) return
            component.deferUpdate()
            event.action(this.args)
        })

        this.messageComponentCollector.on('end', () => {
            this.message.edit({components: []})
        })
    }

    async createMessageComponentMessage() {
        if (this.options.noCode && this.splitted.length < 2) return
        const buttons = this.actions.filter(el => !(el.requirePage && this.splitted.length <= 1))
            .map(el => el.button)
        if (buttons.length <= 0) return
        this.message.edit({
            components: [
                {
                    type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                    components: buttons
                }
            ]
        })
    }

    filterSecret(string) {
        string = string.replace(new RegExp(this.manboDebugger.client._token.substring(4), 'gi'), '[access_token was hidden]')

        for (const el of this.manboDebugger.options.secrets) {
            string = string.replace(new RegExp(regexpEscape(el), 'gi'), '[secret]')
        }

        return string
    }

    updatePage(num) {
        if (!this.message) return
        if (this.splitted.length < num || num < 1) throw new Error('Invalid page.')
        this.page = num

        this.update(this.genText())
    }

    nextPage() {
        if (this.page >= this.splitted.length) return

        this.updatePage(this.page + 1)
    }

    previousPage() {
        if (this.page <= 1) return

        this.updatePage(this.page - 1)
    }

    update() {
        if (!this.message) return
        this.splitted = this.splitContent()
        if (this.wait === 0) this.messageContent = this.genText()
        else if (this.wait % 2 === 0) {
            this.wait = 0
            setTimeout(() => {
                this.messageContent = this.genText()
                this.edit()
                this.wait++
            }, 1000)
        } else {
            this.messageContent = this.genText()
            this.edit()
            this.wait++
        }
    }

    edit() {
        if (this.splitted.length > 1) this.createMessageComponentMessage()
        this.message.edit(this.filterSecret(this.messageContent))
    }

    /**
     * @param {string} content
     */
    add(content) {
        if (!this.message) return
        this.content += content

        this.update(this.content)
    }

    destroy() {
        this.message.edit({ components: [] })
        this.messageComponentCollector.stop()
    }

    genText() {
        return this.options.noCode && this.splitted.length < 2 ? `${this.splitted[this.page - 1]}` : `${codeBlock.construct(this.splitted[this.page - 1], this.options.lang)}\n\nPage ${this.page}/${this.splitted.length}`
    }

    splitContent() {
        const char = [new RegExp(`.{1,${this.limit}}`, 'g'), '\n']
        if (typeof this.content !== 'string') throw new Error(`${this.content} is not a string.`)
        if (this.content.length === 0) throw new Error(`${this.content} has no content included.`)
        if (this.content.length <= this.limit) return [this.content]
        let splitText = [this.content]

        while (char.length > 0 && splitText.some(elem => elem.length > this.limit)) {
            const currentChar = char.shift()
            if (currentChar instanceof RegExp) {
                splitText = splitText.flatMap(chunk => chunk.match(currentChar))
            } else {
                splitText = splitText.flatMap(chunk => chunk.split(currentChar))
            }
        }
        if (splitText.some(elem => elem.length > this.limit)) throw new RangeError('SPLIT_MAX_LEN')
        const messages = []
        let msg = ''
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk).length > this.limit) {
                messages.push(msg)
                msg = ''
            }
            msg += (msg && msg !== '' ? char : '') + chunk
        }
        return messages.concat(msg).filter(m => m)
    }
}
