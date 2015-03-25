var ConsoleColor = {
  ANSICodes: {
    'reset'         : '\033[0m',
    'bold'          : '\033[1m',
    'faint'         : '\033[2m',
    'grey'          : '\033[2m\033[37m',
    'italic'        : '\033[3m',
    'underline'     : '\033[4m',
    'blink'         : '\033[5m',
    'black'         : '\033[30m',
    'red'           : '\033[31m',
    'green'         : '\033[32m',
    'yellow'        : '\033[33m',
    'blue'          : '\033[34m',
    'magenta'       : '\033[35m',
    'cyan'          : '\033[36m',
    'white'         : '\033[37m'
  },

  formatColors: {
    'undefined'     : ['yellow'],
    'pending'       : ['yellow'],
    'pending_param' : ['yellow','bold'],
    'failed'        : ['red'],
    'failed_param'  : ['red','bold'],
    'passed'        : ['green'],
    'passed_param'  : ['green','bold'],
    'skipped'       : ['cyan'],
    'skipped_param' : ['cyan','bold'],
    'comment'       : ['grey'],
    'tag'           : ['cyan']
  },

  hasColor: function () {
    var argv = process.argv;
    if (argv.indexOf('--no-color') !== -1 ||
      argv.indexOf('--color=false') !== -1) {
      return false;
    }

    if (argv.indexOf('--color') !== -1 ||
      argv.indexOf('--color=true') !== -1 ||
      argv.indexOf('--color=always') !== -1) {
      return true;
    }

    if (process.stdout && !process.stdout.isTTY) {
      return false;
    }

    if (process.platform === 'win32') {
      return true;
    }

    if ('COLORTERM' in process.env) {
      return true;
    }

    if (process.env.TERM === 'dumb') {
      return false;
    }

    if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
      return true;
    }

    return false;
  },

  color: function (colors, text) {
    if (!this.hasColor()) {
      return text;
    }
    var code = '';
    if (Object.prototype.toString.call(colors).slice(8,-1) !== 'Array')
      colors = [colors];
    for (var idx = 0; idx < colors.length; idx++) {
      // Check if color is valid
      if(this.ANSICodes[colors[idx]] !== undefined) {
        code += this.ANSICodes[colors[idx]];
      }
    }

    var lines = text.split('\n');
    for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      if(lines[lineNumber].length > 0) {
        lines[lineNumber] = code + lines[lineNumber] + this.ANSICodes.reset;
      }
    }
    return lines.join('\n');
  },

  format: function (format, text) {
    // Check environment for color codes
    var envColors = process.env.CUCUMBER_COLORS;
    if(envColors !== undefined && envColors.length > 0) {
      envColors = process.env.CUCUMBER_COLORS.split(':');
      for (var idx = 0; idx < envColors.length; idx++) {
        var envColor = envColors[idx].split('=');
        // Break if bad value
        if(envColor[1] === undefined) break;
        var newColors = envColor[1].split(',');
        // Assign environment colors only if they are valid
        var isValidColor = true;
        for (var idx2 = 0; idx2 < newColors.length; idx2++) {
          if (this.ANSICodes[newColors[idx2]] === undefined) isValidColor = false;
        }
        if (isValidColor && this.formatColors[envColor[0]] !== undefined) {
          this.formatColors[envColor[0]] = newColors;
        }
      }
    }
    format = this.formatColors[format];
    return this.color(format, text);
  },

  setFormat: function (format) {
    process.stdout.write(this.format(format,'',true));
  },

  resetFormat: function () {
    process.stdout.write(this.color('reset','',true));
  }
};
module.exports = ConsoleColor;
