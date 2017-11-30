#!/usr/bin/env node

var name = process.argv[3]
var dns = require('./')()

if (name && process.argv[2] === 'announce') {
  dns.announce(name).on('question', () => console.log('Resolving ' + name + '...'))
} else if (name && process.argv[2] === 'lookup') {
  dns.lookup(name, function (err, ip) {
    if (err) throw err
    dns.destroy()
    console.log(ip)
  })
} else {
  console.log('Usage: dotlocal announce|lookup name.local')
  process.exit(1)
}
