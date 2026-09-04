function toggleMenu() {
    const navigation = document.getElementById("navigation");
    navigation.classList.toggle("active");
}


function trackShipment(event) {
    event.preventDefault();

    const trackingNumber =
        document.getElementById("trackingNumber").value.trim().toUpperCase();

    const result =
        document.getElementById("trackingResult");

    if (trackingNumber === "") {
        result.innerHTML = `
            <p style="color:#c62828;">
                Please enter a tracking number.
            </p>
        `;
        return;
    }

    /*
       DEMO SHIPMENT DATABASE

       These are sample shipments for learning.
       Later we can connect this to a real database.
    */

    const shipments = {

        "SDL-10001": {
            recipient: "John Anderson",
            origin: "Lagos, Nigeria",
            destination: "London, United Kingdom",
            location: "London Distribution Center",
            status: "In Transit",
            delivery: "September 8, 2026"
        },

        "SDL-10002": {
            recipient: "Sarah Williams",
            origin: "Abuja, Nigeria",
            destination: "New York, USA",
            location: "New York Sorting Facility",
            status: "Out for Delivery",
            delivery: "September 5, 2026"
        },

        "SDL-10003": {
            recipient: "Michael Brown",
            origin: "Benin City, Nigeria",
            destination: "Toronto, Canada",
            location: "Toronto Distribution Center",
            status: "Processing",
            delivery: "September 10, 2026"
        },

        "SDL-10004": {
            recipient: "Emily Johnson",
            origin: "Lagos, Nigeria",
            destination: "Paris, France",
            location: "Paris Delivery Hub",
            status: "Delivered",
            delivery: "September 3, 2026"
        }

    };


    const shipment = shipments[trackingNumber];


    if (!shipment) {

        result.innerHTML = `
            <div style="
                margin-top:20px;
                padding:20px;
                background:#fff3f3;
                border-radius:10px;
                border:1px solid #ffd1d1;
            ">

                <h3>Shipment Not Found</h3>

                <p>
                    We couldn't find a shipment matching:
                </p>

                <strong>${trackingNumber}</strong>

                <p style="margin-top:10px;">
                    Please check your tracking number and try again.
                </p>

            </div>
        `;

        return;
    }


    result.innerHTML = `

        <div style="
            margin-top:25px;
            padding:25px;
            background:white;
            border-radius:12px;
            box-shadow:0 5px 20px rgba(0,0,0,0.08);
        ">

            <h2 style="margin-bottom:15px;">
                Shipment Details
            </h2>


            <p>
                <strong>Tracking Number:</strong>
                ${trackingNumber}
            </p>


            <p>
                <strong>Recipient:</strong>
                ${shipment.recipient}
            </p>


            <p>
                <strong>Origin:</strong>
                ${shipment.origin}
            </p>


            <p>
                <strong>Destination:</strong>
                ${shipment.destination}
            </p>


            <p>
                <strong>Current Location:</strong>
                ${shipment.location}
            </p>


            <p>
                <strong>Status:</strong>

                <span style="
                    font-weight:bold;
                    color:#f5a623;
                ">
                    ${shipment.status}
                </span>

            </p>


            <p>
                <strong>Estimated Delivery:</strong>
                ${shipment.delivery}
            </p>


            <hr style="
                margin:25px 0;
                border:none;
                border-top:1px solid #ddd;
            ">


            <h3>Shipment Progress</h3>


            <div style="
                margin-top:15px;
                line-height:2;
            ">

                <div>✅ Shipment Created</div>

                <div>✅ Package Picked Up</div>

                <div>✅ Departed Origin</div>

                <div>🚚 ${shipment.status}</div>

                <div>○ Out for Delivery</div>

                <div>○ Delivered</div>

            </div>

        </div>

    `;
}
