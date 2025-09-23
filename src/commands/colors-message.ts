type ColorName = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'

interface BlockData {
  label: string
  value: string
  color?: ColorName
}

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

  format(text: string, colorCode: string, prefix?: string): string {
    const displayText = prefix ? `${prefix} ${text}` : text
    return `\`\`\`ansi\n${colorCode}${displayText}\u001b[0m\n\`\`\``
  },

  getColorCode(color: ColorName): string {
    return this.colors[color] || this.colors.white
  },

  red: function(text: string) { return this.format(text, this.colors.red) },
  green: function(text: string) { return this.format(text, this.colors.green) },
  yellow: function(text: string) { return this.format(text, this.colors.yellow) },
  blue: function(text: string) { return this.format(text, this.colors.blue) },
  magenta: function(text: string) { return this.format(text, this.colors.magenta) },
  cyan: function(text: string) { return this.format(text, this.colors.cyan) },
  white: function(text: string) { return this.format(text, this.colors.white) },

  success(text: string): string {
    return this.format(text, this.colors.green, '[SUCCESS]')
  },

  error(text: string): string {
    return this.format(text, this.colors.red, '[ERROR]')
  },

  warning(text: string): string {
    return this.format(text, this.colors.yellow, '[WARNING]')
  },

  info(text: string): string {
    return this.format(text, this.colors.cyan, '[INFO]')
  },

  title(text: string): string {
    return this.format(text, this.colors.cyan, '=')
  },

  subtitle(text: string): string {
    return this.format(text, this.colors.white, '-')
  },

  block(
    title: string,
    subtitle: string,
    data: BlockData[],
    footer: string,
    mainColor: ColorName = 'yellow'
  ): string {
    const mainColorCode = this.getColorCode(mainColor)
    
    let content = `═══════════════════════════════════════
           ${title}
═══════════════════════════════════════

${subtitle}

`
    
    data.forEach(item => {
      const valueColor = item.color || 'white'
      const valueColorCode = this.getColorCode(valueColor)
      content += `${item.label.padEnd(23)} : \u001b[0m${valueColorCode}${item.value}\u001b[0m${mainColorCode}\n`
    })
    
    content += `\n${footer}`
    
    return this.format(content, mainColorCode)
  },

  data(label: string, value: string, color: ColorName = 'cyan'): string {
    const colorMethod = this[color] as (text: string) => string
    return colorMethod ? colorMethod.call(this, `${label}: ${value}`) : this.cyan(`${label}: ${value}`)
  }
}

export default ColorMessage