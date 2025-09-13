import { InstalledClock } from '@sinonjs/fake-timers'
import { IDefineSupportCodeMethods } from '../../../src/support_code_library_builder/types'

export default function (
  clock: InstalledClock,
  { Then }: IDefineSupportCodeMethods
) {
  let count = 0

  Then('bar', function () {
    clock.tick(2 * ++count)
  })
}
