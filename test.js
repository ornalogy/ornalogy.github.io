import { createServer, request } from 'http'
import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { fastify } from 'fastify'
import { fastifyStatic } from '@fastify/static'
import { fastifyCors } from '@fastify/cors'

const runMode = process.env.RUN_MODE || 'LOCAL_PROXY'
const modeDomines = {
  LOCAL_PROXY: {
    site: 'http://ornalogy.localhost:8080',
    app: 'http://app.ornalogy.localhost:8080'
  },
  LOCAL_TUNNEL: {
    site: 'https://ornalogy.loca.lt',
    app: 'https://app-ornalogy.loca.lt'
  },
  DEV_TUNNELS: {
    site: 'https://b7zw7bgd-8081.euw.devtunnels.ms',
    app: 'https://b7zw7bgd-8082.euw.devtunnels.ms'
  }
}
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
    .replace('https://ornalogy.ru', modeDomines[runMode].site)))
app.get('/lib/api.js', async (_, reply) => reply
  .type('application/javascript')
  .send((await readFile('./docs/lib/api.js', 'utf-8'))
    .replace('https://app.ornalogy.ru', modeDomines[runMode].app)))
app.ready(async err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    try {
      await app.listen({ host: '0.0.0.0', port: appPort })
      if (runMode === 'LOCAL_TUNNEL') {
        await listenLocaltunnel()
      } else if (runMode === 'LOCAL_PROXY') {
        listenProxy()
      } else if (runMode === 'DEV_TUNNELS') {
        app.log.info('Forward ports: 8081 8082')
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
