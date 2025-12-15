# CODEDEX-DECEMBER-CHALLENGE

## 🎮 Chronos Shift - The Changing of Time

A Phaser 3 platformer game where you control time itself! Switch between day and night to reveal hidden platforms and collect all the gems while avoiding enemies.

### 🌟 Game Features

- **Time Manipulation**: Press 'T' to toggle between day and night modes
- **Dynamic Platforms**: Some platforms only exist during the day, others only at night
- **Beautiful Transitions**: Smooth visual effects as time changes
- **Collectibles**: Gather all 6 gems scattered across the level
- **Enemies**: Avoid patrolling enemies that want to stop you
- **Win Condition**: Collect all gems to win!

### 🎯 Theme: "The Changing of Time"

This game embraces the theme through:
- Real-time day/night cycle toggling
- Environment changes that affect gameplay
- Time-sensitive platforms that phase in and out
- Visual transformations (sun/moon, stars, sky colors)
- Strategic time-shifting puzzle elements

### 🕹️ Controls

- **Arrow Keys** or **WASD**: Move left and right
- **Space** or **Up Arrow**: Jump
- **T**: Toggle time between day and night
- **Click**: Restart after game over or victory

### 🚀 How to Run

#### Option 1: Direct Browser (Simplest)
1. Open `index.html` directly in your web browser
2. **Important**: Make sure you have an internet connection so Phaser can load from the CDN
3. Start playing!

#### Option 2: Local Server (Recommended)
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Or specify a port
npm run dev
```

Then open your browser to `http://localhost:3000`

#### Option 3: Python Server
```bash
# Python 3
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000`

**Note**: The game requires an internet connection to load Phaser from the CDN (unpkg.com). If you need an offline version, download Phaser manually from [phaser.io](https://phaser.io/download/stable) and update the script tag in `index.html`.

### 🎨 Game Mechanics

1. **Day Platforms** (Gold): Only solid during the day
2. **Night Platforms** (Purple): Only solid during the night
3. **Static Platforms** (Brown): Always solid
4. **Day Gems** (Gold stars): Can only be collected during the day
5. **Night Gems** (Purple stars): Can only be collected during the night
6. **Neutral Gems** (Green stars): Can be collected anytime

### 🏆 Objective

Collect all 6 gems scattered throughout the level! Use time manipulation strategically to:
- Access platforms that only exist in certain time periods
- Collect gems that are only available during specific times
- Navigate through the level efficiently

### 💡 Tips

- Scout the level first to see where day and night platforms are located
- Plan your route to collect gems efficiently
- Watch out for enemies - they're active in both time periods!
- Some gems require specific time states to be accessible

### 🛠️ Technologies Used

- **Phaser 3** (v3.70.0): Game framework
- **JavaScript**: Game logic and mechanics
- **HTML5 Canvas**: Rendering
- **CSS3**: Styling and layout

### 📝 Game Jam Details

- **Theme**: The Changing of Time
- **Framework**: Phaser 3
- **Genre**: Puzzle Platformer
- **Development Time**: Single session

Enjoy playing Chronos Shift! 🌞🌙