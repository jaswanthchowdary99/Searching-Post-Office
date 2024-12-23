document.addEventListener("DOMContentLoaded", () => {
  const ipAddressSpan = document.getElementById("ipAddress");
  const ipAddressSpan2 = document.getElementById("ipAddress2");
  const latSpan = document.getElementById("lat");
  const longSpan = document.getElementById("long");
  const citySpan = document.getElementById("city");
  const regionSpan = document.getElementById("region");
  const orgSpan = document.getElementById("org");
  const hostSpan = document.getElementById("host");
  const timeZoneSpan = document.getElementById("time");
  const dateTimeSpan = document.getElementById("date");
  const pincodeSpan = document.getElementById("pin");
  const noOfPincodeSpan = document.getElementById("noOfPin");
  const getStartedButton = document.querySelector(".getStarted");

  let userIp = "";

  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      userIp = data.ip;
      ipAddressSpan.textContent = userIp;
    })
    .catch((error) => console.error("Error fetching IP address:", error));

  getStartedButton.addEventListener("click", () => {
    if (!userIp) {
      alert("IP Address not found. Please try again later.");
      return;
    }

    fetch(`https://ipapi.co/${userIp}/json/`)
      .then((response) => response.json())
      .then((data) => {
        const { latitude, longitude, city, region, org, hostname, timezone, postal } = data;
        ipAddressSpan2.textContent = userIp;
        latSpan.textContent = latitude || "N/A";
        longSpan.textContent = longitude || "N/A";
        citySpan.textContent = city || "N/A";
        regionSpan.textContent = region || "N/A";
        orgSpan.textContent = org || "N/A";
        hostSpan.textContent = hostname || "N/A";
        timeZoneSpan.textContent = timezone || "N/A";
        dateTimeSpan.textContent = new Date().toLocaleString("en-US", { timeZone: timezone }) || "N/A";
        pincodeSpan.textContent = postal || "N/A";

        if (latitude && longitude) {
          displayMap(latitude, longitude);
        }

        if (timezone) {
          displayCurrentTime(timezone);
        }

        if (postal) {
          fetch(`https://api.postalpincode.in/pincode/${postal}`)
            .then((response) => response.json())
            .then((postData) => {
              if (postData[0]?.Status === "Success") {
                const postOffices = postData[0].PostOffice;
                displayPostOffices(postOffices);
                noOfPincodeSpan.textContent = postOffices.length;
              } else {
                alert("No post offices found for your area.");
              }
            })
            .catch((error) => console.error("Error fetching post offices:", error));
        }
      })
      .catch((error) => console.error("Error fetching user information:", error));
  });

  function displayMap(lat, lng) {
    const mapContainer = document.getElementById("map");
    mapContainer.innerHTML = `<iframe
      width="100%"
      height="400"
      src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed"
      frameborder="0"
      style="border:0"
      allowfullscreen
    ></iframe>`;
  }

  function displayCurrentTime(timezone) {
    const timeContainer = document.getElementById("currentTime");
    const time = new Date().toLocaleString("en-US", { timeZone: timezone });
    timeContainer.textContent = `Current Time: ${time}`;
  }

  function displayPostOffices(postOffices) {
    const postOfficeContainer = document.getElementById("postOffices");
    const searchInput = document.getElementById("searchPostOffices");

    function renderList(filteredOffices) {
      postOfficeContainer.innerHTML = "";
      filteredOffices.forEach((office) => {
        const listItem = document.createElement("div");
        listItem.classList.add("postOfficeItem");
        listItem.innerHTML = `
          <h3>${office.Name}</h3>
          <p>Branch: ${office.BranchType}</p>
          <p>District: ${office.District}</p>
          <p>State: ${office.State}</p>
        `;
        postOfficeContainer.appendChild(listItem);
      });
    }

    renderList(postOffices);

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const filteredOffices = postOffices.filter((office) =>
        office.Name.toLowerCase().includes(query)
      );
      renderList(filteredOffices);
    });
  }
});
