const fs = require('fs')
const path = require('node:path')
module.exports = {
    description: 'Delete a file or directory',
    arguments: "<source>",
    execute(base,args) {
        if (args.length < 1){
            base.send("del: missing file operand", 2)
            return
        }

        let file = fs.readFileSync(path.resolve(base.cwd, args[0]))
        let fileStats = fs.statSync(path.resolve(base.cwd, args[0]))
        if (fileStats.isDirectory()){
            base.send(`del: cannot delete '${args[0]}': Is a directory`, 2)
            return
        }
        
        base.exec(`del ${args[0]}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                if (error.code === 1) {
                    base.send(`del: cannot delete '${args[0]}': No such file or directory`, 2)
                }
                else if (error.code === 2) {
                    base.send(`del: cannot delete '${args[0]}': No such file or directory`, 2)
                }
                else {
                    base.send(`exec error: ${error}`, 2)
                }
                return;
            }
            if (stderr) {
                base.send(`stderr: ${stderr}`, 2)
                return;
            }
            base.send(`Deleted ${args[0]}`)
            base.memory["last_deleted_file"] = {
                path: path.resolve(base.cwd, args[0]),
                data: file
            }
            console.log(base.memory)
        });
    },
}