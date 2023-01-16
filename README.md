
hapi-plugin-ducky
=================

[HAPI](http://hapijs.com/) plugin for validating payloads with [Ducky](http://duckyjs.com/)

<p/>
<img src="https://nodei.co/npm/hapi-plugin-ducky.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/hapi-plugin-ducky.png" alt=""/>

Installation
------------

```shell
$ npm install hapi hapi-plugin-ducky
```

About
-----

This is a small plugin for the [HAPI](http://hapijs.com/) server
framework for validating REST payloads with the help of the
[Ducky](http://duckyjs.com/) validation DSL. This is syntactically more
concise than the use of HAPI's [Joi](https://github.com/hapijs/joi).

Usage
-----

```js
await server.register(require("hapi-plugin-ducky"))
[...]
server.route({
    method: "POST",
    path:   "/login",
    options: {
        payload: {
            output: "data", parse: true, allow: "application/json"
        },
        plugins: {
            ducky: "{ username: string, password: string, keepLoggedIn?: boolean }"
        }
    },
    handler: async (request, h) => {
        [...]
    }
})
```

License
-------

Copyright (c) 2016-2023 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

