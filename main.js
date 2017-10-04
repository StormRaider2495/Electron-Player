var fileNumber = 0;
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const {
    Menu,
    globalShortcut
} = require('electron');
const fs = require('fs');
require('electron-reload')(__dirname);

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        transparent: true,
        // frame: false,
        width: 612,
        height: 384,
        maxWidth: 800,
        maxHeight: 450,
        show: false,
        backgroundColor: '#312450',
        icon: __dirname + '/ico/music_logo_01.png'
    })
    // ,frame: false})
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    //Comment this out when development is done
    // mainWindow.webContents.openDevTools();

    mainWindow.setResizable(true)

    mainWindow.once('ready-to-show', function() {
        mainWindow.show()
    });

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    var template = [{},
        {
            label: 'Sound Control',
            submenu: [{
                label: 'Select Folder',
                accelerator: 'CommandOrControl+O',
                click: function() {
                    openFolderDialog();
                }
            }, {
                label: 'Select File(s)',
                accelerator: 'CommandOrControl+F',
                click: function() {
                    openFileDialog();
                }
            }, {
                label: 'Song Control',
                submenu: [{
                    label: 'Pause',
                    accelerator: 'CommandOrControl+E',
                    click: function() {
                        sendPauseSongMessage();
                    }
                }, {
                    label: 'Next',
                    accelerator: 'CommandOrControl+N',
                    click: function() {
                        sendNextSongMessage();
                    }
                }, {
                    label: 'Previous',
                    accelerator: 'CommandOrControl+P',
                    click: function() {
                        sendNextSongMessage();
                    }
                }]
            }]
        }
    ];

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu);

    // globalShortcut.register('CommandOrControl+P', function(){
    //   openFolderDialog();
    // });
});

function sendPauseSongMessage() {
    mainWindow.webContents.send('modal-pause-song', 'playPause');
}

function sendNextSongMessage() {
    mainWindow.webContents.send('modal-next-song', 'next');
}

function sendPrevSongMessage() {
    mainWindow.webContents.send('modal-prev-song', 'prev');
}

function openFolderDialog() {
    var dialog = electron.dialog;
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }, function(filePath) {
        if (filePath) {
            fs.readdir(filePath[0], function(err, files) {
                var arr = [];
                for (var i = 0; i < files.length; i++) {
                    if (files[i].substr(-4) === ".mp3") {
                        arr.push(files[i]);
                    }
                }
                var objToSend = {};
                objToSend.path = filePath[0];
                objToSend.files = arr;
                mainWindow.webContents.send('modal-folder-content', objToSend);
            });
        }
    });
}

function openFileDialog() {
    var dialog = electron.dialog;
    dialog.showOpenDialog({
        filters: [{
            name: '.mp3',
            extensions: ['mp3']
        }]
    }, function(fileNames) {
        if (fileNames === undefined) {
            alert("No file selected");
        } else {
            // console.log("in else " + fileNames);
            fs.readdir(fileNames[0], function(err, files) {
                var fileNameArr = [],
                    filePathArr = [];
                filePathArr.push(fileNames[0]);
                fileNameArr.push(" ");
                var objToSend = {};
                objToSend.path = filePathArr;
                objToSend.files = fileNameArr;
                // console.log(objToSend.path);
                // console.log(objToSend.files);
                mainWindow.webContents.send('modal-folder-content', objToSend);
            });
        }
    });
}
