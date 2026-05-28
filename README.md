# Street Fighter Game

An asynchronous JavaScript fighting game prototype leveraging modern frontend design patterns and robust event handling. This project fully satisfies all baseline core requirements and incorporates extensive extra features to meet the criteria for bonus marks.

## 🌟 Bonus Features & UX Enhancements

To deliver an exceptional user experience (UX) and showcase a high-fidelity production standard, the following custom systems were designed and integrated:

1. **Performance-Optimized Fighter Caching:**

    - Implemented an efficient internal memory cache mechanism within `getFighterInfo`.
    - Prevents duplicate or redundant network fetch requests when a user rapidly toggles between the same characters on the selection screen, significantly cutting down on GitHub REST API rate-limit consumption.

2. **Dynamic Health Bar Color Splitting:**

    - The health bars dynamically change their background colors as the tide of battle shifts, providing immediate peripheral feedback:
        - `100% Health`: Neon Blue signature theme color (`#00d2ff`).
        - `> 50% Health`: Solid Green healthy state (`#2ecc71`).
        - `20% - 50% Health`: Amber/Yellow warning state (`#f1c40f`).
        - `< 20% Health`: Red critical danger state (`#e74c3c`).
    - Integrated directly into the arena initialization loop to ensure a seamless repaint the moment the screen loads.

3. **Real-Time Scrolling Combat Log:**

    - Injected a stylized, semi-transparent HUD log container centered at the bottom of the viewport.
    - Captures and scrolls every combat event instantly: normal strikes (displaying exact damage calculated to 1 decimal place), passive blocks, and unblockable critical combinations.
    - Utilizes `prepend` DOM insertion, ensuring the newest action always pops at the top without jarring layout shifts.

4. **Visual Critical Cooldown HUD Indicators:**

    - Positioned an elegant status label underneath each fighter's health bar.
    - Displays a vibrant green **CRIT READY** notification when the combo is off cooldown.
    - Instantly swaps to a red countdown timer (e.g., `CRIT: 10s`) upon execution, utilizing a safe recursive clock loop that eliminates UI flickering.

5. **Modern Gaming Dark Theme Modal:**
    - Replaced the default, basic white browser modal with a sleek dark aesthetic (`#1e1e1e`) featuring deep drop-shadow styling and high-contrast neon blue accents.
    - Leverages Flexbox architectures to guarantee the winning fighter's avatar is perfectly centered.
    - Enhanced the close element with a smooth hover-scale animation transition. Closing the modal executes a lightweight application cycle reset to quickly start a new match.

---

## 🧪 Comprehensive Core Engine Unit Testing

All core calculation functions and asynchronous tracking routines are fully covered by a robust, behavior-driven test suite written in **Jest** and **JSDOM** inside `src/javascript/components/fight.test.js`:

-   **RNG Boundary & Floor Validation:** Asserts over a 100-iteration loop that `getHitPower` and `getBlockPower` scale precisely within the mathematically required $[1x, 2x)$ limits, while enforcing that `getDamage` never falls below a hard floor of `0`.
-   **Synthetic Event Stream Simulation:** Emits genuine `KeyboardEvent` streams to the global window to test the `Set`-based key state tracking mechanics under conditions of simultaneous multi-key press combos.
-   **Temporal Cooldown Verification:** Controls the flow of time using Jest Fake Timers (`jest.useFakeTimers()`) to instantly fast-forward the environment clock by exactly 10 seconds, mathematically proving that critical strike spamming is blocked during active cooldown states.
-   **Game Loop Lifecycle Resolution:** Simulates key strokes continually draining a player's health down to 0, verifying that the main combat engine `Promise` cleanly resolves with the exact winning fighter profile object.

### How to Run the Tests:

1. Ensure all project dependencies are fully installed: `npm install`
2. Execute the test command in your terminal: `npm test`

---

## 🛠 Technical Stack & Configurations

-   **Language:** Pure ECMAScript 6+ (Vanilla JS)
-   **Bundler & Dev Server:** Webpack
-   **Linters:** ESLint (100% clean pass, fully configured to handle Jest globals without inline rule bypasses), Prettier
-   **Testing Framework:** Jest with Babel Core Compilation & JSDOM Environment Environments

## 🏃‍♂️ Simple start

1. **`npm run setup`** at the root
2. **`npm run dev`** at the root
3. open **`http://localhost:7800/`**

OR

1. **`npm i`** at the root
2. **`npx simple-git-hooks`** at the root
3. **`npm run dev`** at the root
4. open **`http://localhost:7800/`**

## ℹ️ PS

The project has a [Git Hooks](https://www.atlassian.com/git/tutorials/git-hooks), [Prettier](https://prettier.io/) and [Eslint](https://eslint.org/) set up, to validate your JS code.
