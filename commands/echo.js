const fs = require('fs')
const path = require('path')
module.exports = {
    description: 'Outputs the arguments',
    arguments: "<strings>",
    execute(base,args) {
        // loop through the arguments and check if there is a > which means we should write to a file and stop all other arguments from getting throguh. if there is NOT a > just join args and send it to the terminal
        if (args.includes(">")) {
            let index = args.indexOf(">")
            let file = args[index + 1]
            let data = args.slice(0, index).join(" ")
            fs.writeFileSync(file, data)
            base.send(data)
            return
        }
        base.send(args.join(" "))
    },
}