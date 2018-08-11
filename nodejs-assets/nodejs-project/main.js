const rnBridge = require('rn-bridge')
const os = require('os')
const fs = require('fs')
const IPFS = require('ipfs')
const path = require('path')
const debug = require('debug')
const Logger = require('logplease')

const OrbitDB = require('orbit-db')
const RecordNode = require('record-node')

debug.useColors = () => false // disable colors in log (fixes xcode issue)

// Log Record / IPFS / OrbitDB
const logger = debug('main')
debug.enable('main,jsipfs,record:*') //libp2p:switch:dial,libp2p:switch:transport,libp2p:swarm:dialer')
Logger.setLogLevel(Logger.LogLevels.DEBUG)

process.on('uncaughtException', (err) => {
  console.log(err)
})

logger('starting')

let record = null
let ipfs = null
let started = false

const init = (docsPath) => {
  if (started) {
    if (!ipfs) {
      // shit
      return
    }

    if (ipfs.state.state() === 'running') {
      return rnBridge.channel.send(JSON.stringify({ action: 'ready' }))
    }

    ipfs.on('ready', () => {
      rnBridge.channel.send(JSON.stringify({ action: 'ready' }))
    })
    return
  }

  started = true

  const recorddir = path.resolve(docsPath, './record')
  if (!fs.existsSync(recorddir)) { fs.mkdirSync(recorddir) }
  logger(`Record Dir: ${recorddir}`)

  const ipfsConfig = {
    init: {
      bits: 1024
    },
    repo: path.resolve(recorddir, './ipfs'),
    EXPERIMENTAL: {
      dht: false, // TODO: BRICKS COMPUTER
      relay: {
        enabled: true,
        hop: {
          enabled: false, // TODO: CPU hungry on mobile
          active: false
        }
      },
      pubsub: true
    },
    config: {
      Bootstrap: [],
      Addresses: {
	    Swarm: [
          '/ip4/159.203.117.254/tcp/9090/ws/p2p-websocket-star'
	    ]
      }
    },
    connectionManager: {
      maxPeers: 10,
      minPeers: 2,
      pollInterval: 20000 // ms
    }
  }

  try {
    // Create the IPFS node instance
    ipfs = new IPFS(ipfsConfig)

    ipfs.on('ready', async () => {
      const orbitAddressPath = path.resolve(recorddir, 'address.txt')
      const orbitAddress = fs.existsSync(orbitAddressPath) ?
                           fs.readFileSync(orbitAddressPath, 'utf8') : undefined

      logger(`Orbit Address: ${orbitAddress}`)

      const opts = {
        orbitPath: path.resolve(recorddir, './orbitdb')
      }
      record = new RecordNode(ipfs, OrbitDB, opts)

      try {
        await record.init(orbitAddress)
        const log = await record.log.get()
        fs.writeFileSync(orbitAddressPath, record._log.address)
      } catch (e) {
        console.log(e)
      }

      rnBridge.channel.send(JSON.stringify({ action: 'ready' }))
    })

  } catch (e) {
    console.log(e)
  }

  logger('initialized')
}

rnBridge.channel.on('message', async (message) => {

  const msg = JSON.parse(message)
  logger(msg)

  const send = (data) => {
    const m = Object.assign({}, { action: msg.action }, data)
    rnBridge.channel.send(JSON.stringify(m))
  }

  const RPC = async (apiFunction, params = []) => {
    if (!record) {
      return
    }

    try {
      const data = await apiFunction(...params)
      send({ data })
    } catch (e) {
      console.log(e)
      send({ error: e.toString() })
    }
  }

  switch(msg.action) {
    case 'init':
      init(msg.data.docsPath)
      break

    case 'suspend':
      ipfs.stop()
      break

    case 'resume':
      ipfs.start((err) => {
        if (err) {
          console.log(err)
        }

        logger('ipfs started')
      })
      break

    case 'resolve':
      RPC(record.resolve, [msg.data.url])
      break

    case 'contacts:get':
      RPC(record.contacts.list, [msg.data.logId])
      break

    case 'contacts:add': {
      const { address, alias } = msg.data
      RPC(log.contacts.add, [{ address, alias }])
      break
    }

    case 'info:get':
      RPC(record.info)
      break

    case 'tracks:get': {
      const { start, limit } = msg.data
      RPC(record.tracks.list, [msg.data.logId, { start, limit }])
      break
    }

    case 'tracks:add': {
      const { url, title } = msg.data
      RPC(record.tracks.add, [{ url, title }])
      break
    }

    case 'tags:get':
      RPC(record.tags.list, [msg.data.logId])
      break

    case 'tags:add': {
      const { track, tag } = msg.data
      RPC(record.tags.add, [track, tag])
      break
    }

    case 'tags:delete': {
      const { trackId, tag } = msg.data
      RPC(record.tags.remove, [trackId, tag])
      break
    }

    default:
      logger(`Invalid message action: ${msg.action}`)
  }

})
