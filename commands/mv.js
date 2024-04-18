
const path = require('node:path')
module.exports = {
    description: 'Move a file or directory',
    arguments: "<source> <destination>",
    execute(base,args) {
        if (args.length < 1){
            base.send("mv: missing file operand", 2)
            return
        }
        if (args.length < 2){
            base.send("mv: missing destination file operand after", 2)
            return
        }

        base.exec(`move ${args[0]} ${args[1]}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                if (error.code === 1) {
                    base.send(`mv: cannot move '${args[0]}' to '${args[1]}': No such file or directory`, 2)
                }
                else if (error.code === 2) {
                    base.send(`mv: cannot move '${args[0]}' to '${args[1]}': No such file or directory`, 2)
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
            base.send(`Moved ${args[0]} to ${args[1]}`)
        });
        
    },
}