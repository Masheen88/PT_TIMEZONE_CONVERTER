//catches an annoying chrome extension error and removes it from the console
const originalConsoleError = console.error;
console.error = function (message, ...optionalParams) {
  if (message.includes("content.js")) {
    return; // Ignore the message
  }
  originalConsoleError.apply(console, [message, ...optionalParams]);
};

// Function to populate the dropdown
function populateDropdown() {
  const dropdownContent = document.getElementById("dropdownContent");

  for (let i = 0; i < 24; i++) {
    const timeString = `${i.toString().padStart(2, "0")}:00`;
    const btn = document.createElement("button");
    btn.innerHTML = timeString;
    btn.onclick = function () {
      document.getElementById("time").value = timeString;
      const selectedTimeZone = document
        .getElementById("timeZone")
        .value.toUpperCase();
      document.getElementById(
        "clock"
      ).innerText = `${timeString} ${selectedTimeZone}`;
      convertTime();
    };
    // dropdownContent.appendChild(btn);
    const listOfTimes = document.getElementById("listOfTimes");
    listOfTimes.appendChild(btn);
    // console.log(dropdownContent);
  }
}

// Function to toggle the dropdown
function toggleDropdown() {
  const dropdown = document.getElementById("timeDropdown");
  if (dropdown.classList.contains("show-sidebar")) {
    dropdown.classList.remove("show-sidebar");
  } else {
    dropdown.classList.add("show-sidebar");
  }

  //set the dropdown content to 100% width
  const dropdownContent = document.getElementById("dropdownContent");
  if (dropdownContent.classList.contains("show-sidebar")) {
    dropdownContent.classList.remove("show-sidebar");
  } else {
    dropdownContent.classList.add("show-sidebar");
  }
}

// Function to close the dropdown when it loses focus
function closeDropdown() {
  const dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.style.display = "none";
}

document
  .getElementById("dropdownContent")
  .addEventListener("blur", closeDropdown);

// Function to set the default time to the nearest hour
function setDefaultTime() {
  const now = new Date();
  let hour = now.getHours();
  const minutes = now.getMinutes();

  // Round to the nearest hour
  if (minutes >= 30) {
    hour += 1;
  }

  // Handle time overflow
  if (hour === 24) {
    hour = 0;
  }

  // Format the time as HH:MM
  const defaultTime = `${hour.toString().padStart(2, "0")}:00`;

  // Set the default time
  document.getElementById("time").value = defaultTime;

  // Also set the default time zone
  const defaultTimeZone = document
    .getElementById("timeZone")
    .value.toUpperCase();

  // Display default time and time zone in the clock div
  document.getElementById(
    "clock"
  ).innerText = `${defaultTime} ${defaultTimeZone}`;

  // Convert time right after setting the default
  convertTime();
}

// New function to set the selected time zone
function setTimeZone(zone) {
  document.getElementById("timeZone").value = zone;
  const selectedTime = document.getElementById("time").value;
  document.getElementById(
    "clock"
  ).innerText = `${selectedTime} ${zone.toUpperCase()}`;
  convertTime();
}

function convertTime() {
  // Get the selected time and time zone
  const selectedTime = document.getElementById("time").value;
  const selectedTimeZone = document.getElementById("timeZone").value;

  // Parse the selected time to hours and minutes
  const [hours, minutes] = selectedTime.split(":").map(Number);

  // Initialize an array to hold the formatted time strings
  const timeStrings = [];

  // Time zone offsets in hours
  const zoneOffsets = {
    // eastern time zone
    et: 0,
    // central time zone
    ct: 1,
    // mountain time zone
    mt: 2,
    // pacific time zone
    pt: 3,
  };

  // Time zone labels
  const zoneLabels = {
    et: "ET",
    ct: "CT",
    mt: "MT",
    pt: "PT",
  };

  // Convert the time to other time zones
  for (const [zone, offset] of Object.entries(zoneOffsets)) {
    let newHour = hours + zoneOffsets[selectedTimeZone] - offset;

    // Handle time overflow and underflow
    if (newHour >= 24) {
      newHour -= 24;
    } else if (newHour < 0) {
      newHour += 24;
    }

    // Determine AM or PM
    let amPm = "am";
    if (newHour >= 12) {
      amPm = "pm";
      if (newHour > 12) newHour -= 12;
    } else if (newHour === 0) {
      newHour = 12;
    }

    // Format the time as h:mma Z
    const formattedTime = `${newHour}:${minutes
      .toString()
      .padStart(2, "0")}${amPm} ${zoneLabels[zone]}`;

    // Check if this time zone is the selected time zone
    if (zone === selectedTimeZone) {
      timeStrings.push(`<span class="highlight">${formattedTime}</span>`);
    } else {
      timeStrings.push(formattedTime);
    }
  }

  // Join the array into a single string and display it
  const outputString = timeStrings.join(" | ");
  document.getElementById("output").innerHTML = outputString; // Note: using innerHTML instead of innerText
}
// Function to run when the window loads
function onLoadActions() {
  setDefaultTime();
  populateDropdown();
  copyTimeToClipboard();
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get the default time zone
  const defaultTimeZone = document
    .getElementById("timeZone")
    .value.toUpperCase();

  // Update the clock div
  document.getElementById(
    "clock"
  ).innerText = `${timeString} ${defaultTimeZone}`;
}

function copyTimeToClipboard() {
  //Copy the text inside <p id="output"></p> to clipboard when clicking on id: output and display a helper message when successful
  //The tooltip should be a popup that disappears after 2 seconds

  const copyText = document.getElementById("output");
  copyText.addEventListener("click", function () {
    const textArea = document.createElement("textarea");
    textArea.value = copyText.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    /*
   <div id="tooltip" class="hidden">
      <div id="tooltipText"></div>
*/
    const tooltip = document.getElementById("tooltip");
    tooltip.classList.remove("hidden");
    tooltip.classList.add("show");
    setTimeout(function () {
      tooltip.classList.remove("show");
      tooltip.classList.add("hidden");
    }, 1000);
  });
}

// Initialize the clock and set interval to update every second
updateClock();
// setInterval(updateClock, 1000);

// Add event listeners to the input fields
document.getElementById("time").addEventListener("change", convertTime);
document.getElementById("timeZone").addEventListener("change", convertTime);

// Call onLoadActions when the page loads
window.onload = onLoadActions;
