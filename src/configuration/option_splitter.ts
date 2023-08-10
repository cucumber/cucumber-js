export const OptionSplitter = {
  split(option: string): string[] {
    let result: string[];
    let match1, match2;

    // "foo":"bar" or "foo":bar
    if (match1 = option.match(/^"([^"]*)":(.*)$/)) {
      // "foo":"bar"
      if (match2 = match1[2].match(/^"([^"]*)"$/)) {
        result = [match1[1], match2[1]];
      }
      // "foo":bar
      else {
        result = [match1[1], match1[2]];
      }
    }
    // foo:"bar"
    else if (match1 = option.match(/^(.*):"([^"]*)"$/)) {
      result = [match1[1], match1[2]];
    }
    // "foo"
    else if (match1 = option.match(/^"([^"]*)"$/)) {
      result = [match1[1], ''];
    }
    // file://foo or file:///foo or file://C:/foo or file://C:\foo or file:///C:/foo or file:///C:\foo
    else if (match1 = option.match(/^(file:\/{2,3}(?:[a-zA-Z]:[\/\\])?)(.*)$/)) {
      // file://foo:bar
      if (match2 = match1[2].match(/^([^:]*):(.*)$/)) {
        result = [match1[1] + match2[1], match2[2]];
      } else {
        result = [option, ''];
      }
    }
    // C:\foo or C:/foo
    else if (match1 = option.match(/^([a-zA-Z]:[\/\\])(.*)$/)) {
      // C:\foo:bar or C:/foo:bar
      if (match2 = match1[2].match(/^([^:]*):(.*)$/)) {
        result = [match1[1] + match2[1], match2[2]];
      } else {
        result = [option, ''];
      }
    }
    // foo:bar
    else if (match1 = option.match(/^([^:]*):(.*)$/)) {
      result = [match1[1], match1[2]];
    }
    // foo
    else {
      result = [option, ''];
    }

    return result;
  },
}
