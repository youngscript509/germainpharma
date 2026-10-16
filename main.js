const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server.js'); // Importer le serveur Express

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.ico') // Utilisation de l'icône
    });

    // Charger l'index HTML de l'application
    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    // Ouvrir la console de développement (décommenter pour déboguer)
    // mainWindow.webContents.openDevTools();
}

// Démarrage du serveur Express et de la fenêtre Electron
app.whenReady().then(() => {
    // Démarrer le serveur Express sur le port 3000
    expressApp.listen(3000, () => {
        console.log('Serveur Express démarré sur le port 3000');
    });

    createWindow();

    // Gérer l'activation de l'application (macOS)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fermer l'application lorsque toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});