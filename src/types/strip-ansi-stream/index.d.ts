declare module 'strip-ansi-stream' {
  import { Transform } from 'stream'

  export default function stripAnsiStream(): Transform
}
