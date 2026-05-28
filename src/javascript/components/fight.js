import controls from '../../constants/controls';
import createElement from '../helpers/domHelper';

export function getHitPower(fighter) {
    const { attack } = fighter;
    const criticalHitChance = Math.random() + 1;
    return attack * criticalHitChance;
}

export function getBlockPower(fighter) {
    const { defense } = fighter;
    const dodgeChance = Math.random() + 1;
    return defense * dodgeChance;
}

export function getDamage(attacker, defender) {
    const hitPower = getHitPower(attacker);
    const blockPower = getBlockPower(defender);
    const damage = hitPower - blockPower;
    return Math.max(0, damage);
}

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        let health1 = firstFighter.health;
        let health2 = secondFighter.health;
        let lastCrit1 = 0;
        let lastCrit2 = 0;
        const pressedKeys = new Set();
        const controller = new AbortController();

        const leftHealthBar = document.getElementById('left-fighter-indicator');
        const rightHealthBar = document.getElementById('right-fighter-indicator');

        // Combat Log setup
        const combatLog = createElement({ tagName: 'div', className: 'combat-log' });
        Object.assign(combatLog.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100px',
            overflowY: 'auto',
            color: '#fff',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.5)',
            padding: '10px',
            width: '400px',
            zIndex: '1000'
        });
        document.getElementById('root').append(combatLog);

        function logEvent(message) {
            const logEntry = createElement({ tagName: 'div' });
            logEntry.innerText = message;
            combatLog.prepend(logEntry);
        }

        function updateCritIndicator(position, lastCrit) {
            const indicatorElement = document.querySelector(`.crit-indicator-${position}`);
            const cooldown = 10000;
            const now = Date.now();
            const remaining = Math.ceil((cooldown - (now - lastCrit)) / 1000);

            if (remaining > 0) {
                indicatorElement.style.color = '#e74c3c';
                indicatorElement.innerText = `CRIT: ${remaining}s`;
                setTimeout(() => updateCritIndicator(position, lastCrit), 1000);
            } else {
                indicatorElement.style.color = '#2ecc71';
                indicatorElement.innerText = 'CRIT READY';
            }
        }

        // Crit Indicators setup
        function createCritIndicator(position) {
            const indicator = createElement({ tagName: 'div', className: `crit-indicator-${position}` });
            indicator.style.color = '#2ecc71';
            indicator.style.fontWeight = 'bold';
            indicator.innerText = 'CRIT READY';
            const indicators = document.querySelectorAll('.arena___fighter-indicator');
            const targetParent = position === 'left' ? indicators[0] : indicators[1];
            targetParent.append(indicator);
            return indicator;
        }

        createCritIndicator('left');
        createCritIndicator('right');

        function updateHealth(fighterNum, health) {
            const maxHealth = fighterNum === 1 ? firstFighter.health : secondFighter.health;
            const percentage = Math.max(0, (health / maxHealth) * 100);
            const bar = fighterNum === 1 ? leftHealthBar : rightHealthBar;
            bar.style.width = `${percentage}%`;

            if (percentage === 100) {
                bar.style.backgroundColor = '#00d2ff';
            } else if (percentage > 50) {
                bar.style.backgroundColor = '#2ecc71';
            } else if (percentage > 20) {
                bar.style.backgroundColor = '#f1c40f';
            } else {
                bar.style.backgroundColor = '#e74c3c';
            }
        }

        updateHealth(1, firstFighter.health);
        updateHealth(2, secondFighter.health);

        function cleanup() {
            controller.abort();
            combatLog.remove();
        }

        function checkWinner() {
            if (health1 <= 0) {
                cleanup();
                resolve(secondFighter);
            } else if (health2 <= 0) {
                cleanup();
                resolve(firstFighter);
            }
        }

        function handleKeyDown(event) {
            if (event.repeat) return;
            pressedKeys.add(event.code);

            // Player 1 Normal Attack
            if (event.code === controls.PlayerOneAttack && !pressedKeys.has(controls.PlayerOneBlock)) {
                if (pressedKeys.has(controls.PlayerTwoBlock)) {
                    logEvent(`${secondFighter.name} blocked the strike`);
                } else {
                    const damage = getDamage(firstFighter, secondFighter);
                    health2 -= damage;
                    logEvent(`${firstFighter.name} hits ${secondFighter.name} for ${damage.toFixed(1)} damage`);
                    updateHealth(2, health2);
                }
            }

            // Player 2 Normal Attack
            if (event.code === controls.PlayerTwoAttack && !pressedKeys.has(controls.PlayerTwoBlock)) {
                if (pressedKeys.has(controls.PlayerOneBlock)) {
                    logEvent(`${firstFighter.name} blocked the strike`);
                } else {
                    const damage = getDamage(secondFighter, firstFighter);
                    health1 -= damage;
                    logEvent(`${secondFighter.name} hits ${firstFighter.name} for ${damage.toFixed(1)} damage`);
                    updateHealth(1, health1);
                }
            }

            // Player 1 Critical Hit
            if (controls.PlayerOneCriticalHitCombination.every(key => pressedKeys.has(key))) {
                const now = Date.now();
                if (now - lastCrit1 >= 10000) {
                    const damage = 2 * firstFighter.attack;
                    health2 -= damage;
                    lastCrit1 = now;
                    logEvent(`CRITICAL HIT! ${firstFighter.name} deals ${damage} unblockable damage!`);
                    updateHealth(2, health2);
                    updateCritIndicator('left', lastCrit1);
                }
            }

            // Player 2 Critical Hit
            if (controls.PlayerTwoCriticalHitCombination.every(key => pressedKeys.has(key))) {
                const now = Date.now();
                if (now - lastCrit2 >= 10000) {
                    const damage = 2 * secondFighter.attack;
                    health1 -= damage;
                    lastCrit2 = now;
                    logEvent(`CRITICAL HIT! ${secondFighter.name} deals ${damage} unblockable damage!`);
                    updateHealth(1, health1);
                    updateCritIndicator('right', lastCrit2);
                }
            }

            checkWinner();
        }

        function handleKeyUp(event) {
            pressedKeys.delete(event.code);
        }

        window.addEventListener('keydown', handleKeyDown, { signal: controller.signal });
        window.addEventListener('keyup', handleKeyUp, { signal: controller.signal });
    });
}
