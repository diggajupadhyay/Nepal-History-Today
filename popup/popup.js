document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('content');

    try {
        const nepalEvents = await browser.runtime.sendMessage({
            action: "getNepalEvents"
        });

        if (!nepalEvents) {
            throw new Error('Failed to fetch events');
        }

        loadingEl.style.display = 'none';

        const sections = [
            { id: 'events', title: 'Events', data: nepalEvents.events },
            { id: 'births', title: 'Births', data: nepalEvents.births },
            { id: 'deaths', title: 'Deaths', data: nepalEvents.deaths },
            { id: 'holidays', title: 'Holidays', data: nepalEvents.holidays }
        ];

        sections.forEach(section => {
            const container = document.getElementById(`${section.id}-container`);

            if (section.data && section.data.length > 0) {
                const title = document.createElement('h2');
                title.textContent = section.title;
                container.appendChild(title);

                section.data.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event-item';

                    const yearEl = document.createElement('div');
                    yearEl.className = 'event-year';
                    yearEl.textContent = event.year;

                    const textEl = document.createElement('div');
                    textEl.className = 'event-text';
                    textEl.textContent = event.text;

                    eventEl.appendChild(yearEl);
                    eventEl.appendChild(textEl);

                    // Add description if available
                    if (event.pages && event.pages[0] && event.pages[0].extract) {
                        const descEl = document.createElement('div');
                        descEl.className = 'event-description';
                        descEl.textContent = event.pages[0].extract;
                        eventEl.appendChild(descEl);
                    }

                    // Add Wikipedia link if available
                    if (event.pages && event.pages[0] && event.pages[0].content_urls) {
                        const linkEl = document.createElement('div');
                        linkEl.className = 'event-link';
                        const link = document.createElement('a');
                        link.href = event.pages[0].content_urls.desktop.page;
                        link.textContent = 'Read more on Wikipedia';
                        link.target = '_blank';
                        linkEl.appendChild(link);
                        eventEl.appendChild(linkEl);
                    }

                    container.appendChild(eventEl);
                });
            }
        });

        const hasEvents = sections.some(section => section.data && section.data.length > 0);
        if (!hasEvents) {
            contentEl.innerHTML = '<p class="no-events">No events related to Nepal found for today.</p>';
        }

    } catch (error) {
        console.error('Error:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
});
