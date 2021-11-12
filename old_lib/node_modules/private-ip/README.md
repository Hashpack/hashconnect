private-ip
--

> Check if IP address is private.

### badges

[![huntr](https://cdn.huntr.dev/huntr_security_badge_mono.svg)](https://huntr.dev)

### Installation

```bash
❯ npm install private-ip --save

or

❯ yarn add private-ip
```

### Usage

```js
const is_ip_private = require('private-ip')

is_ip_private('10.0.0.0')
// => true

is_ip_private('101.0.26.90')
// => false

is_ip_private('not.an.ip.com')
// => undefined

```

### Development

##### Tests

```bash
$ yarn run test
```

##### Build

```bash
$ yarn run build
```

### Authors

- Damir Mustafin [@frenchbread](https://github.com/frenchbread)
- Sick.Codes [@sickcodes](https://github.com/sickcodes) - [https://twitter.com/sickcodes](https://twitter.com/sickcodes)
- John Jackson [@johnjhacking](https://github.com/johnjhacking) - [https://twitter.com/johnjhacking](https://twitter.com/johnjhacking)
- Nick Sahler [@nicksahler](https://github.com/nicksahler) - [https://twitter.com/tensor_bodega](https://twitter.com/tensor_bodega)

### Credits

[https://github.com/frenchbread/private-ip/blob/master/CREDITS.md](https://github.com/frenchbread/private-ip/blob/master/CREDITS.md)

### License
[MIT](https://github.com/frenchbread/private-ip/blob/master/LICENSE)

### IANA Reserved IP list

https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry-1.csv
