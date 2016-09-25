# VirtualDMScreen
A simple browser interface for DMing tabletop RPG games (specifically D&D 5th Edition)

##Demo
https://kcaf.github.io/VirtualDMScreen/

##Usage
Your information is saved locally via localStorage. Browser support varies. I've tested extensively in Chrome and Firefox. If you're on a PC, you're probably using one of these anyway. If not, use at your own risk.  
There is an extra file called `map.html`. You can open this file in another browser window and click `Combat > Settings > Stream Map View` on your main window to begin streaming the battlemap in real time.

##Preview
![alt text](http://i.imgur.com/9leuIOF.jpg "VirtualDMScreen")

##Combat
- Calculate HP on the fly with + or -
- Automatic initiative ordering
- Fade and mark dead combatants instantly at 0 HP
- Add maps via [image url](https://reddit.com/r/battlemaps)
- Simply battlemap panning and zoom
- Right click and drag to view distance
- Double click a NPC to view stat block
- Open a second browser window to "map.html" to share only the battlemap on your second monitor or screen-sharing software
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

##Misc
- [TODO] Add touch events for mobile play
- [TODO] Set up github static hosting
- [TODO] Allow users to import their own data files
- [TODO] Cleanup messy code
- [TODO] [Possibly remove KnockoutJS](https://www.youtube.com/watch?v=MH7KYmGnj40)
- [TODO] Extend browser support
