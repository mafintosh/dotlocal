var dotlocal = require('./')

var dns = dotlocal({ttl: 1})

dns.lookup('fest.local', console.log)

dns.announce('fest.local')
  .on('query', console.log)

dns.announce('abe.local')
  .on('query', console.log)
