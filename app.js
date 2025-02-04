document.addEventListener("DOMContentLoaded", async () => {
    const searchBar = document.getElementById("searchBar");
    const emailList = document.getElementById("emailList");
    const emailChartCanvas = document.getElementById("emailChart");
    const filterContainer = document.getElementById("filterContainer");

    const response = await fetch("data.json");
    const data = await response.json();
    let emails = data.addresses;

    function countEmailProviders(emails) {
        const providerCounts = {};
        let otherDomains = [];
        let otherCount = 0;

        emails.forEach(email => {
            const domain = email.split("@")[1];
            providerCounts[domain] = (providerCounts[domain] || 0) + 1;
        });

        const filteredCounts = {};
        Object.keys(providerCounts).forEach(domain => {
            if (providerCounts[domain] >= 2) {
                filteredCounts[domain] = providerCounts[domain];
            } else {
                otherCount += providerCounts[domain];
                otherDomains.push(domain);
            }
        });

        if (otherCount > 0) {
            filteredCounts["Other"] = otherCount;
        }

        return { counts: filteredCounts, otherDomains: otherDomains };
    }

    function createProviderCheckboxes(emailData) {
        filterContainer.innerHTML = "";

        const { counts, otherDomains } = countEmailProviders(emailData);

        Object.keys(counts).forEach(provider => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" class="providerCheckbox" value="${provider}" checked> ${provider}`;
            filterContainer.appendChild(label);
            filterContainer.appendChild(document.createElement("br"));
        });

        if (otherDomains.length > 0) {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" class="providerCheckbox" value="Other" checked> Other`;
            filterContainer.appendChild(label);
            filterContainer.appendChild(document.createElement("br"));
        }
    }

    function displayEmails(filteredEmails) {
        emailList.innerHTML = "";
        filteredEmails.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            emailList.appendChild(li);
        });
    }

    function createEmailChart(providerCounts) {
        const ctx = emailChartCanvas.getContext("2d");

        if (window.emailChart instanceof Chart) {
            window.emailChart.destroy();
        }

        window.emailChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(providerCounts),
                datasets: [{
                    data: Object.values(providerCounts),
                    backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#8d6e63"],
                }]
            }
        });
    }

    function updateView() {
        const searchTerm = searchBar.value.toLowerCase();
        const selectedProviders = Array.from(document.querySelectorAll(".providerCheckbox:checked"))
                                       .map(checkbox => checkbox.value);

        const { counts, otherDomains } = countEmailProviders(emails);

        const filteredEmails = emails.filter(email => {
            const domain = email.split("@")[1];
            if (selectedProviders.includes("Other") && otherDomains.includes(domain)) {
                return email.toLowerCase().includes(searchTerm);
            }
            return email.toLowerCase().includes(searchTerm) && selectedProviders.includes(domain);
        });

        displayEmails(filteredEmails);
        createEmailChart(countEmailProviders(filteredEmails).counts);
    }

    createProviderCheckboxes(emails);

    displayEmails(emails);
    createEmailChart(countEmailProviders(emails).counts);

    searchBar.addEventListener("input", updateView);
    filterContainer.addEventListener("change", updateView);
});
