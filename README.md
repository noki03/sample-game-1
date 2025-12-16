
# Minimal RPG Prototype

## 🌟 Game Overview

The **Minimal RPG Prototype** is a compact, **speed-governed, grid-based RPG** developed using modern React Hooks. It serves as a proof-of-concept for stable core game mechanics, highly responsive input, and a clean, modular architecture.

The core objective is to explore randomly generated dungeons, engage in fast-paced combat, manage loot, and descend to new floors while improving your character.

---

## ⚔️ Core Gameplay Features

### 1. Dynamic Dungeon Exploration

* **Random Maps:** Each new floor features a unique, procedurally generated dungeon layout, maximizing replayability. 
* **Fog of War:** Undiscovered areas are masked by a Fog of War layer, rewarding strategic, thorough exploration of the environment.
* **Persistent Progress:** Your entire game state—including your map, position, and character stats—is saved automatically in the browser's database.

### 2. Speed-Governed Combat (Action-RPG Feel)

Combat is continuous and action-oriented, resembling classic Active Time Battle (ATB) systems:

* **Loot & Progression:** Defeating monsters grants experience and drops items (weapons, armor, consumables, and gold) vital for character improvement.
* **Healing & Management:** Players use healing abilities and items to actively manage their health during encounters.
* **Combat Log:** All critical events—attacks, hits, misses, and healing actions—are meticulously recorded in a detailed log.

### 3. Responsive Movement

* **Grid Movement:** All movement is tile-based, providing precise control across the dungeon grid.
* **Smooth Input:** The game supports highly responsive **continuous movement** and **diagonal movement** (e.g., holding W + A moves you seamlessly up-left), ensuring the game feels fluid despite being grid-based.
* **Pathfinding:** Clicking a distant floor tile triggers an automatic pathfinding sequence  that uses an optimal diagonal algorithm to navigate the dungeon efficiently.

### 4. Developer / Cheat Mode

* A dedicated **Dev Mode** is included, offering convenience and cheat functionalities for testing and rapid development (e.g., skipping floors, instantly healing, providing items).

---

## 💻 Technical Base & Scope

| Category | Detail |
| :--- | :--- |
| **Platform Scope** | Solely **web-based**. There is no mobile styling or responsiveness implemented for this prototype. |
| **Built With** | Modern **React Hooks**, JavaScript, and CSS-in-JS (for styling). |
| **Persistence** | Uses the browser's local storage/database (`IndexedDB`) for robust, automatic save functionality. |
| **Architecture** | Highly modular, utilizing decoupled custom hooks for State, Input, Movement, and AI(simple math). |

---

## 🕹️ Basic Controls

| Action | Key(s) |
| :--- | :--- |
| **Movement** | W, A, S, D, or Arrow Keys |
| **Diagonal** | Hold two adjacent directional keys (e.g., W + A) |
| **Interact/Stairs** | Spacebar / Enter |
| **Inventory** | I |
| **Heal** | H |
| **Stop Auto-Move** | Any Movement Key |
