module.exports = class codeBlock {
  /**
   * @param {string} [content]
   * @param {string} [lang]
   */
  static construct (content, lang) {
    return `\`\`\`${content ? lang || '' : ''}
${content.replace(/(?<=^|[^`])``?(?=[^`]|$)/g, match => (match.length === 2 ? '\\`\\`' : '\\`'))} 
\`\`\``
  }

  /**
   * @param {string} content
   */
  static parse (content) {
    const result = content.match(/^```(.*?)\n(.*?)```$/ms)
    return result ? result.slice(0, 3).map(el => el.trim()) : null
  }
}
