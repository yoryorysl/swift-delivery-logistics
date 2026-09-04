function toggleMenu() {
    const navigation = document.getElementById("navigation");

    navigation.classList.toggle("active");
}


function trackShipment(event) {
    event.preventDefault();

    const trackingNumber =
        document.getElementById("trackingNumber").value.trim();

    const result =
        document.getElementById("trackingResult");

    if (trackingNumber === "") {
        result.innerHTML =
            "<p>Please enter a tracking number.</p>";
        return;
    }

    result.innerHTML = `
        <div style="
            margin-top:20px;
            padding:15px;
            background:#eef6ff;
            border-radius:8px;
        ">
            <strong>Tracking Number:</strong>
            ${trackingNumber}

            <br><br>

            Shipment received successfully.

            <br>

            <strong>Status:</strong> Processing
        </div>
    `;
}
