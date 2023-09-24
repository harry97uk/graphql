import fs from "fs";
import path from "path"

export function serveScripts(res) {
    const jsPath = path.join(process.cwd(), 'scripts', 'user-page.js')
    fs.readFile(jsPath, function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(500);
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
}