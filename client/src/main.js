'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
var ipc = require('ipc');
const remote = require('electron').remote;
const ssdp = require('node-ssdp').Client;
const client =  new ssdp({
//    unicastHost: '192.168.11.63'
  });
var baseApiUrl;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var handleStartupEvent = function() {
  if (process.platform !== 'win32') {
    return false;
  }
 
  var squirrelCommand = process.argv[1];
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
 
      // Optionally do things such as: 
      // 
      // - Install desktop and start menu shortcuts 
      // - Add your .exe to the PATH 
      // - Write to the registry for things like file associations and 
      //   explorer context menus 
 
      // Always quit when done 
      app.quit();
 
      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and 
      // --squirrel-updated handlers 
 
      // Always quit when done 
      app.quit();
 
      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before 
      // we update to the new version - it's the opposite of 
      // --squirrel-updated 
      app.quit();
      return true;
  }
};
 
if (handleStartupEvent()) {
  return;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  
  // Create the browser window.
  mainWindow = new BrowserWindow({height: 1200, width: 1200, minHeight: 800, minWidth: 1200, autoHideMenuBar: false });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  
  ipc.on('request-api-url', function(event, arg) {
    event.sender.send('api-url', baseApiUrl);
  });
  
  mainWindow.webContents.on('did-finish-load', function() {     
    client.on('notify', function () {})
    client.on('response', function inResponse(headers, code, rinfo) {
      //console.log('Got a response to an m-search:\n%d\n%s\n%s', code, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '))
      baseApiUrl = 'http://' + rinfo.address + ':3000' + '/';
      mainWindow.webContents.send('updateJsmcUrl', baseApiUrl);
      mainWindow.webContents.send('data-loaded');
    })

    client.search('urn:schemas-upnp-org:device:MediaServer:1')
  });
});