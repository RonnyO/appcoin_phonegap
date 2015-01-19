
Directory Contents

  hooks: scripts to be run during build process
  platforms: platform specific generated files
  plugins: installed plugins
  www: our phonegap entry point directory, containing the phonegap market preloader materials

Adding/Removing platform

  cordova platform add ios
  cordova platform remove ios

  Notes: plugins automatically installed during platform add, so not sure why need 010_install_plugins.js hook (TODO)

Building all

  cordova build

Building for iOS

  cordova build ios

Running on iOS emulator (also builds)

  cordova emulate ios

Build/Run for target:

  TARGET=local cordova emulate ios
  TARGET=local cordova build ios

Installing Facebook plugin

  There is some issue with installing from plugin directory so need to download copy of phonegap-facebook-plugin repo and something like:
  cordova -d plugin add ./phonegap-facebook-plugin-master --variable APP_ID="139398209567366" --variable APP_NAME="Appcoin Test"

Debugging - Emulators:

  For emulators Mac/iOS & Chrome&Android provide similar "inspector" tools.
  Debugger starts "fresh" each time (forgets breakpoints), to overcome this we can show an alert stopping execution while we set breakpoints.

Debugging - iOS - javascript log from device on XCode
  http://robandlauren.com/2014/01/16/console-logging-phonegap/

Creating Ad-Hoc build in XCode

    0) Open XCode project in phonegap/platforms/ios (SEE BELOW FOR WHY TO DUPLICATE DIRECTORY FIRST)
    1) Make an archive (Product->Archive, available when target is device)
    2) Window->Organizer, see recently created archive, export to Ad-hoc to create ipa file

Issues - XCode doing something wierd to file system

  After opening xcode project, command line will fail with permission error:    
    localhost:phonegap yotamshacham$ TARGET=local cordova emulate ios
    cp: copyFileSync: could not write to dest file (code=ENOENT):/Volumes/WORK/appcoin_main/client/market/phonegap/platforms/ios/._MarketTest/config.xml
  Solutions:
  - recreate entire directory under phonegap/platforms/ios
  - dupliate phonegap/platforms/ios to another directory and work on it from there
  (TODO - figure out the cause, looks like something with Mac hidden files)

Issues - Make sure XCode is synced to apple developer member center

    After making changes in the apple developer member center won't be reflected automatically in your XCode.
    To refresh provisioning profiles in Xcode
      In the Xcode Preferences window, click Accounts.
      Select your team, and click View Details.
      In the dialog that appears, click the Refresh button in the lower-left corner under the Provisioning Profiles table.
      Xcode updates the list of profiles in the Provisioning Profiles table.