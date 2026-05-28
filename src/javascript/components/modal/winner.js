import showModal from './modal';
import { createFighterImage } from '../fighterPreview';
import createElement from '../../helpers/domHelper';

export default function showWinnerModal(fighter) {
    const title = 'Winner!';
    const bodyElement = createElement({ tagName: 'div', className: 'winner-modal' });
    const imageElement = createFighterImage(fighter);

    bodyElement.append(imageElement);

    showModal({
        title,
        bodyElement,
        onClose: () => {
            window.location.reload();
        }
    });
}
