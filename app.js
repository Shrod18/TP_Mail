document.addEventListener("DOMContentLoaded", async () => {
    const searchBar = document.getElementById("searchBar");
    const emailList = document.getElementById("emailList");
    const emailChartCanvas = document.getElementById("emailChart");
    const filterContainer = document.getElementById("filterContainer");

    // Charger les emails
    const response = await fetch("data.json");
    const data = await response.json();
    let emails = data.addresses;

    // Fonction pour extraire les serveurs mail uniques
    function getEmailProviders(emails) {
        const providers = {};
        emails.forEach(email => {
            const domain = email.split("@")[1];
            providers[domain] = (providers[domain] || 0) + 1;
        });
        return Object.keys(providers);
    }

    // Générer les checkboxes pour chaque serveur
    function createProviderCheckboxes(providers) {
        filterContainer.innerHTML = ""; // Réinitialiser

        providers.forEach(provider => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" class="providerCheckbox" value="${provider}" checked> ${provider}`;
            filterContainer.appendChild(label);
            filterContainer.appendChild(document.createElement("br"));
        });
    }

    // Fonction pour afficher les emails filtrés
    function displayEmails(filteredEmails) {
        emailList.innerHTML = "";
        filteredEmails.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            emailList.appendChild(li);
        });
    }

    // Fonction pour compter les occurrences des serveurs mail et regrouper les petits sous "Other"
    function countEmailProviders(emails) {
        const providerCounts = {};
        let otherCount = 0;

        // Comptage des occurrences
        emails.forEach(email => {
            const domain = email.split("@")[1];
            providerCounts[domain] = (providerCounts[domain] || 0) + 1;
        });

        // Création d'un nouvel objet où les petits serveurs sont regroupés
        const filteredCounts = {};
        Object.keys(providerCounts).forEach(domain => {
            if (providerCounts[domain] >= 2) {
                filteredCounts[domain] = providerCounts[domain];
            } else {
                otherCount += providerCounts[domain];
            }
        });

        if (otherCount > 0) {
            filteredCounts["Other"] = otherCount;
        }

        return filteredCounts;
    }

    // Fonction pour générer le graphique
    function createEmailChart(providerCounts) {
        const ctx = emailChartCanvas.getContext("2d");

        // Supprimer l'ancien graphique si existant
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

    // Fonction pour mettre à jour la liste et le graphique en fonction de la recherche et des checkboxes
    function updateView() {
        const searchTerm = searchBar.value.toLowerCase();
        const selectedProviders = Array.from(document.querySelectorAll(".providerCheckbox:checked"))
                                       .map(checkbox => checkbox.value);

        // Filtrage des emails selon la recherche et les checkboxes cochées
        const filteredEmails = emails.filter(email => {
            const domain = email.split("@")[1];
            return email.toLowerCase().includes(searchTerm) && selectedProviders.includes(domain);
        });

        displayEmails(filteredEmails);
        createEmailChart(countEmailProviders(filteredEmails)); // Mettre à jour le graphique
    }

    // Générer les checkboxes
    createProviderCheckboxes(getEmailProviders(emails));

    // Affichage initial
    displayEmails(emails);
    createEmailChart(countEmailProviders(emails));

    // Événements pour la recherche et les filtres
    searchBar.addEventListener("input", updateView);
    filterContainer.addEventListener("change", updateView);
});
