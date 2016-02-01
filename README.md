# autodealio_node

a [Sails](http://sailsjs.org) application

# Install Nodejs
* https://nodejs.org/
* https://nodejs.org/documentation/

# Install NPM Packages
If you have installed nodejs according to the documentation above then you should also have installed Node Package Manager, aka npm. Npm is a command-line utility that lets you install packages quickly and easily from remote repositories. This codebase is built on [Sails.js](http://sailsjs.org/#!/getStarted) and depends on several other third-party modules.
Since the modules have all been added as dependencies in package.json which is used to tell npm which packages to grab, you should be able to get the app running with a simple npm install.
*note:*  Windows users omit the sudo and make sure you are running the console as Administrator for the following command(s).

	sudo npm install

This is the current package.json which is running on my Mac as of this writing.

	  "dependencies": {
      "ejs": "~0.8.4",
      "es": "^0.5.1",
      "grunt": "0.4.2",
      "grunt-contrib-clean": "~0.5.0",
      "grunt-contrib-coffee": "~0.10.1",
      "grunt-contrib-concat": "~0.3.0",
      "grunt-contrib-copy": "~0.5.0",
      "grunt-contrib-cssmin": "~0.9.0",
      "grunt-contrib-jst": "~0.6.0",
      "grunt-contrib-less": "0.11.1",
      "grunt-contrib-uglify": "~0.4.0",
      "grunt-contrib-watch": "~0.5.3",
      "grunt-sails-linker": "~0.9.5",
      "grunt-sync": "~0.0.4",
      "include-all": "~0.1.3",
      "lodash": "^4.1.0",
      "moment": "^2.11.1",
      "rc": "~0.5.0",
      "sails": "~0.10.5",
      "sails-disk": "~0.10.0",
      "soap": "^0.11.4"
    },


*On Windows:* If you get a strange error on npm install you need to create a directory as shown below.

	C:\Users\Aaron\Documents\Projects\other\autodealio\git\nodejs>npm install
	Error: ENOENT, stat 'C:\Users\Aaron\AppData\Roaming\npm'

That means you need to create the directory shown, as seen here: https://github.com/npm/npm/wiki/Troubleshooting#error-enoent-stat-cusersuserappdataroamingnpm-on-windows-7

More info about installing sails: https://github.com/balderdashy/sails-docs/blob/master/getting-started/getting-started.md

# Start Project
You can run the site by just lifting sails:

	C:\Users\Aaron\Documents\Projects\other\autodealio\git\nodejs>sails lift

	info: Starting app...

	info:
	info:
	info:    Sails              <|
	info:    v0.10.5             |\
	info:                       /|.\
	info:                      / || \
	info:                    ,'  |'  \
	info:                 .-'.-==|/_--'
	info:                 `--'-------'
	info:    __---___--___---___--___---___--___
	info:  ____---___--___---___--___---___--___-__
	info:
	info: Server lifted in `C:\Users\Aaron\Documents\Projects\other\autodealio\git\nodejs`
	info: To see your app, visit http://autodealio.com/inventory
	info: To shut down Sails, press <CTRL> + C at any time.

	debug: --------------------------------------------------------
	debug: :: Tue Jun 02 2015 21:05:19 GMT-0700 (Pacific Daylight Time)

	debug: Environment : development
	debug: Host        : autodealio.com/inventory
	debug: Port        : 1337
	debug: --------------------------------------------------------

# Test
If sails starts up correctly you should then be able to see the site at http://localhost:1337/.
