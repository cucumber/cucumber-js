import { InternalPlugin } from '../plugin'
import { ISourcesCoordinates } from '../api'
import PickleFilter from '../pickle_filter'
import { orderPickles } from '../cli/helpers'

export const filterPlugin: InternalPlugin<ISourcesCoordinates> = {
  type: 'plugin',
  coordinator: async ({ on, options, logger, environment }) => {
    let unexpandedSourcePaths: string[] = []
    on('paths:resolve', (paths) => {
      unexpandedSourcePaths = paths.unexpandedSourcePaths
    })

    on('pickles:filter', async (allPickles) => {
      const pickleFilter = new PickleFilter({
        cwd: environment.cwd,
        featurePaths: unexpandedSourcePaths,
        names: options.names,
        tagExpression: options.tagExpression,
      })

      return allPickles.filter((pickle) => pickleFilter.matches(pickle))
    })

    on('pickles:order', async (unorderedPickles) => {
      const orderedPickles = [...unorderedPickles]
      orderPickles(orderedPickles, options.order, logger)
      return orderedPickles
    })
  },
}
