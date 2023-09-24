import fs from "fs";
import path from "path"

export function serveStyles(res, url) {
    const jsPath = path.join(process.cwd(), 'styles', url.split("/")[2])
    fs.readFile(jsPath, function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(500);
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
}