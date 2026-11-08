const fs = require('fs');
const { exec } = require('child_process');

function installMissingDependencies() {
    const packageJson = require('./package.json');
    const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
    };

    if (!fs.existsSync('node_modules')) {
        console.log('`node_modules` folder not found. Installing dependencies...');
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing npm install: ${stderr}`);
                return;
            }
            console.log('Dependencies installed successfully!');
        });
    } else {
        console.log('Checking for missing dependencies...');
        Object.keys(allDependencies).forEach((dep) => {
            try {
                require.resolve(dep);
                console.log(`${dep} is already installed.`);
            } catch (e) {
                console.log(`${dep} is missing. Installing...`);
                exec(`npm install ${dep}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error installing ${dep}: ${stderr}`);
                        return;
                    }
                    console.log(`${dep} installed successfully!`);
                });
            }
        });
    }
}

installMissingDependencies();