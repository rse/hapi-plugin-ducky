
const HAPI      = require("hapi")
const HAPIDucky = require("./hapi-plugin-ducky")

;(async () => {
    const server = HAPI.server({
        host:  "127.0.0.1",
        port:  12345,
        debug: { request: [ "error" ] }
    })

    await server.register(HAPIDucky)

    /*  provider  */
    server.route({
        method:  "POST",
        path:    "/foo",
        config: {
            payload: {
                output: "data", parse: true, allow: "application/json"
            },
            plugins: {
                ducky: "{ foo: string, bar?: boolean }"
            }
        },
        handler: async (request, h) => {
            return "OK"
        }
    })
    await server.start()

    /*  consumer  */
    let response = await server.inject({
        method:  "POST",
        url:     "/foo",
        payload: JSON.stringify({
            foo: "foo",
            bar: true
        })
    })
    if (response.result === "OK")
        console.log("-- internal request: /foo: OK")
    else
        console.log("-- internal request: /foo: ERROR: invalid response: ", response.result)

    await server.stop({ timeout: 1000 })
    process.exit(0)
})()

