module.exports = {
    description: 'Run a macro in the appdata/commands folder',
    arguments: "<macro_name>",
    async execute(base,args) {
        // example macro: echo 'Hello World' &<> echo 'Goodbye World'
        // &<> is a delay of 0ms
        // &<5000> is a delay of 5000ms

        const macro = base.getMacro(args[0])
        if (!macro) {
            base.send(`Macro ${args[0]} not found`)
            return
        }
        var regexSplit = /(?<!\\)&/g
        var commands = macro.split(regexSplit)    
        // make function above async and await
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i]
            const delay = command.match(/<(\d+)>/)
            const delayPause = command.match(/p<(\d+)>/)
            base.allowInput(true)
            if (delayPause) {
                base.allowInput(false)
                await new Promise(resolve => setTimeout(resolve, delayPause[1]))
                base.runCommand(command.replace(delayPause[0], ""))
            } else if (delay) {
                setTimeout(() => {
                    base.runCommand(command.replace(delay[0], ""))
                }, delay[1])
            } else {
                base.runCommand(command)
            }
            // make function above async and await
        }

        base.allowInput(true)


    },
}