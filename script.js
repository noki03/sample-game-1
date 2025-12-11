// --- 1. GAME STATE MANAGEMENT ---

const player = {
    name: "Hero",
    level: 1,
    maxHP: 100,
    currentHP: 100,
    attackPower: 10,
    currentXP: 0,
    xpNeeded: 200 // Initial value calculated by the formula
};

const monsters = {
    A: { name: "Slime", hp: 30, attack: 5, xpReward: 50 },      // Weak
    B: { name: "Goblin", hp: 60, attack: 10, xpReward: 100 },   // Medium
    C: { name: "Ogre Boss", hp: 150, attack: 20, xpReward: 300 } // Strong/Boss
};

// --- 2. DOM UTILITY FUNCTIONS ---

const logElement = document.getElementById('combat-log');

/**
 * Adds a message to the combat log and scrolls to the bottom.
 * @param {string} message The message to display.
 * @param {boolean} isImportant If true, uses a different style for emphasis.
 */
function log(message, isImportant = false) {
    const timeStamp = new Date().toLocaleTimeString();
    const formattedMessage = (isImportant ? `>>> **${message}**` : `- ${message}`);

    // Using simple text formatting for the log
    logElement.innerHTML += `\n[${timeStamp}] ${formattedMessage}`;
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll
}

/**
 * Updates the Player Status section in the UI.
 */
function updatePlayerStats() {
    document.getElementById('player-level').textContent = player.level;
    document.getElementById('player-max-hp').textContent = player.maxHP;
    document.getElementById('player-current-hp').textContent = player.currentHP;
    document.getElementById('player-attack').textContent = player.attackPower;
    document.getElementById('player-current-xp').textContent = player.currentXP;
    document.getElementById('player-xp-needed').textContent = player.xpNeeded;

    // Update HP Bar
    const hpPercent = (player.currentHP / player.maxHP) * 100;
    document.getElementById('hp-bar').style.width = `${hpPercent.toFixed(0)}%`;

    // Update XP Bar (Handle potential division by zero if xpNeeded is 0, which shouldn't happen)
    const xpPercent = (player.currentXP / player.xpNeeded) * 100;
    document.getElementById('xp-bar').style.width = `${Math.min(xpPercent, 100).toFixed(0)}%`; // Cap at 100%
}

/**
 * Clears the LEVEL UP notification after the animation is done.
 */
function hideLevelUpNotification() {
    const notification = document.getElementById('level-up-notification');
    notification.classList.add('hidden');
    notification.classList.remove('active');
}


// --- 3. LEVELING MECHANIC (CORE LOGIC) ---

/**
 * Calculates the XP needed for the player's next level.
 * Formula: (Level + 1) * 50 + 100
 * @param {number} level The current level.
 * @returns {number} The XP required for the next level.
 */
function calculateXPNeeded(level) {
    return (level + 1) * 50 + 100;
}

/**
 * Checks if the player has enough XP to level up, and performs the level-up process.
 */
function checkLevelUp() {
    while (player.currentXP >= player.xpNeeded) {
        // 1. Level Up
        player.level += 1;

        // 2. Reset XP (Carry over the remainder)
        player.currentXP -= player.xpNeeded;

        // 3. Stat Increase (Hardcoded increase)
        player.maxHP += 10;
        player.attackPower += 2;
        player.currentHP = player.maxHP; // Heal on level up

        // 4. XP Scaling (Calculate new XP Needed)
        player.xpNeeded = calculateXPNeeded(player.level);

        // 5. Notification
        log(`LEVEL UP! Hero is now Level ${player.level}!`, true);
        log(`Max HP +10, Attack Power +2.`);

        // Show UI notification
        const notification = document.getElementById('level-up-notification');
        notification.classList.remove('hidden');
        notification.classList.add('active');
        // Restart the animation by forcing a reflow (trick to make the fadeOut animation run again)
        void notification.offsetWidth;

        // Hide it after the animation duration (3000ms from CSS)
        setTimeout(hideLevelUpNotification, 3000);
    }
}


// --- 4. COMBAT LOGIC ---

/**
 * Simulates a turn-based combat loop.
 * @param {string} monsterId The ID of the monster to fight (A, B, or C).
 */
function startCombat(monsterId) {
    const monsterTemplate = monsters[monsterId];
    // Create a new, temporary monster object for the fight
    let monster = { ...monsterTemplate, currentHP: monsterTemplate.hp };
    const monsterName = monster.name;

    if (player.currentHP <= 0) {
        log("Hero is defeated and cannot fight! Use the 'Full Heal' button.");
        return;
    }

    log(`*** Hero encounters a ${monsterName}! Combat begins! ***`, true);

    // Simple turn-based loop (in reality, this would be a sequence of events)
    let turns = 0;
    while (player.currentHP > 0 && monster.currentHP > 0 && turns < 50) {
        turns++;

        // PLAYER'S TURN
        const playerDamage = player.attackPower;
        monster.currentHP -= playerDamage;
        log(`Hero attacks ${monsterName} for ${playerDamage} damage. (${monster.currentHP}/${monster.hp})`);

        if (monster.currentHP <= 0) {
            log(`*** ${monsterName} is defeated! ***`, true);
            player.currentXP += monster.xpReward;
            log(`Hero gains ${monster.xpReward} XP.`);
            break;
        }

        // MONSTER'S TURN
        const monsterDamage = monster.attack;
        player.currentHP -= monsterDamage;
        // Clamp HP so it doesn't go below zero for display
        player.currentHP = Math.max(0, player.currentHP);
        log(`${monsterName} attacks Hero for ${monsterDamage} damage. (${player.currentHP}/${player.maxHP})`);

        if (player.currentHP <= 0) {
            log(`*** Hero has been defeated by the ${monsterName}! ***`, true);
            break;
        }
    }

    // After combat, check status and update UI
    checkLevelUp();
    updatePlayerStats();
}


// --- 5. INITIALIZATION & EVENT LISTENERS ---

/**
 * Initializes the game.
 */
function initGame() {
    // 1. Set initial XP Needed (important for display)
    player.xpNeeded = calculateXPNeeded(player.level);
    updatePlayerStats();

    // 2. Combat Buttons Listener
    document.querySelectorAll('.combat-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const monsterId = event.target.dataset.monster;
            startCombat(monsterId);
        });
    });

    // 3. Heal Button Listener
    document.getElementById('heal-button').addEventListener('click', () => {
        player.currentHP = player.maxHP;
        updatePlayerStats();
        log("Hero uses the Heal spell and is fully restored!", true);
    });
}

// Start the game when the script loads
initGame();