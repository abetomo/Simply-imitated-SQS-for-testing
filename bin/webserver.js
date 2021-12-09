#!/usr/bin/env node

'use strict'
const server = new (require('..').Server)()
console.log(`http://${server.getHost()}:${server.getPort()}/`)
server.run({ logging: true })
