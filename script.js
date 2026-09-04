function toggleMenu() {
    const navigation = document.getElementById("navigation");
    navigation.classList.toggle("active");
}


function trackShipment(event) {
    event.preventDefault();

    const trackingNumber =
        document.getElementById("trackingNumber")
        .value
        .trim()
        .toUpperCase();

    const result =
        document.getElementById("trackingResult");


    if (trackingNumber === "") {

        result.innerHTML = `
            <div class="tracking-result">

                <div class="shipment-card">

                    <h3>Please enter a tracking number.</h3>

                </div>

            </div>
        `;

        return;
    }


    /*
        DEMO SHIPMENT DATABASE

        These are sample shipments.
        Later we will connect this
        to a real database.
    */

    const shipments = {

        "SDL-10001": {
            recipient: "John Anderson",
            origin: "Lagos, Nigeria",
            destination: "London, United Kingdom",
            location: "London Distribution Center",
            status: "In Transit",
            delivery: "September 8, 2026",
            step: 3
        },

        "SDL-10002": {
            recipient: "Sarah Williams",
            origin: "Abuja, Nigeria",
            destination: "New York, USA",
            location: "New York Sorting Facility",
            status: "Out for Delivery",
            delivery: "September 5, 2026",
            step: 5
        },

        "SDL-10003": {
            recipient: "Michael Brown",
            origin: "Benin City, Nigeria",
            destination: "Toronto, Canada",
            location: "Toronto Distribution Center",
            status: "Processing",
            delivery: "September 10, 2026",
            step: 1
        },

        "SDL-10004": {
            recipient: "Emily Johnson",
            origin: "Lagos, Nigeria",
            destination: "Paris, France",
            location: "Paris Delivery Hub",
            status: "Delivered",
            delivery: "September 3, 2026",
            step: 6
        }

    };


    const shipment = shipments[trackingNumber];


    if (!shipment) {

        result.innerHTML = `
            <div class="tracking-result">

                <div class="shipment-card">

                    <div class="shipment-header">

                        <h3>Shipment Not Found</h3>

                    </div>

                    <p>
                        We couldn't find a shipment matching
                        <strong>${trackingNumber}</strong>.
                    </p>

                    <p>
                        Please check the tracking number
                        and try again.
                    </p>

                </div>

            </div>
        `;

        return;
    }


    const steps = [

        "Shipment Created",

        "Package Picked Up",

        "Departed Origin",

        "In Transit",

        "Out for Delivery",

        "Delivered"

    ];


    let timelineHTML = "";


    steps.forEach((stepName, index) => {

        const stepNumber = index + 1;

        let className = "";


        if (stepNumber < shipment.step) {

            className = "completed";

        } else if (stepNumber === shipment.step) {

            className = "active";

        }


        timelineHTML += `

            <div class="timeline-item ${className}">

                <div class="timeline-dot"></div>

                <h4>${stepName}</h4>

                <p>
                    ${
                        stepNumber < shipment.step
                        ? "Completed"
                        : stepNumber === shipment.step
                        ? "Current shipment status"
                        : "Pending"
                    }
                </p>

            </div>

        `;

    });


    result.innerHTML = `

        <div class="tracking-result">

            <div class="shipment-card">


                <div class="shipment-header">

                    <h3>
                        Shipment Details
                    </h3>

                    <span class="status-badge">
                        ${shipment.status}
                    </span>

                </div>


                <div class="shipment-info">


                    <div class="info-box">

                        <small>
                            Tracking Number
                        </small>

                        <strong>
                            ${trackingNumber}
                        </strong>

                    </div>


                    <div class="info-box">

                        <small>
                            Recipient
                        </small>

                        <strong>
                            ${shipment.recipient}
                        </strong>

                    </div>


                    <div class="info-box">

                        <small>
                            Origin
                        </small>

                        <strong>
                            ${shipment.origin}
                        </strong>

                    </div>


                    <div class="info-box">

                        <small>
                            Destination
                        </small>

                        <strong>
                            ${shipment.destination}
                        </strong>

                    </div>


                    <div class="info-box">

                        <small>
                            Current Location
                        </small>

                        <strong>
                            ${shipment.location}
                        </strong>

                    </div>


                    <div class="info-box">

                        <small>
                            Estimated Delivery
                        </small>

                        <strong>
                            ${shipment.delivery}
                        </strong>

                    </div>


                </div>


                <h3>
                    Shipment Progress
                </h3>


                <div class="tracking-timeline">

                    ${timelineHTML}

                </div>


            </div>

        </div>

    `;
}
