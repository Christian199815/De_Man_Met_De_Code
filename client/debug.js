export function log(filename, show, ...args) {
    if (show) console.log(`[${filename}]`, ...args);
}