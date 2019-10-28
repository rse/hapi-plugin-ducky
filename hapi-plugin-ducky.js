/*
**  hapi-plugin-ducky -- HAPI plugin for validating payloads with Ducky
**  Copyright (c) 2016-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external dependencies  */
const Boom    = require("@hapi/boom")
const Ducky   = require("ducky")
const Cache   = require("cache-lru")

/*  internal dependencies  */
const pkg     = require("./package.json")

/*  the AST cache  */
const cache = new Cache()
cache.limit(100)

/*  the HAPI plugin register function  */
const register = async (server, options) => {
    /*  perform lazy compilation of Ducky schema specifications on all routes  */
    server.ext({ type: "onRequest", method: (request, h) => {
        /*  iterate over all routes  */
        request.server.table().forEach((route) => {
            /*  lazy compile Ducky schema specification  */
            const schema = Ducky.select(route, "settings.plugins.ducky")
            if (typeof schema === "string") {
                const cacheKey = `${route.path}.${route.method}`
                let ast = cache.get(cacheKey)
                if (ast === undefined) {
                    try {
                        ast = Ducky.validate.compile(schema)
                    }
                    catch (ex) {
                        throw new Error(`invalid Ducky payload validation specification: ${ex.message}`)
                    }
                    cache.set(cacheKey, ast)
                }
            }
        })
        return h.continue
    } })

    /*  evaluate all Ducky schema specifications  */
    server.ext({ type: "onPostAuth", method: (request, h) => {
        const cacheKey = `${request.route.path}.${request.route.method}`
        const ast = cache.get(cacheKey)
        if (ast !== undefined) {
            const err = []
            const valid = Ducky.validate.execute(request.payload, ast, err)
            if (!valid)
                return Boom.badRequest(`invalid payload: ${err.join("; ")}`)
        }
        return h.continue
    } })
}

/*  export register function, wrapped in a plugin object  */
module.exports = {
    plugin: {
        register: register,
        pkg:      pkg
    }
}

