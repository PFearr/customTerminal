// Path: appdata.js
let path = require('path')
let fs = require('fs')
class AppData {
    constructor(defaultFoldersAndFiles) {
        this.files = {}
        this.defaultFoldersAndFiles = defaultFoldersAndFiles
        // %appdata% for windows, ~/.config for linux, ~/Library/Application Support for macOS
        // ^appdata/terminal/*
        this.appDataPath = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config'), 'terminal')
        this.load()

        // Load default files/folders
        // example: { 'file.txt': 'Hello World', 'folder': {} }
        for (let key in this.defaultFoldersAndFiles) {
            function doStuff(filePath, fileName, obj) {
                fileName = fileName.split("/").pop().split("\\").pop()
                if (typeof obj[fileName] === 'object') {
                    console.log(filePath, fileName)
                    if (!fs.existsSync(filePath + "\\" + fileName)) {
                        fs.mkdirSync(filePath + "\\" + fileName)
                    }
                    for (let file in obj[fileName]) {
                        doStuff(path.join(filePath, fileName), file, obj[fileName])
                    }
                } else {
                    if (!fs.existsSync(filePath + fileName)) {
                        fs.writeFileSync(path.join(filePath, fileName), obj[fileName])
                    }
                }
            }
            doStuff(this.appDataPath, key, this.defaultFoldersAndFiles)

        }

        console.log("AppData Loaded")
    }
    load() {
        try {
            if (!fs.existsSync(this.appDataPath)) {
                fs.mkdirSync(this.appDataPath)
            }
            let files = fs.readdirSync(this.appDataPath)
            this.files = {}
            for (let file of files) {
                function doStuff(filePath, fileName, obj) {
                    let fileStat = fs.statSync(filePath)
                    if (fileStat.isDirectory()) {
                        obj[fileName] = {}
                        let files = fs.readdirSync(filePath)
                        for (let file of files) {
                            doStuff(path.join(filePath, file), file, obj[fileName])
                        }
                    } else {
                        obj[fileName] = fs.readFileSync(filePath, 'utf8')
                    }
                }
                let filePathh = path.join(this.appDataPath, file)
                doStuff(filePathh, file, this.files)
            }


        } catch (e) {
            console.error('Error getting files from appdata', e)
        }
    }
    save(where, fileName, data) {
        let filePath = path.join(this.appDataPath, where, fileName)
        if (typeof data === 'object') {
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            }
            for (let file in data) {
                this.save(path.join(where, fileName), file, data[file])
            }
        } else {
            fs.writeFileSync(filePath, data)
        }
        this.load()
    }
    append(where, fileName, data) {
        let filePath = path.join(this.appDataPath, where, fileName)
        if (fs.existsSync(filePath)) {
            fs.appendFileSync(filePath, data)
        }else {
            fs.writeFileSync(filePath, data)
        }
        this.load()
    }
    get(where, fileName) {
        let filePath = path.join(this.appDataPath, where, fileName)
        if (fs.existsSync(filePath))
            return fs.readFileSync(filePath, 'utf8')
        return null
    }
    delete(where, fileName) {
        let filePath = path.join(this.appDataPath, where, fileName)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        this.load()
    }

}

module.exports = AppData