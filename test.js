console.log("Hello World!")
for (let i = 0; i < 10; i++) {
    console.log(i)
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

readline.question('What is your name?', name => {
    console.log(`Hello ${name}!`)
    readline.close()
    console.log("Closed readline interface")
})