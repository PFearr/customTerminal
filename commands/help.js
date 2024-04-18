module.exports = {
    description: 'Ping!',
    arguments: "None",
    execute(base,args) {
        base.send("Pong!")
    },
}