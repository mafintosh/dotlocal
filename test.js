var dotlocal = require('./')
var tape = require('tape')

tape('announce and lookup', function (t) {
  var dns = dotlocal()
  var name = Math.random().toString(16).slice(2) + '.local'

  var ann = dns.announce(name)
  var hadQuestion = false

  ann.on('question', function () {
    hadQuestion = true
  })

  dns.lookup(name, function () {
    // do it twice so we know we are not hitting the early announce
    dns.lookup(name, function (err, ip) {
      dns.destroy()
      t.error(err, 'no error')
      t.ok(ip, 'got ip')
      t.ok(hadQuestion, 'we served ip')
      t.end()
    })
  })
})
