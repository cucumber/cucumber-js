import { setPublishedHandler } from '../'

setPublishedHandler(async ({ url }) => {
  return Promise.resolve(url)
})
