var ConsoleColor = {
  ANSICodes: {
    'reset'         : '\x1B[0m',
    'bold'          : '\x1B[1m',
    'faint'         : '\x1B[2m',
    'grey'          : '\x1B[2m\x1B[37m',
    'italic'        : '\x1B[3m',
    'underline'     : '\x1B[4m',
    'blink'         : '\x1B[5m',
    'black'         : '\x1B[30m',
    'red'           : '\x1B[31m',
    'green'         : '\x1B[32m',
    'yellow'        : '\x1B[33m',
    'blue'          : '\x1B[34m',
    'magenta'       : '\x1B[35m',
    'cyan'          : '\x1B[36m',
    'white'         : '\x1B[37m'
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

  color: function (colors, text) {
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
