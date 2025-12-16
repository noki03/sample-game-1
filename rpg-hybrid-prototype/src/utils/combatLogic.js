export const calculateHit = (attacker, defender) => {
    // 1. Get Base Stats
    let atk = attacker.attack || 0;
    let def = defender.defense || 0;

    // 2. Add Equipment Bonuses (The Fix!)
    if (attacker.equipment) {
        if (attacker.equipment.weapon) atk += attacker.equipment.weapon.bonus;
    }
    if (defender.equipment) {
        if (defender.equipment.armor) def += defender.equipment.armor.bonus;
        // Note: Currently monsters don't have equipment, but player does
    }

    // 3. Crit Logic (5% Base + Dexterity/Luck factor could be added here)
    const isCrit = Math.random() < 0.1; // 10% flat crit chance for now
    if (isCrit) atk = Math.floor(atk * 1.5);

    // 4. Hit Chance (Based on Agility/Speed diff? Simplified for now)
    // Let's say 5% chance to miss
    const isMiss = Math.random() < 0.05;
    if (isMiss) return { isMiss: true, isCrit: false, damage: 0 };

    // 5. Damage Calculation
    // Simple Subtraction, but ensure at least 1 damage
    let damage = atk - def;

    // Variance (+/- 10%)
    const variance = (Math.random() * 0.2) + 0.9;
    damage = Math.floor(damage * variance);

    if (damage < 1) damage = 1; // Always deal at least 1 damage

    return { isMiss: false, isCrit, damage };
};

export const processLevelUp = (player, xpGain) => {
    let newXp = player.xp + xpGain;
    let newLevel = player.level;
    let newMaxHp = player.maxHp;
    let newAttack = player.attack;
    let newDefense = player.defense;
    let leveledUp = false;

    // Loop in case of multiple levels at once (killing a boss)
    while (newXp >= player.nextLevelXp) {
        newXp -= player.nextLevelXp;
        newLevel++;
        leveledUp = true;

        // Stat Growth
        newMaxHp += 10 + Math.floor(newLevel * 2);
        newAttack += 2;
        newDefense += 1;

        // Increase XP req for next level
        player.nextLevelXp = Math.floor(player.nextLevelXp * 1.2);
    }

    return {
        leveledUp,
        level: newLevel,
        updatedStats: {
            xp: newXp,
            level: newLevel,
            maxHp: newMaxHp,
            hp: leveledUp ? newMaxHp : player.hp, // Full heal on level up? Or just current? Let's Full Heal.
            attack: newAttack,
            defense: newDefense,
            nextLevelXp: player.nextLevelXp
        }
    };
};