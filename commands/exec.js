module.exports = {
    description: 'Executes a command',
    arguments: "<command>",
    execute(base,args) {
        let ShowNoOutPut = false
        if (String(args[0]).startsWith("!")){
            args[0] = args[0].substring(1)
            ShowNoOutPut = true
        }
        base.send(`Executing command: ${args.join(" ")}`)
        base.exec(args.join(" "),(err,stdout,stderr) => {
            if(err) {
                base.send(`Error: ${err}`)
                return
            }
            if (stderr) {
                base.send(`Error: ${stderr}`)
                return
            }
            if (stdout === "" && ShowNoOutPut){
                base.send("No output.")
                return
            }else if (stdout !== ""){
                base.send(stdout)
                return
            }

        })
    },
}