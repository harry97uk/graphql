import fs from "fs";
import path from 'path';

export function serveLoginPage(res, failed) {
    // Serve the HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'login-page.html');
    fs.readFile(htmlPath, (err, data) => {
        if (err) {
            console.error(err);
            res.writeHead(500);
            res.end();
            return;
        }

        let responseHtml = data
        
        if (failed) {
            const failedData = `<div style="color: red;">Incorrect username or password!</div>`
            responseHtml = data.toString().replace('<div style="visibility: hidden;"></div>', failedData);
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(responseHtml);
    });
}