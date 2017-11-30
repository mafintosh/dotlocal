# dotlocal

Easily announce and discover .local domains over mdns

```
npm install dotlocal
```

## Usage

``` js
var dotlocal = require('dotlocal')()

dotlocal.announce('test.local')

// on any machine on the local network (assuming it is multicast friendly)
dotlocal.lookup('test.local', function (err, ip) {
  if (err) throw err
  console.log('test.local --> ' + ip)
})
```

You can also find `test.local` using normal Unix tools, like `ping`

```
ping test.local
```

## API

#### `var announce = dotlocal.announce(domain)`

Announce your local ip on the specified domain.

`announce` will emit `question` everytime someone tries to resolve the domain.

Call `announce.destroy` to stop announcing.

#### `var query = dotlocal.lookup(domain, [options], [callback])`

Do a lookup for the domain. If you specify a callback it will call that when it finds any ip resolving that domain or a timeout occurs.

If not `query` will emit `answer` with an answer object everytime an ip is discovered.

Call `query.destroy` to stop a query (not needed if you are providing a callback).

## CLI

There is a cli available as well

```
npm install -g dotlocal
dotlocal announce test.local
```

Or to query

```
dotlocal lookup test.local
```

## License

MIT
