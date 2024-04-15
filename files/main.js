let cwd = '~';

function prompt() {
    return `${cwd}$ `;   
}

const term = $('body').terminal({
    cd(dir) {
        cwd = dir;
    }
}, {
    prompt
});

term.exec('cd ~/directory');

github('jcubic/jquery.terminal');