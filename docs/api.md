# API

You can use `next-update` as a module. See file
[src/next-update-as-module](./src/next-update-as-module) for all options.

```js
const nextUpdate = require('next-update')
nextUpdate({
  module: ['foo', 'bar']
}).then(results => {
  console.log(results)
})
/*
prints something like
[[
  {
    "name": "foo",
    "version": "0.2.0",
    "from": "0.2.1",
    "works": true
  },
  {
    "name": "foo",
    "version": "0.2.0",
    "from": "0.3.0",
    "works": false
  }
], [
  {
    "name": "bar",
    "version": "1.5.1",
    "from": "2.0.0",
    "works": true
  }
]]
*/
```
