import createElement from '../helpers/domHelper';

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}

export function createFighterPreview(fighter, position) {
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    if (fighter) {
        const { name, health, attack, defense } = fighter;
        const imageElement = createFighterImage(fighter);
        const nameElement = createElement({ tagName: 'h3', className: 'fighter-preview___name' });
        nameElement.innerText = name;

        const healthElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
        healthElement.innerText = `Health: ${health}`;

        const attackElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
        attackElement.innerText = `Attack: ${attack}`;

        const defenseElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
        defenseElement.innerText = `Defense: ${defense}`;

        fighterElement.append(imageElement, nameElement, healthElement, attackElement, defenseElement);
    }

    return fighterElement;
}
