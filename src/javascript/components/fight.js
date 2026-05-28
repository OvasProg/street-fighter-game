import controls from '../../constants/controls';

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

        const leftHealthBar = document.getElementById('left-fighter-indicator');
        const rightHealthBar = document.getElementById('right-fighter-indicator');

        const updateHealth = (fighterNum, health) => {
            const percentage = Math.max(
                0,
                (health / (fighterNum === 1 ? firstFighter.health : secondFighter.health)) * 100
            );
            const bar = fighterNum === 1 ? leftHealthBar : rightHealthBar;
            bar.style.width = `${percentage}%`;
        };

        const cleanup = () => {
            // eslint-disable-next-line no-use-before-define
            window.removeEventListener('keydown', handleKeyDown);
            // eslint-disable-next-line no-use-before-define
            window.removeEventListener('keyup', handleKeyUp);
        };

        const checkWinner = () => {
            if (health1 <= 0) {
                cleanup();
                resolve(secondFighter);
            } else if (health2 <= 0) {
                cleanup();
                resolve(firstFighter);
            }
        };

        const handleKeyDown = event => {
            if (event.repeat) return;
            pressedKeys.add(event.code);

            // Player 1 Normal Attack
            if (event.code === controls.PlayerOneAttack && !pressedKeys.has(controls.PlayerOneBlock)) {
                const damage = pressedKeys.has(controls.PlayerTwoBlock) ? 0 : getDamage(firstFighter, secondFighter);
                health2 -= damage;
                updateHealth(2, health2);
            }

            // Player 2 Normal Attack
            if (event.code === controls.PlayerTwoAttack && !pressedKeys.has(controls.PlayerTwoBlock)) {
                const damage = pressedKeys.has(controls.PlayerOneBlock) ? 0 : getDamage(secondFighter, firstFighter);
                health1 -= damage;
                updateHealth(1, health1);
            }

            // Player 1 Critical Hit
            if (controls.PlayerOneCriticalHitCombination.every(key => pressedKeys.has(key))) {
                const now = Date.now();
                if (now - lastCrit1 >= 10000) {
                    health2 -= 2 * firstFighter.attack;
                    lastCrit1 = now;
                    updateHealth(2, health2);
                }
            }

            // Player 2 Critical Hit
            if (controls.PlayerTwoCriticalHitCombination.every(key => pressedKeys.has(key))) {
                const now = Date.now();
                if (now - lastCrit2 >= 10000) {
                    health1 -= 2 * secondFighter.attack;
                    lastCrit2 = now;
                    updateHealth(1, health1);
                }
            }

            checkWinner();
        };

        const handleKeyUp = event => {
            pressedKeys.delete(event.code);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    });
}
