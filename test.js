import { createServer, request } from 'http'
import { resolve } from 'path'
import { fastify } from 'fastify'
import { fastifyStatic } from '@fastify/static'

const rootPort = 8080
const appPort = 8081
const proxyRules = {
  'ornalogy.localhost': { port: appPort },
  'app.ornalogy.localhost': { port: 8082 }
}
const app = fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: { ignore: 'pid,hostname,reqId,req.remoteAddress,req.remotePort' }
    }
  }
})

app.register(fastifyStatic, {
  root: resolve('docs'),
  prefix: '/'
})
app.ready(async err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    try {
      await app.listen({ host: '0.0.0.0', port: appPort })
      app.log.info(`App listening at http://localhost:${appPort}`)
      listenProxy()
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
})


function listenProxy() {
  createServer((req, resA) => {
    const [host] = req.headers.host.split(':')
    const rules = proxyRules[host] || proxyRules['ornalogy.localhost']
    const options = {
      hostname: 'localhost',
      port: rules.port,
      path: req.url,
      method: req.method,
      headers: req.headers
    }
    const proxy = request(options, (resB) => {
      resA.writeHead(resB.statusCode, resB.headers)
      resB.pipe(resA, { end: true })
    })

    app.log.info(`Proxy ${host} => localhost:${rules.port}`)
    req.pipe(proxy, { end: true })
    proxy.on('error', err => { app.log.error(err); resA.statusCode = 500; resA.end() })
  }).listen(rootPort, () => {
    app.log.info(`Proxy listening at http://ornalogy.localhost:${rootPort}`)
  })
}
