async function fetchNepalEvents() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    try {
      const response = await fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Helper function to check if any text contains "nepal"
      const containsNepal = (text) => text.toLowerCase().includes('nepal');
      
      // Helper function to check if an event is Nepal-related
      const isNepalRelated = (event) => {
        // Check main text
        if (containsNepal(event.text)) return true;
        
        // Check pages array
        if (event.pages && event.pages.some(page => {
          return containsNepal(page.title) || 
                 containsNepal(page.extract || '') ||
                 containsNepal(page.description || '') ||
                 (page.content_urls && containsNepal(page.content_urls.desktop.page || ''))
        })) return true;
        
        // Check additional fields that might contain Nepal references
        if (event.description && containsNepal(event.description)) return true;
        if (event.extract && containsNepal(event.extract)) return true;
        
        // If the event has links, check their titles and descriptions
        if (event.links && event.links.some(link => 
          containsNepal(link.title || '') || containsNepal(link.description || '')
        )) return true;
        
        return false;
      };
      
      // Filter events using the enhanced check
      const nepalEvents = {
        selected: data.selected.filter(isNepalRelated),
        births: data.births.filter(isNepalRelated),
        deaths: data.deaths.filter(isNepalRelated),
        events: data.events.filter(isNepalRelated),
        holidays: data.holidays.filter(isNepalRelated)
      };
      
      return nepalEvents;
    } catch (error) {
      console.error('Error fetching Nepal events:', error);
      return null;
    }
  }
  
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getNepalEvents") {
      fetchNepalEvents().then(sendResponse);
      return true;
    }
  });