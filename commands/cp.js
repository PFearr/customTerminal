
const path = require('node:path')
module.exports = {
    description: 'Copy a file or directory',
    arguments: "<source> <destination>",
    execute(base,args) {
        if (args.length < 1){
            base.send("copy: missing file operand", 2)
            return
        }
        if (args.length < 2){
            base.send("copy: missing destination file operand after", 2)
            return
        }

        base.exec(`copy ${args[0]} ${args[1]}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                if (error.code === 1) {
                    base.send(`copy: cannot copy '${args[0]}' to '${args[1]}': No such file or directory`, 2)
                }
                else if (error.code === 2) {
                    base.send(`copy: cannot copy '${args[0]}' to '${args[1]}': No such file or directory`, 2)
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
            base.send(`Copied ${args[0]} to ${args[1]}`)
        });
        
    },
}