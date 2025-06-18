document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Cria a lista de participantes
        let participantsSection = "";
        if (details.participants.length > 0) {
          participantsSection = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list no-bullets">
                ${details.participants
                  .map(
                    (email) =>
                      `<li title="${email}"><span class="participant-email">${email}</span> <span class="delete-participant" data-activity="${name}" data-email="${email}" title="Remover">\n                        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 20 20' fill='none' style='vertical-align:middle;'><rect x='5' y='8' width='1.5' height='6' rx='0.75' fill='#c62828'/><rect x='9.25' y='8' width='1.5' height='6' rx='0.75' fill='#c62828'/><rect x='13' y='8' width='1.5' height='6' rx='0.75' fill='#c62828'/><rect x='4' y='6' width='12' height='2' rx='1' fill='#b71c1c'/><rect x='7' y='2' width='6' height='2' rx='1' fill='#b71c1c'/><rect x='2' y='6' width='16' height='2' rx='1' fill='#c62828' opacity='0.2'/></svg>\n                      </span></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsSection = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <span class="no-participants">No participants yet</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Após inserir as atividades na lista:
      // Adiciona listeners para os ícones de exclusão
      activitiesList.querySelectorAll(".delete-participant").forEach((icon) => {
        icon.addEventListener("click", async (e) => {
          const activity = icon.getAttribute("data-activity");
          const email = icon.getAttribute("data-email");
          if (!confirm(`Remover ${email} de ${activity}?`)) return;
          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
              {
                method: "POST",
              }
            );
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || "Unregistered successfully.";
              messageDiv.className = "success";
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Failed to unregister.";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => messageDiv.classList.add("hidden"), 5000);
          } catch (error) {
            messageDiv.textContent = "Failed to unregister. Please try again.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            console.error("Error unregistering:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista de atividades após inscrição
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
