# VirtualDMScreen
A simple browser interface for running tabletop RPG games (specifically 5e)

##Demo
https://kcaf.github.io/VirtualDMScreen/

##Usage
- This is by no means a finished product. Please keep that in mind.
- The data files are incomplete for legal reasons. One day I'll get around to incorporating the full 5e SRD.
- All information, other than images, is saved locally via localStorage.  
- Browser support for this tool varies. I've tested extensively in Chrome and Firefox. If you're on a PC, you're probably using one of these anyway. If not, use at your own risk.  
- There is an extra file called `map.html`. You can open this file in another browser window and on your primary window click `Combat` > `Settings` > `Map Viewer` to begin streaming the battlemap in real time.

##Preview
![alt text](https://i.imgur.com/9leuIOF.jpg "VirtualDMScreen")

##Combat
- Calculate HP on the fly with + or -
- Automatic initiative ordering
- Fade and mark dead combatants instantly at 0 HP
- Add maps via [image url](https://reddit.com/r/battlemaps)
- Simply battlemap panning and zoom
- Right click and drag to view distance
- Double click a NPC to view stat block
- Open a second browser window to `map.html` and check `Map Viewer` in the settings to start streaming the battle map to a second monitor or screen-sharing software
- Turn a combatant invisible and they won't show up on the Map Viewer stream
- Cast your players into darkness with one click (expanding on this in the future)
- [TODO] Store map and token images locally for offline play

##Dice
- Automatically calculate dice roll sets "3d10 + 3d6 + 12"
- Save previous rolls for quick use later

##Loot
- Search for and view loot details by Name and Rarity
- [TODO] Generate individual and hoard loot
- [TODO] Group previously found items for quick access later

##Multi-Game
- Have more than one ongoing game you want to track? Create a new one and swap back at any time

##NPCs
- Search and view NPC stat blocks and abilities by Name, Type, and CR
- Group NPCs with auto calculating encounter difficulty
- One-click add entire groups or singular NPCs to combat
- Automatically roll hp and initiative for NPCs
- [TODO] Generate your own NPCs

##Players
- Keep track of players' Passive Perception, AC, and Level
- One-click add all players to combat

##Spells
- Search and view spells by Name, Level, and Class
- Group spells into Spellbooks for reference
- Keep track of spell slots used for each book

##Customizing
- Have your own data files? Press `F12` to open the developer console and simply redeclare the arrays there  
Names for each data array are: `MAGIC`, `MONSTERS`, `SPELLS`

##Misc
- [TODO] Add touch events for mobile play
- [TODO] Set up github static hosting
- [TODO] Create a clean way to import custom data files
- [TODO] Clean up messy code
- [TODO] Write better CSS. Ugh.
- [TODO] [Possibly remove KnockoutJS](https://www.youtube.com/watch?v=MH7KYmGnj40)
- [TODO] Extend browser support

##Licensing
- VirtualDMScreen is published under the [MIT license](https://opensource.org/licenses/MIT)
- Some content used as part of the [Open Gaming License (OGL)](http://dnd.wizards.com/articles/features/systems-reference-document-srd)
- Mapping made possible by [LeafletJS](http://leafletjs.com) <-- flippin amazing