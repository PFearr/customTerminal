
const path = require('node:path')
const fs = require('fs')
module.exports = {
    description: "Restore 1 previously deleted file",
    arguments: "",
    execute(base,args) {
        console.log(base.memory)
        // Restore the last file, base.memory["last_deleted_file"] 
        if (base.memory["last_deleted_file"]){
            let file = base.memory["last_deleted_file"]
            let file_path = path.resolve(base.cwd, file.path)
            if (fs.existsSync(file_path)){
                base.send(`restore: cannot restore '${file.path}': File exists`, 2)
                return
            }
            fs.writeFileSync(file_path, file.data)
            base.send(`Restored ${file.path}`)
            delete base.memory["last_deleted_file"]
        }
        else{
            base.send("restore: no file to restore", 2)
        }

    },
}