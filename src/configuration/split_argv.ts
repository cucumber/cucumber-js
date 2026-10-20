/*
 * Adapted from string-argv 0.3.2
 * https://github.com/mccormicka/string-argv/tree/de7ecea79c0bbb9f5f81437b6fb4ba3c56c6b3ff
 * Copyright 2014 Anthony McCormick, licensed under the MIT License
 */

/**
 * Matches one argument at a time, in order of preference:
 * 1. a word containing quoted sections, which is kept as-is including quotes
 *    (e.g. `summary:"C:\report.txt"` for format descriptors)
 * 2. an unquoted word
 * 3. a wholly quoted section, which is captured without its quotes
 */
const ARGUMENT = /([^\s'"]([^\s'"]*(['"])(.*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])(.*?)\5/gs

/**
 * Split a command-line string into an argv-style array, without any shell
 * expansion or escaping (backslashes are path separators on Windows)
 */
export function splitArgv(value: string): string[] {
  return Array.from(value.matchAll(ARGUMENT), (match) => match[1] ?? match[6] ?? match[0])
}
