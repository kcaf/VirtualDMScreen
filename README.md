# VirtualDMScreen
A simple browser interface for running D&D 5e games

##Demo
http://virtualdmscreen.us

##Usage
- This is by no means a finished product. Please keep that in mind.
- The data files are incomplete for legal reasons. One day I'll get around to incorporating the full 5e SRD.
- All information, other than images, is saved locally via localStorage.  
- Browser support for this tool varies. I've tested extensively in Chrome and suggest using that for the Alpha build.
- There are two extra files: `remote.html` and `local.html`. These are the various "Client" Map Viewers. Use `local.html` if the VirtualDMScreen is on the same computer and `remote.html` if it's streamed from another computer over the Internet or local network.

##Preview
![alt text](https://i.imgur.com/9leuIOF.jpg "VirtualDMScreen")

##Combat
- Quickly calculate HP on the fly with + or -
- Automatic initiative ordering
- Combatants with 0 hp are instantly faded out and marked as dead
- You can add maps via [image url](https://reddit.com/r/battlemaps). In the future, offline support will be extended for local map libraries.
- You can pan and zoom the battlemap thanks to LeafletJS.
- Right click and drag to view distance
- Double click a NPC to view stat block
- Local and remote map streaming with `local.html` and `remote.html`
- Make a combatant hidden and they won't show up on the stream. All NPCs start off as hidden for better DM control.
- Lighting effects with `Darkness` setting.
- `Fog of War` for added DM control.

##Combat Streaming
The Battlemap can be streamed to create a better PC experience. The players will only see the map and nothing else. Streaming can be either local or remote:
- **Local**: If the client exists on the same computer as VirtulDMScreen, then use the `local.html` file. One use case would be a second monitor or TV showing the new chrome window opened to local.html.
- **Remote**: If the client exists on another computer accessed over the Internet or local network, use the `remote.html` file. A key will be shown once PeerJS is created. This key needs to be used by the client to connect to the right stream. Making the connection make take several attempts. It's very hit and miss. I recommend using xirsys.com in production for better results.

##Combat Darkness/Light
This is an ongoing, experimental feature. If it works, great. If not, I'm sorry =(. There is a lot I have planned for this, so stayed tuned.

##Combat Fog of War
This is another very experimental feature. I don't believe I've implemented this to my liking and will have another go at it soon. Any ideas are welcome!

##Dice
- The dice roller can automatically calculate entire dice rolling sets. For example: 3d10 + 3d6 + 12
- Unique dice sets will be saved for later use.

##Loot
- Search for and view loot details by Name and Rarity

##Multi-Game
- You can track multiple games through the `Game` window and quickly switch between them.

##NPCs
- Search and view NPC stat blocks and abilities by Name, Type, and CR
- You can add NPCs to groups for easier management.
- NPC groups will display a difficulty rating of that group versus your PCs.
- You can add an entire NPC group to combat at once.
- NPCs' hp and initiative are automatically rolled based on their stat blocks.

##Players
- Keep track of players' Passive Perception, AC, and Level
- You can send all PCs to combat at once.

##Spells
- Search and view spells by Name, Level, and Class
- Group spells into Spellbooks for reference
- Keep track of spell slots used for each Spellbook

##Customizing
- Have your own data files? Press `F12` to open the developer console and simply redeclare the arrays there  
Names for each data array are: `MAGIC`, `MONSTERS`, `SPELLS`. In the future, this will be expanded for a cleaner override and import of custom data files to allow for homebrewing.

##TODO
- Further optimize map streaming.
- NPC generation.
- Loot generation.
- Add local map/token support.
- Improve mobile experience.
- Better multi-game hotswap.
- Order of operations on dice rolls.
- Extend darkness/light support. Ray tracing possibly.
- Custom map creation.
- Create a clean way to import custom data files.
- Clean up messy code. Ongoing.
- Refactor WORKSPACE object.
- Write better CSS. Ugh.
- [Possibly remove KnockoutJS](https://www.youtube.com/watch?v=MH7KYmGnj40)?
- Extend browser support.

##License
- VirtualDMScreen is licensed under the [MIT license](https://opensource.org/licenses/MIT).
- Some content used as part of the [Open Gaming License (OGL)](http://dnd.wizards.com/articles/features/systems-reference-document-srd).
- Mapping made possible by [LeafletJS](http://leafletjs.com).
- Remote streaming with [PeerJS](http://peerjs.com).