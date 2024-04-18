module.exports = {
    description: 'Exit Terminal',
    arguments: "None",
    execute(base,args) {
        console.log("Closing...")
        base.send("Closing...")
        base.allowInput(false)

        base.exit();
    },
}