const fs = require('fs')
const path = require('path')
module.exports = {
    description: 'Prints the contents of a file to the console',
    arguments: "<source>",
    execute(base,args) {
        if (args.length < 1) {
            base.send("Please provide a file to read")
            return
        }
        let source = args[0]
        if (!fs.existsSync(source)) {
            base.send(`File ${source} does not exist`)
            return
        }
        let data = fs.readFileSync(source, 'utf8')
        base.send(data)
    },
}