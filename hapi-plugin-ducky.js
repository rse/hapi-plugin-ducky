/*
**  hapi-plugin-ducky -- HAPI plugin for validating payloads with Ducky
**  Copyright (c) 2016 Ralf S. Engelschall <rse@engelschall.com>
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
var Boom    = require("boom")
var Ducky   = require("ducky")
var Cache   = require("cache-lru")

/*  internal dependencies  */
var Package = require("./package.json")

/*  the AST cache  */
var cache = new Cache()
cache.limit(100)

/*  the HAPI plugin register function  */
var register = function (server, options, next) {
    /*  perform lazy compilation of Ducky schema specifications on all routes  */
    server.ext({ type: "onRequest", method: function (request, reply) {
        /*  iterate over all routes  */
        var connections = request.server.table()
        connections.forEach(function (connection) {
            connection.table.forEach(function (route) {
                /*  lazy compile Ducky schema specification  */
                var schema = Ducky.select(route, "settings.plugins.ducky")
                if (typeof schema === "string") {
                    var ast = cache.get(route.path)
                    if (ast === undefined) {
                        try {
                            ast = Ducky.validate.compile(schema)
                        }
                        catch (ex) {
                            throw new Error("invalid Ducky payload validation specification: " + ex.message)
                        }
                        cache.set(route.path, ast)
                    }
                }
            })
        })
        return reply.continue()
    }})

    /*  evaluate all Ducky schema specifications  */
    server.ext({ type: "onPostAuth", method: function (request, reply) {
        var ast = cache.get(request.route.path)
        if (ast !== undefined) {
            var err = []
            var valid = Ducky.validate.execute(request.payload, ast, err)
            if (!valid)
                return reply(Boom.badRequest("invalid payload: " + err.join("; ")))
        }
        return reply.continue()
    }})

    /*  continue processing  */
    next()
}

/*  provide meta-information as expected by HAPI  */
register.attributes = { pkg: Package }

/*  export register function, wrapped in a plugin object  */
module.exports = { register: register }

