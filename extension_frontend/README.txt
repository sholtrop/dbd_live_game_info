[Changelog v0.0.2]
VideoOverlay:
- Is now completely hidden unless the user has their cursor hovering over the stream.
- When hovering, is initially only a small icon on the bottom-right, which can be clicked to expand into the full panel.
- User can pin the panel (preventing drag and causing the panel to no longer auto-hide) by clicking the pin icon on the right
- Game-related data from the backend now comes from a different, more reliable source. It is now complete and more accurate. 
  Parsing logic in the frontend has been overhauled to work with this new data source. 
  There are therefore slight visual changes to the description of perks/addons.
- Image assets are no longer included in the frontend, but are hosted on Cloudinary. 
  This means that I will not have to release a new version of this extension every time Dead by Daylight updates with new perks/addons.
  (Which happened pretty much immediately after v0.0.1 was approved)

Config:
- Improved UX by adding a loading indicator to options that require OAuth, signalling that their OAuth status is being retrieved from the backend.

VideoComponent:
- Removed completely, as it was included erroneously in version v0.0.1. The extension currently does not work as a video component.


[Changelog v0.0.1]
First version - Please read everything below.

[What does it do?]
This extension applies only to the asymmetric multiplayer game Dead by Daylight. 
When playing Dead by Daylight, you will have perks and addons (which I'll refer to as a 'build' from here on) equipped. 
In the in-game interface, these are only indicated by their icon. This is inconvenient for people who are new to the game and don't know the perks, 
or those who haven't kept up with the latest perks. You will often see viewers asking in chat "What is the perk on the bottom-right?", after which they'll have
to consult the wiki for information on what the perk/addon does.
This extension resolves this by allowing the broadcaster or (some of) their moderators to set the build that is being used. 
A viewer can then open the extension and read detailed information about the build that the broadcaster is using, which corresponds exactly to the in-game information. 
All of this is updated in real-time.

[Technical Info]
The frontend is a React + TypeScript app. The backend is Python + Flask and SocketIO. 
I use web sockets extensively to communicate with the frontend in real time.
The backend (of course) verifies that someone who is attempting to set the build is a moderator/broadcaster.

[Steps for Testing the Extension]
1) - Installing the extension
Configuration is NOT necessary, but deprives you of two features:
  1. Displaying your select name in the extension (not very important)
  2. Allowing all (or a selection of) your moderators to use the extension to set your perks/addons.
To allow for 2), the installer must authorize the extension through OAuth (Just to get the moderator information).
You can decide to allow all of your moderators to set a build, or just a selection of your moderators. If you don't configure
the extension, only you (the broadcaster) can set the build. The extension should be set as an Overlay.

2) - Using the extension as a broadcaster.
You can go to the Stream Manager and click DbD Live Game Info. From here you can select:

1. Mode. Either Killer, Survivor or Not Playing.
2. Perks. Available if Mode is Survivor or Killer. Clicking an empty perk opens a modal that allows you to enter text to search for a perk by name. You can scroll through the list of (still) available perks. You can also set a perk's rank (1, 2 or 3).
3. Killer Name. Available only if Mode is Killer. You can search for a killer name by entering text, and scroll through the killer name list.
4. Addons. Available only if Mode is Killer. Killer Name has to have been set. Procedure is the same as setting a perk, except that addons don't have a rank.
5. The button bar on the bottom:

- 'Publish' will send the composed build to the backend, which will store it and distribute it to every client watching this stream via a websocket event. 
'Publish' is the only way to propagate a change. If a perk/addon is empty, clicking 'Publish' will issue a warning, which you can ignore by clicking again. 
(It's not impossible for perks/addons to be empty, but extremely unlikely).
- 'Restore' will reset the build you're making to the one that's currently live, erasing all your local changes.
- 'Clear' will empty all the perks/addons of the build you're making, erasing all your local changes.

3) - Using the extension as a moderator
If in 1) the broadcaster set the configuration to either allow all moderators, or certain moderators (and you are one of those moderators), 
you can also set builds using a moderator account. Go to the (live) channel that you are a moderator of that has the extension installed.
Once you open the extension, you can click on the Identity tab and share your userID with the extension. After you've done this, the Build tab will appear instead of the Identity tab.
When you go to the build tab, you will see a similar interface to that in 2). It functions exactly the same. 
From here, you as a moderator will have the same level of control over the build as the broadcaster.

STEP 4 - Using the extension as a normal viewer
Go to the (live) channel that has the extension installed. 
Open the extension. You should be able to view any build and its associated information set by a broadcaster in 2) or
a moderator in 3). You switch between the information by clicking the perk/addon.
You can verify that the perk information displayed by the extension is equivalent to that on the wiki:
https://deadbydaylight.gamepedia.com/Perks#Survivor_Perks_.2883.29
Clicking the x in the top left corner will minimize the extension.
