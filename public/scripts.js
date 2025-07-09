document.addEventListener("DOMContentLoaded", async () => {
  const itemsList = document.getElementById("itemsList");
  const filterLocation = document.getElementById("filterLocation");
  const filterStatus = document.getElementById("filterStatus");
  const chatbotContent = document.getElementById("chatbotContent");
  const chatbotInput = document.getElementById("chatbotInput");

  const cmsDatabase = ["20210001", "20210002", "20210003"]; // Fake CMS IDs
  const items = [];
  const encoderModel = await use.load();

  // Form Submission Logic
  document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const newItem = {
      name: formData.get("name"),
      cmsId: formData.get("cmsId"),
      location: formData.get("location"),
      status: formData.get("status"),
      description: formData.get("description"),
      image: URL.createObjectURL(formData.get("image")),
    };

    if (!isValidCmsId(newItem.cmsId)) {
      alert("Invalid CMS ID. Please check and try again.");
      return;
    }

    items.push(newItem);
    await checkForPotentialMatches(newItem); // Ensure async check
    renderItems(); // Re-render items after adding a new one
    e.target.reset();
  });

  // CMS ID validation
  function isValidCmsId(cmsId) {
    const threshold = 0.8;
    let closestMatch = null;
    let maxSimilarity = 0;

    cmsDatabase.forEach((dbId) => {
      const similarity = computeStringSimilarity(cmsId, dbId);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        closestMatch = dbId;
      }
    });

    if (maxSimilarity >= threshold) {
      if (maxSimilarity < 1) {
        alert(`Did you mean CMS ID: ${closestMatch}?`);
      }
      return true;
    }
    return false;
  }

  function computeStringSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    const distance = dp[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  }

  async function computeSemanticSimilarity(desc1, desc2) {
    const embeddings = await encoderModel.embed([desc1, desc2]);
    const vec1 = embeddings.arraySync()[0];
    const vec2 = embeddings.arraySync()[1];
    return cosineSimilarity(vec1, vec2);
  }

  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  // Render items with filters applied
  function renderItems() {
    itemsList.innerHTML = "";
    const locationFilter = filterLocation.value;
    const statusFilter = filterStatus.value;

    // Filter items based on the selected location and status
    const filteredItems = items.filter((item) => {
      const locationMatch = locationFilter === "All" || item.location === locationFilter;
      const statusMatch = statusFilter === "All" || item.status === statusFilter;
      return locationMatch && statusMatch;
    });

    // Render each filtered item
    filteredItems.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
        <h3>${item.name}</h3>
        <p>Status: ${item.status}</p>
        <p>Location: ${item.location}</p>
        <p>Description: ${item.description}</p>
        <img src="${item.image}" alt="Item Image" class="item-image">
      `;
      itemsList.appendChild(itemDiv);
    });
  }

  // Check for potential matches (similarity check)
  async function checkForPotentialMatches(newItem) {
    const oppositeStatus = newItem.status === "Lost" ? "Found" : "Lost";

    for (const item of items) {
      if (item.status === oppositeStatus) {
        const similarity = await computeSemanticSimilarity(newItem.description, item.description);
        if (similarity > 0.7) {
          alert(
            `Potential match found! "${newItem.name}" matches "${item.name}" with ${Math.round(similarity * 100)}% confidence.`
          );
        }
      }
    }
  }

  // Chatbot functionality
  const chatbotButton = document.getElementById("chatbotButton");
  const chatbot = document.getElementById("chatbot");
  const chatbotClose = document.getElementById("chatbotClose");

  // Toggle chatbot visibility (simplified from Text B)
  chatbotButton.addEventListener("click", () => {
    chatbot.style.display = chatbot.style.display === "block" ? "none" : "block";
  });

  // Close chatbot
  chatbotClose.addEventListener("click", () => {
    chatbot.style.display = "none";
  });

  // Handle input messages (simplified from Text B)
  chatbotInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const userMessage = e.target.value.trim();
      if (userMessage) {
        displayChatbotMessage(userMessage, "user-message");
        e.target.value = "";
        const response = await getChatbotResponse(userMessage);
        displayChatbotMessage(response, "assistant-message");
      }
    }
  });

  function displayChatbotMessage(message, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${className}`;
    messageDiv.textContent = message;
    chatbotContent.appendChild(messageDiv);
    chatbotContent.scrollTop = chatbotContent.scrollHeight;
  }

  // Global variable to track the state of the conversation
  let conversationState = {
    itemDescription: null,
    userNeedsHelp: false
  };

  // Utility function for keywords matching
  function checkForKeywords(message, keywords) {
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Main chatbot function
  async function getChatbotResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();

    // Define keywords for different categories of questions
    const greetings = ["hello", "hi", "hey", "greetings", "morning", "afternoon", "evening"];
    const helpKeywords = ["help", "assist", "support", "help me", "can you help", "guidance"];
    const statusKeywords = ["status", "update", "report", "found", "lost", "progress", "check"];
    const reportKeywords = ["report", "upload", "submit", "file"];
    const itemKeywords = ["item", "object", "thing", "belonging"];
    const locationKeywords = ["location", "place", "where", "site", "area"];
    const contactKeywords = ["contact", "reach", "email", "phone", "how to contact"];
    const descriptionKeywords = ["describe", "description", "features", "details"];
    const privacyKeywords = ["privacy", "data", "secure", "safety"];

    // 1. Handle greetings
    if (checkForKeywords(message, greetings)) {
      conversationState.userNeedsHelp = false;  // Reset help state
      return "Hi there! How can I help you today?";
    }

    // 2. Help-related queries
    if (checkForKeywords(message, helpKeywords)) {
      conversationState.userNeedsHelp = true;
      return "Sure! I can assist you with lost or found items. How can I help you?";
    }

    // 3. Asking for status update or report info
    if (checkForKeywords(message, statusKeywords)) {
      return "You can check the status of your items using the filters provided on the system.";
    }

    // 4. Reporting items
    if (checkForKeywords(message, reportKeywords)) {
      return "To report an item, fill out the form with the item details, including its status and location.";
    }

    // 5. Asking about the item or its description
    if (checkForKeywords(message, itemKeywords) && !conversationState.itemDescription) {
      conversationState.userNeedsHelp = false;  // Reset help state
      return "Could you provide more details about the item? For example, its name, color, and condition.";
    }

    if (conversationState.userNeedsHelp && checkForKeywords(message, descriptionKeywords)) {
      conversationState.itemDescription = message;
      return `Got it! You mentioned it's a ${message}. Is that correct?`;
    }

    // 6. Respond to item description
    if (conversationState.itemDescription && message.includes("yes")) {
      conversationState.userNeedsHelp = false;  // Reset help state
      return "Thank you! I’ve logged the item. Would you like to report it now?";
    }

    // If the chatbot doesn't understand the input
    if (message === "no" && conversationState.itemDescription) {
      return "Can you please provide more details about the item?";
    }

    // 7. Asking about the location of a lost/found item
    if (checkForKeywords(message, locationKeywords)) {
      return "You can report items at the Lost and Found Office or other locations like the Main Hall.";
    }

    // 8. Asking for contact information
    if (checkForKeywords(message, contactKeywords)) {
      return "You can contact support via email at support@example.com.";
    }

    // 9. Asking about privacy
    if (checkForKeywords(message, privacyKeywords)) {
      return "Your privacy is important. We ensure that your personal information is stored securely and not shared without consent.";
    }

    // Default response if no match is found
    return "I'm not sure how to respond to that. Can you please rephrase or provide more details?";
  }




  // Listen for changes to the filters and re-render items
  filterLocation.addEventListener("change", renderItems);
  filterStatus.addEventListener("change", renderItems);

  // Initial render call when page loads
  renderItems();

  // Help button logic to open the modal
  const helpButton = document.getElementById("helpButton");
  const helpModal = document.getElementById("helpModal");
  const closeButton = helpModal.querySelector(".close-button");

  // Open the Help Modal when the Help button is clicked
  helpButton.addEventListener("click", () => {
    helpModal.style.display = "block"; // Show the modal
  });

  // Close the Help Modal when the close button is clicked
  closeButton.addEventListener("click", () => {
    helpModal.style.display = "none"; // Hide the modal
  });

  // Close the Help Modal if the user clicks outside of the modal content
  window.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = "none"; // Hide the modal if clicking outside it
    }
  });
});




