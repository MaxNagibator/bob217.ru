async function loadCards() {
    const response = await fetch('cards.json');
    const data = await response.json();
    const container = document.getElementById('card-container');

    for (const section in data) {
        const sectionHeader = document.createElement('h2');
        sectionHeader.textContent = section;
        container.appendChild(sectionHeader);

        const sectionContainer = document.createElement('div');
        sectionContainer.classList.add('section-container');
        container.appendChild(sectionContainer);

        data[section].forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <a href="${cardData.link}"
                   target="_blank">
                    <img src="${cardData.icon}"
                         alt="${cardData.title}">
                </a>
                <div class="card-content">
                    <h3>
                        ${cardData.title}
                        <a href="${cardData.link}"
                           class="icon go-to-link"
                           target="_blank">
                            <img src="img/launch.svg"
                                 alt="launch">
                        </a>
                    </h3>
                    <p>
                        ${cardData.short_description}
                        <button class="icon show-description">
                            <img src="img/info.svg"
                                 alt="info">
                        </button>
                    </p>
                    <div class="description">
                        ${cardData.description.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                </div>
            `;

            sectionContainer.appendChild(card);

            const showDescriptionButton = card.querySelector('.show-description');
            showDescriptionButton.addEventListener('click', function () {
                const description = card.querySelector('.description');
                if (description.classList.contains('show')) {
                    description.classList.remove('show');
                    card.classList.remove('expanded');
                } else {
                    description.classList.add('show');
                    card.classList.add('expanded');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', loadCards);