var MONSTERS = [
{
	"name": "Aboleth",
	"size": "L",
	"type": "aberration",
	"source": "monster manual",
	"alignment": "lawful evil",
	"ac": "17 (natural armor)",
	"hp": "135 (18d10+36)",
	"speed": "10 ft., swim 40 ft.",
	"str": "21",
	"dex": "9",
	"con": "15",
	"int": "18",
	"wis": "15",
	"cha": "18",
	"save": "Con +6, Int +8, Wis +6",
	"skill": "History +12, Perception +10",
	"senses": "darkvision 120 ft.",
	"passive": "20",
	"languages": "Deep Speech, telepathy 120 ft.",
	"cr": "10",
	"trait": [
	{
		"name": "Amphibious",
		"text": ["The aboleth can breathe air and water."]
	},
	{
		"name": "Mucous Cloud",
		"text": ["While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 ft. of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater."]
	},
	{
		"name": "Probing Telepathy",
		"text": ["If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires if the aboleth can see the creature."]
	}],
	"action": [
	{
		"name": "Multiattack",
		"text": ["The aboleth makes three tentacle attacks."]
	},
	{
		"name": "Tentacle",
		"text": ["Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed."],
		"attack": ["Tentacle|9|2d6+5"]
	},
	{
		"name": "Tail",
		"text": ["Melee Weapon Attack: +9 to hit, reach 10 ft. one target. Hit: 15 (3d6 + 5) bludgeoning damage."],
		"attack": ["Tail|9|3d6+5"]
	},
	{
		"name": "Enslave (3/day)",
		"text": ["The aboleth targets one creature it can see within 30 ft. of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth's control and can't take reactions, and the aboleth and the target can communicate telepathically with each other over any distance.", "Whenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth."]
	}],
	"legendary": [
	{
		"name": "Detect",
		"text": ["The aboleth makes a Wisdom (Perception) check."]
	},
	{
		"name": "Tail Swipe",
		"text": ["The aboleth makes one tail attack."]
	},
	{
		"name": "Psychic Drain (Costs 2 Actions)",
		"text": ["One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes."]
	}]
}
];