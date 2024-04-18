window.electronAPI.ready();
let inPrompt = null
let inPromptForever = false
$('body').terminal(function (cmd) {

    if (inPrompt == true) {
        console.log(inPromptForever)
        if (inPromptForever == false) inPrompt = false
        window.electronAPI.send_prompt(cmd)
        return
    }
    
    
    // make command only split & and not \&
    var regexSplit = /(?<!\\)&/g
    var commands = cmd.split(regexSplit)
    
    
    let cmds = []
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i]
        const delay = command.match(/<(\d+)>/)
        const delayPause = command.match(/p<(\d+)>/)
        if (delayPause) {
            command = command.replace(delayPause[0], "")
            var cmd = $.terminal.parse_command(command);
            cmd.delay = {
                pause: true,
                time: delayPause[1]
            }
            cmds.push(cmd)
            
        } else if (delay) {
            command = command.replace(delay[0], "")
            var cmd = $.terminal.parse_command(command);
            cmd.delay = {
                pause: false,
                time: delay[1]
            }
            cmds.push(cmd)
        } else {
            var cmd = $.terminal.parse_command(commands[i]);
            cmds.push(cmd)

        }
    }
    // remove any empty commands
    cmds = cmds.filter((cmd) => cmd.name !== "")
    console.log(cmds)
    window.electronAPI.command(cmds)
})
window.electronAPI.setPrompt((msg) => {
    if (inPrompt) return;
    $('body').terminal().set_prompt(msg)
})
window.electronAPI.run_cmd((cmd) => {
    var cmd = $.terminal.parse_command(cmd);
    window.electronAPI.command(cmd)
})
window.electronAPI.onCommand((msgData) => {
    // msgData.status = 0 success, 1 warn, 2 error, 3 info
    if (msgData.status === 1) {
        console.warn(msgData.message)
        $('body').terminal().error(msgData.message)
    } else if (msgData.status === 2) {
        $('body').terminal().error(msgData.message)
    } else if (msgData.status === 3) {
        console.log(msgData.message)
    } else {
        $('body').terminal().echo(msgData.message)
    }
})
window.electronAPI.clear(() => {
    $('body').terminal().clear()
})

window.electronAPI.allowInput((toggle) => {
    if (toggle) {
        // allow Input
        // $('body').terminal().enable()
        $('body').terminal().resume()
    }
    else {
        // DON't ALLOW INPUT
        // $('body').terminal().disable()
        $('body').terminal().pause()
    }
})

window.electronAPI.prompt((msg,forever)=>{
    inPrompt = true
    inPromptForever = forever || false
    $('body').terminal().set_prompt(msg)
})
window.electronAPI.remove_prompt(()=>{
    console.log("Test")
    inPrompt = false

})













// let cwd = '~';

// function prompt() {
//     return `${cwd}$ `;
// }

// const term = $('body').terminal({
//     cd(dir) {
//         cwd = dir;
//     }
// }, {
//     prompt
// });

// term.exec('cd ~/directory');


// github('jcubic/jquery.terminal');
