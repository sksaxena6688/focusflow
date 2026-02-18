const { app, BrowserWindow } = require("electron");

let win;

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    win.loadURL("http://localhost:3000");
});
