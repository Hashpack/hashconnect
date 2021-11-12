const { relative } = require('iso-url')
const map = { http: 'ws', https: 'wss' }
const def = 'ws'

module.exports = (url, location) => relative(url, location, map, def)
