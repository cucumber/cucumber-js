import axios from 'axios'
import tunnel from 'tunnel'

const getSSoUrl = () => {
    switch (process.env.NODE_ENV_BLINQ) {
      case 'local':
        return 'http://localhost:5000/api/auth'
      case 'dev':
        return 'https://dev.api.blinq.io/api/auth'
      case 'stage':
        return 'https://stage.api.blinq.io/api/auth'
      default:
        return 'https://api.blinq.io/api/auth'
    }
  }
  const getProxy = () => {
    if (!process.env.PROXY) {
      return null
    }
  
    const proxy = process.env.PROXY
    const url = new URL(proxy)
    const proxyObject = {
      host: url.hostname,
      port: Number(url.port),
    }
  
    const { username, password } = url
  
    if (username && password) {
      //@ts-ignore
      proxyObject.proxyAuth = `${username}:${password}`
    }
    return tunnel.httpsOverHttp({ proxy: proxyObject })
  }
  
  const getProjectByAccessKey = async (access_key:string) => {
    const ssoUrl = getSSoUrl()
    const accessKeyUrl = `${ssoUrl}/getProjectByAccessKey`
    const response = await axios.post(accessKeyUrl, {
      access_key,
      httpAgent: getProxy(),
      proxy: false,
    })
    if (response.status !== 200) {
      console.error('Error: Invalid access key')
      process.exit(1)
    }
    return response.data
  };

  export { getProjectByAccessKey };