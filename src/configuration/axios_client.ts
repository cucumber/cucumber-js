/* eslint-disable no-console */
import axios from 'axios'
import tunnel, { ProxyOptions } from 'tunnel'
import { Agent } from 'http'

const getProxy = (): Agent | null => {
  if (!process.env.PROXY) {
    return null
  }

  const proxy: string | null = process.env.PROXY
  const url = new URL(proxy)
  const proxyObject: ProxyOptions = {
    host: url.hostname,
    port: Number(url.port),
  }

  const { username, password } = url

  if (username && password) {
    proxyObject.proxyAuth = `${username}:${password}`
  }
  return tunnel.httpsOverHttp({ proxy: proxyObject })
}

const createAxiosClient = () => {
  try {
    const agent: string | Agent = getProxy()
    console.log(agent)
    return axios.create({
      httpAgent: agent,
      proxy: false,
    })
  } catch (error) {
    console.log(error.message)
    throw new Error(
      'Error creating axios client',
      error instanceof Error ? error.message : error.response.data
    )
  }
}

export const axiosClient = createAxiosClient()
