// Edit Profile Functions
function toggleEditModal() {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function closeEditModal() {
  document.getElementById("editProfileModal").style.display = "none";
}

// Image Preview
document
  .getElementById("profileImage")
  .addEventListener("change", function (e) {
    const reader = new FileReader();
    reader.onload = function () {
      document.getElementById("profilePreview").src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  });

// Skills Management
function addSkill() {
  const select = document.getElementById('newSkill');
  const serviceId = select.value;
  const serviceName = select.options[select.selectedIndex].text;
  console.log("service id js", serviceId);
  
  if (!serviceId) return;

  // Add hidden input
  const hiddenContainer = document.getElementById('skillsContainer');
  const newInput = document.createElement('input');
  newInput.type = 'hidden';
  newInput.name = 'services[]';
  newInput.value = serviceId;
  hiddenContainer.appendChild(newInput);

  // Add visual chip
  const chip = document.createElement('span');
  chip.className = 'skill-chip bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center';
  chip.dataset.serviceId = serviceId;
  chip.innerHTML = `
    ${serviceName}
    <button type="button" onclick="removeSkill(${serviceId})">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.getElementById('skillsContainer').appendChild(chip);

  // Disable select option
  select.options[select.selectedIndex].disabled = true;
  select.value = '';
}

// Event delegation for dynamic elements
document.addEventListener('click', function(e) {
  if (e.target.closest('.remove-skill-btn')) {
    const serviceId = e.target.closest('button').dataset.serviceId;
    removeSkill(serviceId);
  }
});

function removeSkill(serviceId) {
  // Remove hidden input
  const hiddenInputs = document.querySelectorAll(`input[name="services[]"][value="${serviceId}"]`);
  hiddenInputs.forEach(input => input.remove());

  // Remove visual chip
  const chip = document.querySelector(`.skill-chip[data-service-id="${serviceId}"]`);
  if (chip) chip.remove();


  // Re-enable select option
  const option = document.querySelector(`#newSkill option[value="${serviceId}"]`);
  if (option) option.disabled = false;
}

// Form Submission
document
  .getElementById("editProfileForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Mabadiliko yamehifadhiwa kikamilifu!");
    closeEditModal();
  });

// Close Modal on Outside Click
window.onclick = function (event) {
  const modal = document.getElementById("editProfileModal");
  if (event.target === modal) {
    closeEditModal();
  }
};

// Notification Functions
function toggleNotifications() {
  const dropdown = document.getElementById("notificationDropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", (event) => {
  const dropdown = document.getElementById("notificationDropdown");
  const bellButton = document.querySelector(
    '[onclick="toggleNotifications()"]'
  );

  if (!bellButton.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.style.display = "none";
  }
});

window.addEventListener("scroll", () => {
  document.getElementById("notificationDropdown").style.display = "none";
});
