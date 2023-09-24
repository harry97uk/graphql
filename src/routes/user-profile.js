import fs from "fs";
import path from 'path';

export function serveUserProfile(res, userData) {
    // Serve the HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'user.html');
    fs.readFile(htmlPath, (err, data) => {
        if (err) {
            console.error(err);
            res.writeHead(500);
            res.end();
            return;
        }
        // Replace the placeholder with the dynamic data
        const dynamicData = userData;
        const responseHtml = data.toString().replace('{{placeholder}}', dynamicData);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(responseHtml);
    });
}