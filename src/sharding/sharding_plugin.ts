import { InternalPlugin } from '../plugin'
import { ISourcesCoordinates } from '../api'

export const shardingPlugin: InternalPlugin<ISourcesCoordinates> = {
  type: 'plugin',
  coordinator: async ({ on, options }) => {
    on('pickles:filter', async (allPickles) => {
      if (!options.shard) {
        return allPickles
      }

      const [shardIndexStr, shardTotalStr] = options.shard.split('/')
      const shardIndex = parseInt(shardIndexStr, 10) - 1
      const shardTotal = parseInt(shardTotalStr, 10)

      return allPickles.filter((_, i) => i % shardTotal === shardIndex)
    })
  },
}
