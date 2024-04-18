const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const fs = require('fs')
var chokidar = require('chokidar');
var appdata = require('./appdata')

const { exec, spawn } = require('child_process');

const { updateElectronApp } = require('update-electron-app');
const { stdout } = require('node:process');
updateElectronApp()

const commands = {}


function registerCommand(file) {
  if (!file.endsWith(".js")) return
  let fileName = file.split("/").pop().split("\\").pop().split(".")[0]
  if (commands[fileName]) delete commands[fileName]
  file = (file.includes("/") || file.includes("\\")) ? file : __dirname + "/commands/" + file
  const command = require(file)
  commands[fileName] = command
  // console.log(`Command ${fileName} registered`)
}

function unregisterCommand(file) {
  file = (file.includes("/") || file.includes("\\")) ? file : __dirname + "/commands/" + file
  let fileName = file.split("/").pop().split("\\").pop().split(".")[0]
  delete commands[fileName]
  // console.log(`Command ${fileName} unregistered`)
}







async function createWindow() {
  const debug = true//process.env.NODE_ENV === 'development'
  let cwd = process.cwd() //process.argv[0]
  var AppData = new appdata({
    'macros': {
      "example_macro.txt": "echo 'Hello World' &<0> echo 'Goodbye World'",
      "example_macro_time.txt": "echo 'Hello World' &p<5000> echo 'Goodbye World'"
    },
    'logs': {},
    "commands": {
      "examplecommand.js": `module.exports = {
        description: 'Example Command!',
        arguments: "None",
        execute(base,args) {
            // in the terminal run examplecommand to see the result
            base.send("Pong!")
        },
    }`,
      "prompt.js": `module.exports = {
        description: 'Example Prompt Command, Ask the user their name',
        arguments: "None",
        execute(base,args) {
            base.prompt("What is your name?", (name) => {
                base.send(\`Hello \${name}!\`)
            })
        },
    }`
    }
  })
  const cmdsPaths = [
    __dirname + "/commands",
    AppData.appDataPath + "/commands"
  ]

  cmdsPaths.forEach((dirpath) => {
    if (!fs.existsSync(dirpath)) {
      return
    }
    var watcher = chokidar.watch(dirpath, { ignored: /^\./, persistent: true });
    fs.readdirSync(dirpath).forEach(file => {
      registerCommand(path.join(dirpath, file))
    })
    // on ./commands update register command
    watcher
      .on('add', function (pathe) { registerCommand(pathe) })
      .on('change', function (pathe) { registerCommand(pathe) })
      .on('unlink', function (pathe) { unregisterCommand(pathe) })
      .on('error', function (error) { process.exit(1) })
  })


  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: !debug
  })
  win.setMenuBarVisibility(debug)

  win.loadFile('index.html')


  // open dev tools
  if (debug) {
    // win.webContents.openDevTools()
    // win.minimize()
    // win.maximize()
    // win.show()
  }

  ipcMain.on("ready", () => {
    // console.log("Terminal Ready")
    win.webContents.send("setPrompt", `${cwd}>`)//"~/")

  })

  /*
  {
  command: 'stdf ad',
  name: 'stdf',
  args: [ 'ad' ],
  args_quotes: [ '' ],
  rest: 'ad'
}*/


  let memory = {}
  let queue = { ["prompts"]: [] }
  let currentPrompt = null

  ipcMain.on("send_prompt", (event, msg) => {
    const webContents = event.sender

    if (currentPrompt && typeof currentPrompt === "function") {
      currentPrompt(msg)
      currentPrompt = null
    } else if (currentPrompt && currentPrompt.forever) {
      currentPrompt.execute(msg)
      return
    }

    if (queue.prompts.length > 0) {
      let prompt = queue.prompts.shift()
      currentPrompt = prompt.cb
      webContents.send("prompt", prompt.msg)
    } else {
      webContents.send("remove_prompt")
      win.webContents.send("setPrompt", `${cwd}>`)
    }
  })
  ipcMain.on('command', async (event, commandsarray) => {


    const webContents = event.sender

    let runCommand = async (cmd) => {
      let pathes = process?.env?.path?.split(";") || []
      const command = commands[cmd.name]
      // go through each path and check if a file exists that is an exe and is the cmd.name
      for (let i = 0; i < pathes.length; i++) {
        let path = pathes[i]
        if (fs.existsSync(path + "/" + cmd.name + ".exe") && !command) {
          let cmdPrompt = spawn(path + "/" + cmd.name + ".exe", cmd.args, { cwd: cwd, env: process.env, stdio: ['pipe'] })
          let exitprompt = () => {
            console.log("Exiting Prompt")
            webContents.send("remove_prompt")
            currentPrompt = null
            if (queue.prompts.length > 0) {
              let prompt = queue.prompts.shift()
              currentPrompt = prompt.cb
              webContents.send("prompt", prompt.msg)
            } else {
              win.webContents.send("setPrompt", `${cwd}>`)
            }
          }
          let sendMsg = (msg) => {
            // if CTRL + C is pressed then exit process
            if (msg == "exit()") {
              cmdPrompt.kill()
              exitprompt()

              return
            }
            cmdPrompt.stdin.write(msg + "\n")
          }
          webContents.send("prompt", "Enter Text to be enter in console (Use exit() to exit)> ", true)

          currentPrompt = {
            forever: true,
            execute: sendMsg
          }
          cmdPrompt.stdout.on('data', (data) => {
            webContents.send('onCommand', {
              message: data.toString(),
              status: 0, // 0 success, 1 warn, 2 error, 3 info
            })
          })
          cmdPrompt.stderr.on('data', (data) => {
            console.log("error", data.toString())
            webContents.send('onCommand', {
              message: data.toString(),
              status: 2, // 0 success, 1 warn, 2 error, 3 info
            })
          })

          cmdPrompt.on('disconnect', (code) => {
            console.log(`child process disconnected with code ${code}`);
            exitprompt()
          })

          cmdPrompt.on('error', (code) => {
            console.log(`child process error with code ${code}`);
            exitprompt()
          });

          cmdPrompt.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
            exitprompt()
          })

          cmdPrompt.on('close', (code) => {
            console.log(`child process closed with code ${code}`);
            exitprompt()
          });


          return
        }
      }


      if (!command) {
        webContents.send('onCommand', {
          message: `Command ${cmd.name} not found`,
          status: 2, // 0 success, 1 warn, 2 error, 3 info
        })
        return
      }
      const args = cmd.args

      let envE = {
        ...process.env,
        ...cmd.env,
        cwd,

      }


      // replace any ${ } with the value of the variable
      for (let i = 0; i < args.length; i++) {
        let regex = /\$\{([a-zA-Z0-9_]+)\}/g
        let match = regex.exec(args[i])
        if (match) {
          args[i] = args[i].replace(match[0], envE[match[1]])
        }

      }
      try {
        command.execute({
          send: (message, status = 0) => {
            webContents.send('onCommand', {
              message,
              status, // 0 success, 1 warn, 2 error, 3 info
            })
          },
          cwd,
          memory,
          setCWD: (newCWD) => {
            cwd = newCWD
            webContents.send("setPrompt", `${cwd}>`)
          },
          refresh: () => {
            commands = {}
            fs.readdirSync(__dirname + "/commands").forEach(file => {
              registerCommand(file)
            })
          },
          clear: () => {
            webContents.send('clear')
          },
          allowInput: (toggle) => {
            webContents.send('allowInput', toggle)
          },
          exit: () => {
            app.quit()
          },
          getMacro: (name) => {
            return AppData.get("macros", name)
          },
          runCommand: (cmd) => {
            webContents.send("run_cmd", cmd)
          },
          prompt: (msg, cb) => {
            if (currentPrompt) {
              queue.prompts.push({ msg, cb })
              return
            }
            webContents.send("prompt", msg)
            currentPrompt = cb
          },
          exec: (cmd, cb) => {
            // check if cwd exist
            if (!fs.existsSync(cwd)) {
              cb(new Error(`main directory: ${cwd}: No such file or directory`))
              return
            }
            // cmd.exe /c {command}
            // this is running in cmd.exe
            exec(`cd ${cwd} && ${cmd}`, (error, stdout, stderr) => {
              // this is running as cmd
              // we can run it as PS if we want, use: https://stackoverflow.com/questions/10179114/execute-powershell-script-from-node-js
              cb(error, stdout, stderr)
            })
          },
        }, args)
        let date = new Date()
        let dateStr = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`
        AppData.append("logs", `${dateStr}.log`, `${date.toTimeString()} ${cmd.name} ${args.join(" ")}\n`)

      } catch (error) {
        webContents.send('onCommand', {
          message: error.message,
          status: 2, // 0 success, 1 warn, 2 error, 3 info
        })
      }
    }

    if (Array.isArray(commandsarray)) {
      for (let i = 0; i < commandsarray.length; i++) {
        const command = commandsarray[i]
        webContents.send('allowInput', true)
        if (command?.delay && command?.delay?.time) {
          if (command?.delay?.pause == true) {
            webContents.send('allowInput', false)
            await new Promise(resolve => setTimeout(resolve, command?.delay?.time))
            runCommand(command)
          } else {
            setTimeout(() => {
              runCommand(command)
            }, command?.delay?.time)
          }
        } else {
          runCommand(command)
        }
      }
      webContents.send('allowInput', true)
    } else {
      runCommand(commandsarray)
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})