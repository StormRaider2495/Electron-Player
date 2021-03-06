# Music Player using Electron

This project is an application skeleton for a typical [Electron](http://electron.atom.io/) desktop app.
You can use it to quickly create your electron music player.

## Getting Started

To get you started you can simply clone the Music Player repository and install the dependencies:

### Prerequisites

You need git to clone the angular-seed repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test electron. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone Music Player

Clone the angular-seed repository using:

```
git clone https://github.com/StormRaider2495/Electron-Player.git
cd Electron-Player
```

You will have to install npm dependencies:

```
npm install
```
This will install the npm dependencies like Electron Prebuilt and Electron Packager.
Once this is complete, you can install the bower dependencies. You can get bower from
[https://bower.io/](https://bower.io/).

```
cd app
bower install
```
This will install the bower dependencies like Angular, Bootstrap etc.
And you are good to go!!!

The app uses the awesome [Howler.js](https://howlerjs.com/) library for the sound controls.
To run the application...

```
cd ../
npm run start
```
This will start the electron app and you should be seeing the Music Player.
You can select the folder containing your mp3 files by using the shortcut keys (Cmd or Ctrl + o) or have a look at the native menus where Open Folder should be under Sound Control tab.

```
npm run package
or
npm run packacge-win
```
This will create a release version of the application as a desktop app.
