import { InstalledClock } from '@sinonjs/fake-timers'
import { IDefineSupportCodeMethods } from '../../../src/support_code_library_builder/types'

export default function (
  clock: InstalledClock,
  { Given }: IDefineSupportCodeMethods
) {
  let count = 0

  Given('foo', function () {
    clock.tick(10 * ++count)
  })
}
