const ColorMessage = {
  colors: {
    red: '\u001b[31m\u001b[1m',
    green: '\u001b[32m\u001b[1m',
    yellow: '\u001b[33m\u001b[1m',
    blue: '\u001b[34m\u001b[1m',
    magenta: '\u001b[35m\u001b[1m',
    cyan: '\u001b[36m\u001b[1m',
    white: '\u001b[37m\u001b[1m'
  } as const,

  format (text: string, colorCode: string): string {
    return `\`\`\`ansi\n${colorCode}${text}\u001b[0m\n\`\`\``
  },

  getColorCode (color: string): string {
    return this.colors[color] || this.colors.white
  },

  centerTitle (title: string, width: number = 43): string {
    const padding = Math.max(0, Math.floor((width - title.length) / 2))
    return ' '.repeat(padding) + title
  },

  header (
    title: string,
    subtitle: string,
    footer: string,
    color = 'yellow'
  ): string {
    let centeredTitle
    if (title === 'DÉFINITION') {
      centeredTitle = '              DÉFINITION'
    } else {
      centeredTitle = this.centerTitle(title)
    }

    const content = `═══════════════════════════════════════
${centeredTitle}
═══════════════════════════════════════

${subtitle}

${footer}`

    return this.format(content, this.getColorCode(color))
  },

  errorHeader (title: string, subtitle: string, footer: string): string {
    return this.header(title, subtitle, footer, 'red')
  },

  content (data, color: ColorName = 'magenta'): string {
    let content = ''

    data.forEach((item, index) => {
      if (item.label === '') {
        content += item.value
      } else if (item.value.length > 50) {
        content += `${item.label} :\n${item.value}`
      } else {
        content += `${item.label.padEnd(23)} : ${item.value}`
      }

      if (index < data.length - 1) content += '\n\n'
    })

    return this.format(content, this.getColorCode(color))
  },

  errorContent (data: BlockData[]): string {
    return this.content(data, 'magenta')
  },

  simpleContent (data: BlockData[]): string {
    let content = '```\n'

    data.forEach((item, index) => {
      if (item.label === '') {
        content += item.value
      } else if (item.value.length > 50) {
        content += `${item.label} :\n${item.value}`
      } else {
        content += `${item.label.padEnd(23)} : ${item.value}`
      }

      if (index < data.length - 1) content += '\n\n'
    })

    content += '\n```'
    return content
  }
}

export default ColorMessage
