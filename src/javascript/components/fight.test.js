/**
 * @jest-environment jsdom
 */

/* eslint-env jest */

import { getHitPower, getBlockPower, getDamage, fight } from './fight';
import controls from '../../constants/controls';

describe('fight math', () => {
    test('getHitPower should be within [attack, 2 * attack)', () => {
        const fighter = { attack: 10 };
        for (let i = 0; i < 100; i += 1) {
            const power = getHitPower(fighter);
            expect(power).toBeGreaterThanOrEqual(10);
            expect(power).toBeLessThan(20);
        }
    });

    test('getBlockPower should be within [defense, 2 * defense)', () => {
        const fighter = { defense: 10 };
        for (let i = 0; i < 100; i += 1) {
            const power = getBlockPower(fighter);
            expect(power).toBeGreaterThanOrEqual(10);
            expect(power).toBeLessThan(20);
        }
    });

    test('getDamage should return 0 if blockPower >= hitPower', () => {
        // We can't easily control the RNG in getDamage since it calls getHitPower/getBlockPower
        // but we can mock them if we wanted to be super precise.
        // For a black-box test, we can just check it doesn't return negative.
        const attacker = { attack: 1 };
        const defender = { defense: 100 };
        const damage = getDamage(attacker, defender);
        expect(damage).toBe(0);
    });

    test('getDamage should return a positive number if hitPower is significantly higher', () => {
        const attacker = { attack: 100 };
        const defender = { defense: 1 };
        const damage = getDamage(attacker, defender);
        expect(damage).toBeGreaterThan(0);
    });
});

describe('fight game loop', () => {
    let firstFighter;
    let secondFighter;

    beforeEach(() => {
        jest.useFakeTimers();

        firstFighter = { name: 'Ryu', health: 100, attack: 10, defense: 5 };
        secondFighter = { name: 'Ken', health: 100, attack: 10, defense: 5 };

        // Setup DOM mocks
        document.body.innerHTML = `
            <div id="root"></div>
            <div class="arena___fight-status">
                <div class="arena___fighter-indicator">
                    <div id="left-fighter-indicator" style="width: 100%"></div>
                </div>
                <div class="arena___fighter-indicator">
                    <div id="right-fighter-indicator" style="width: 100%"></div>
                </div>
            </div>
        `;
    });

    afterEach(() => {
        jest.useRealTimers();
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('should resolve with the winner when a fighter health drops to 0', async () => {
        const fightPromise = fight(firstFighter, secondFighter);

        // Simulate Player 1 attacking until Player 2 health is 0
        // Ken has 100 health, Ryu has 10 attack. Max damage is 20, min is 0.
        // To be safe, we just spam it.
        for (let i = 0; i < 100; i += 1) {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerOneAttack }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: controls.PlayerOneAttack }));
        }

        const winner = await fightPromise;
        expect(winner).toBe(firstFighter);
        expect(document.getElementById('right-fighter-indicator').style.width).toBe('0%');
    });

    test('should not deal damage if the defender is blocking', async () => {
        const fightPromise = fight(firstFighter, secondFighter);

        // Player 2 holds block
        window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerTwoBlock }));

        const initialHealthWidth = document.getElementById('right-fighter-indicator').style.width;

        // Player 1 attacks
        window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerOneAttack }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: controls.PlayerOneAttack }));

        expect(document.getElementById('right-fighter-indicator').style.width).toBe(initialHealthWidth);

        // Player 2 releases block
        window.dispatchEvent(new KeyboardEvent('keyup', { code: controls.PlayerTwoBlock }));

        // Player 1 attacks again
        window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerOneAttack }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: controls.PlayerOneAttack }));

        expect(parseFloat(document.getElementById('right-fighter-indicator').style.width)).toBeLessThan(100);

        // Cleanup the promise by killing one player
        for (let i = 0; i < 100; i += 1) {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerOneAttack }));
        }
        await fightPromise;
    });

    test('critical hit should deal unblockable damage and respect cooldown', async () => {
        const fightPromise = fight(firstFighter, secondFighter);

        // P1 executes critical hit
        controls.PlayerOneCriticalHitCombination.forEach(code => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code }));
        });

        // Ken health: 100 - (2 * Ryu attack 10) = 80
        expect(document.getElementById('right-fighter-indicator').style.width).toBe('80%');

        // Immediately try again (cooldown should prevent it)
        controls.PlayerOneCriticalHitCombination.forEach(code => {
            window.dispatchEvent(new KeyboardEvent('keyup', { code }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code }));
        });

        expect(document.getElementById('right-fighter-indicator').style.width).toBe('80%');

        // Advance time by 10s
        jest.advanceTimersByTime(10001);

        // Try again
        controls.PlayerOneCriticalHitCombination.forEach(code => {
            window.dispatchEvent(new KeyboardEvent('keyup', { code }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code }));
        });

        expect(document.getElementById('right-fighter-indicator').style.width).toBe('60%');

        // Cleanup
        for (let i = 0; i < 100; i += 1) {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: controls.PlayerOneAttack }));
        }
        await fightPromise;
    });
});
