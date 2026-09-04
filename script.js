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
const shippingCalculator =
    document.getElementById("shippingCalculator");


if (shippingCalculator) {

    shippingCalculator.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const origin =
                document.getElementById("origin").value;

            const destination =
                document.getElementById("destination").value;

            const weight =
                parseFloat(
                    document.getElementById("weight").value
                );

            const method =
                document.getElementById("shippingMethod").value;


            const result =
                document.getElementById("shippingResult");


            if (
                !origin ||
                !destination ||
                !weight ||
                !method
            ) {

                result.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please complete all fields.
                        </h3>

                    </div>
                `;

                return;
            }


            if (weight <= 0) {

                result.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please enter a valid weight.
                        </h3>

                    </div>
                `;

                return;
            }


            /*
                DEMO PRICING

                These prices are for the
                website calculator demonstration.
            */

            let rate;


            if (method === "express") {

                rate = 25;

            } else if (method === "standard") {

                rate = 15;

            } else {

                rate = 10;

            }


            let distanceFee = 0;


            if (origin !== destination) {

                distanceFee = 20;

            }


            const total =
                (weight * rate) + distanceFee;


            result.innerHTML = `

                <div class="shipment-card"
                     style="margin-top:20px;">

                    <div class="shipment-header">

                        <h3>
                            Estimated Shipping Cost
                        </h3>

                        <span class="status-badge">
                            Estimate
                        </span>

                    </div>


                    <div class="shipment-info">


                        <div class="info-box">

                            <small>
                                Route
                            </small>

                            <strong>
                                ${origin} → ${destination}
                            </strong>

                        </div>


                        <div class="info-box">

                            <small>
                                Package Weight
                            </small>

                            <strong>
                                ${weight} kg
                            </strong>

                        </div>


                        <div class="info-box">

                            <small>
                                Shipping Method
                            </small>

                            <strong>
                                ${
                                    method === "express"
                                    ? "Express Delivery"
                                    : method === "standard"
                                    ? "Standard Delivery"
                                    : "Freight Shipping"
                                }
                            </strong>

                        </div>


                        <div class="info-box">

                            <small>
                                Estimated Cost
                            </small>

                            <strong>
                                $${total.toFixed(2)}
                            </strong>

                        </div>


                    </div>


                    <p>
                        This is an estimated price.
                        Final shipping costs may vary
                        depending on package dimensions,
                        destination and other factors.
                    </p>

                </div>

            `;

        }
    );

}
/* BOOKING FORM */

const bookingForm =
    document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const senderName =
                document.getElementById("senderName").value.trim();

            const recipientName =
                document.getElementById("recipientName").value.trim();

            const bookingCountry =
    document.getElementById("bookingCountry").value;

const bookingDestinationCountry =
    document.getElementById("bookingDestinationCountry").value;

const pickupAddress =
    document.getElementById("pickupAddress").value.trim();

const deliveryAddress =
    document.getElementById("deliveryAddress").value.trim();

            const packageWeight =
                parseFloat(
                    document.getElementById("packageWeight").value
                );

            const pickupDate =
                document.getElementById("pickupDate").value;

            const packageDescription =
                document.getElementById("packageDescription").value.trim();

            const bookingResult =
                document.getElementById("bookingResult");

            if (
    !senderName ||
    !recipientName ||
    !bookingCountry ||
    !bookingDestinationCountry ||
    !pickupAddress ||
    !deliveryAddress ||
    !packageWeight ||
    !pickupDate ||
    !packageDescription
) {

                bookingResult.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please complete all required fields.
                        </h3>

                    </div>
                `;

                return;
            }

            if (packageWeight <= 0) {

                bookingResult.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please enter a valid package weight.
                        </h3>

                    </div>
                `;

                return;
            }

            const referenceNumber =
                "SDL-" +
                Math.floor(
                    10000 + Math.random() * 90000
                );

            bookingResult.innerHTML = `

                <div class="booking-success">

                    <h3>
                        Shipment Booking Received ✓
                    </h3>

                    <p>
                        Thank you,
                        <strong>${senderName}</strong>.
                        Your shipment request has been
                        successfully submitted.
                    </p>

                    <p>
                        Recipient:
                        <strong>${recipientName}</strong>
                    </p>

                    <p>
                        Route:
                        <strong>
    ${pickupAddress}, ${bookingCountry}
    →
    ${deliveryAddress}, ${bookingDestinationCountry}
</strong>
                    </p>

                    <p>
                        Package Weight:
                        <strong>
                            ${packageWeight} kg
                        </strong>
                    </p>

                    <p class="booking-reference">
                        Booking Reference:
                        ${referenceNumber}
                    </p>

                    <p>
                        Please keep this reference number
                        for your records.
                    </p>

                </div>
            `;

            bookingForm.reset();

        }
    );
}
