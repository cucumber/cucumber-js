import { Plugin } from '../plugin'
import PickleFilter from '../pickle_filter'
import { orderPickles } from './order_pickles'

export const filterPlugin: Plugin = {
  type: 'plugin',
  coordinator: async ({ on, transform, options, logger, environment }) => {
    let unexpandedSourcePaths: string[] = []
    on('paths:resolve', (paths) => {
      unexpandedSourcePaths = paths.unexpandedSourcePaths
    })

    transform('pickles:filter', async (allPickles) => {
      const pickleFilter = new PickleFilter({
        cwd: environment.cwd,
        featurePaths: unexpandedSourcePaths,
        names: options.names,
        tagExpression: options.tagExpression,
      })

      return allPickles.filter((pickle) => pickleFilter.matches(pickle))
    })

    transform('pickles:order', async (unorderedPickles) => {
      const orderedPickles = [...unorderedPickles]
      orderPickles(orderedPickles, options.order, logger)
      return orderedPickles
    })
  },
}
