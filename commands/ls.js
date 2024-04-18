const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
module.exports = {
    description: 'List directory contents',
    arguments: "<directory> || <null>",
    execute(base, args) {
        let dir = args.length < 1 ? base.cwd : path.resolve(base.cwd, args[0])
        fs.readdir(dir, (err, files) => {
            if (err) {
                base.send(`ls: ${args[0]}: No such file or directory`, 2)
                return
            } 
            let start = `\n&nbsp;${dir}:\n----------------------------------------------------------\n`

            base.send(start + files.join("\n"))
        });




    },
}