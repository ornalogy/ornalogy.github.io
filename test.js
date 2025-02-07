import { createServer, request } from 'http'
import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { fastify } from 'fastify'
import { fastifyStatic } from '@fastify/static'
import { fastifyCors } from '@fastify/cors'

const isLocaltunnel = process.env.LOCAL_TUNNEL === 'true'
const rootPort = 8080
const appPort = 8081
const proxyRules = {
  'ornalogy.localhost': { port: appPort },
  'app.ornalogy.localhost': { port: 8082 },
  'orna.ornalogy.localhost': { port: 3030 }
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

app.register(fastifyCors, {
  credentials: true,
  origin: '*'
})
app.register(fastifyStatic, {
  root: resolve('docs'),
  prefix: '/'
})
app.get('/lib/ui.js', async (_, reply) => reply
  .type('application/javascript')
  .send((await readFile('./docs/lib/ui.js', 'utf-8'))
    .replace('https://ornalogy.ru', isLocaltunnel ? 'https://ornalogy.loca.lt' : 'http://ornalogy.localhost:8080')))
app.get('/lib/api.js', async (_, reply) => reply
  .type('application/javascript')
  .send((await readFile('./docs/lib/api.js', 'utf-8'))
    .replace('https://app.ornalogy.ru', isLocaltunnel ? 'https://app-ornalogy.loca.lt' : 'http://app.ornalogy.localhost:8080')))
app.ready(async err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    try {
      await app.listen({ host: '0.0.0.0', port: appPort })
      if (isLocaltunnel) {
        await listenLocaltunnel()
      } else {
        listenProxy()
      }
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
    app.log.info('Ready ListenProxy')
    app.log.info(`Ornalogy site at http://ornalogy.localhost:${rootPort}`)
    app.log.info(`Ornalogy app  at http://app.ornalogy.localhost:${rootPort}/`)
    app.log.info(`Ornalogy game at http://orna.ornalogy.localhost:${rootPort}/`)
  })
}


async function listenLocaltunnel() {
  const localtunnel = (await import('localtunnel')).default
  const tunnel1 = await localtunnel({
    subdomain: 'ornalogy',
    port: proxyRules['ornalogy.localhost'].port
  })
  const tunnel2 = await localtunnel({
    subdomain: 'app-ornalogy',
    port: proxyRules['app.ornalogy.localhost'].port
  })

  console.log(tunnel1.url)
  console.log(tunnel2.url)
}
