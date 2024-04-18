module.exports = {
    description: 'Refresh Commands',
    arguments: "None",
    execute(base,args) {
        base.refresh()
        base.send("Commands refreshed!")
    },
}