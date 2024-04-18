
const path = require('node:path')
module.exports = {
    description: 'Change directory',
    arguments: "<directory> || <null>",
    execute(base,args) {
        console.log("args:",args)
        if (args.length < 1){
            base.send(`${base.cwd}`)
            return
        }

        base.exec(`cd ${args[0]}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                if (error.code === 1) {
                    base.send(`cd: ${args[0]}: No such file or directory`, 2)
                }else {
                    base.send(`exec error: ${error}`, 2)
                }
                return;
            }
            if (stderr) {
                base.send(`stderr: ${stderr}`, 2)
                return;
            }
            base.setCWD(path.resolve(base.cwd, args[0]))
            
        });
        
    },
}