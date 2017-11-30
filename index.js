var mdns = require('multicast-dns')
var events = require('events')
var os = require('os')

module.exports = function (opts) {
  var dns = mdns(opts)
  var self = {}
  var queries = {}
  var announces = {}
  var ttl = (opts && opts.ttl) || 1

  self.dns = dns

  dns.on('response', function (response, rinfo) {
    var as = response.answers

    for (var i = 0; i < as.length; i++) {
      var a = as[i]
      var q = queries[a.name]

      if (!q || q.types.indexOf(a.type) === -1) continue
      q.emit('answer', a, rinfo)
    }
  })

  dns.on('query', function (query, rinfo) {
    var qs = query.questions

    for (var i = 0; i < qs.length; i++) {
      var q = qs[i]
      var a = announces[q.name]

      if (!a || a.types.indexOf(q.type) === -1) continue
      a.onquestion(q, rinfo)
      return
    }
  })

  self.destroy = function (cb) {
    Object.keys(queries).forEach(function (k) {
      queries[k].destroy()
    })
    dns.destroy(cb)
  }

  self.lookup = function (name, opts, cb) {
    if (typeof opts === 'function') return self.lookup(name, null, opts)
    if (!opts) opts = {}

    var search = new events.EventEmitter()

    queries[name] = search

    search.types = ['A']
    search.name = name
    search.interval = setInterval(query, 2000)
    search.query = query
    search.destroy = destroy

    if (cb) capture(search, opts, cb)
    query()

    return search

    function destroy () {
      clearInterval(search.interval)
      if (queries[name] === search) delete queries[name]
    }

    function query () {
      dns.query({
        type: 'query',
        questions: [{
          type: 'A',
          name: name
        }]
      })
    }
  }

  function capture (search, opts, cb) {
    var timeout = setTimeout(ontimeout, opts.timeout || 5000)
    search.once('answer', onanswer)

    function ontimeout () {
      search.destroy()
      cb(new Error('ETIMEDOUT'))
    }

    function onanswer (a) {
      clearTimeout(timeout)
      search.destroy()
      cb(null, a.data, 'A')
    }
  }

  self.announce = function (name) {
    var ann = new events.EventEmitter()

    ann.types = ['A', 'AAAA']

    ann.onquestion = function (question, rinfo) {
      if (question) ann.emit('question', question, rinfo)
      dns.respond({
        type: 'response',
        answers: answers()
      })
    }

    ann.destroy = function () {
      if (announces[name] === ann) delete announces[name]
    }

    announces[name] = ann
    ann.onquestion(null, null)

    return ann

    function answers () {
      var ans = []
      var networks = os.networkInterfaces()

      Object.keys(networks).forEach(function (net) {
        var n = networks[net]
        n.forEach(function (addr) {
          if (!addr.internal) {
            ans.push({
              type: addr.family === 'IPv4' ? 'A' : 'AAAA',
              ttl: ttl,
              name: name,
              data: addr.address
            })
          }
        })
      })

      if (!ans.length) {
        ans.push({type: 'A', ttl: ttl, name: name, data: '127.0.0.1'})
        ans.push({type: 'AAAA', ttl: ttl, name: name, data: '::1'})
      }

      return ans
    }
  }

  return self
}
