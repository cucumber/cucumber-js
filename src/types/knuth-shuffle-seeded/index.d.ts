declare module 'knuth-shuffle-seeded' {
  export default function shuffle<T>(inputArray: T[], seed?: string): T[]
}
