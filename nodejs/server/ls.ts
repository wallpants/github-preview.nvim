import fs from "node:fs";

// Replace 'your/path' with the actual path you want to list
const directoryPath = "your/path";

// List files and directories in the specified path
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }

    // Loop through the list of files and directories
    files.forEach((file) => {
        // Check if it's a file or directory
        fs.stat(`${directoryPath}/${file}`, (err, stats) => {
            if (err) {
                console.error("Error getting file/directory stats:", err);
                return;
            }

            if (stats.isDirectory()) {
                console.log(`Directory: ${file}`);
            } else if (stats.isFile()) {
                console.log(`File: ${file}`);
            }
        });
    });
});
