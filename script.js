/* =========================================================
   SWIFT DELIVERY LOGISTICS
   Main Website JavaScript
   ========================================================= */


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMenu() {
    const navigation = document.getElementById("navigation");

    if (navigation) {
        navigation.classList.toggle("active");
    }
}


/* Close mobile menu when a navigation link is clicked */

document.querySelectorAll("#navigation a").forEach(function(link) {
    link.addEventListener("click", function() {
        const navigation = document.getElementById("navigation");

        if (navigation) {
            navigation.classList.remove("active");
        }
    });
});


/* =========================================================
   SECURITY HELPER
   ========================================================= */

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SHIPMENT TRACKING
   ========================================================= */

/*
   IMPORTANT:

   No fake customer or shipment records are stored here.

   Real shipment information should later come from the
   company's actual shipment database/backend.

   Expected shipment information:

   - Tracking Number
   - Shipment ID
   - Pickup Date
   - Estimated Delivery Date
   - Origin
   - Destination
   - Package Weight
   - Current Location
   - Shipment Status
*/

function trackShipment(event) {

    event.preventDefault();

    const trackingInput =
        document.getElementById("trackingNumber");

    const result =
        document.getElementById("trackingResult");

    if (!trackingInput || !result) {
        return;
    }

    const trackingNumber =
        trackingInput.value.trim().toUpperCase();


    if (!trackingNumber) {

        result.innerHTML = `
            <div class="tracking-result">
                <div class="shipment-card">
                    <h3>Please enter a tracking number.</h3>
                    <p>
                        Enter your shipment tracking number
                        to check its current status.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    /*
       Real shipment database will be connected here later.

       Do NOT add customer shipment information here unless
       it has been provided by Swift Delivery Logistics.
    */

    const shipments = {};


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
                        <strong>${escapeHTML(trackingNumber)}</strong>.
                    </p>

                    <p>
                        Please check your tracking number and
                        try again. If you need assistance,
                        please contact Swift Delivery Logistics.
                    </p>

                </div>

            </div>
        `;

        return;
    }


    const steps = [
        "Label Created",
        "Picked Up",
        "In Transit",
        "Arrived at Facility",
        "Out for Delivery",
        "Delivered"
    ];


    let timelineHTML = "";


    steps.forEach(function(stepName, index) {

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

                <h4>
                    ${escapeHTML(stepName)}
                </h4>

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
                        ${escapeHTML(shipment.status)}
                    </span>

                </div>


                <div class="shipment-info">

                    <div class="info-box">
                        <small>Tracking Number</small>
                        <strong>
                            ${escapeHTML(trackingNumber)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Shipment ID</small>
                        <strong>
                            ${escapeHTML(shipment.shipmentId)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Pickup Date</small>
                        <strong>
                            ${escapeHTML(shipment.pickupDate)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Estimated Delivery</small>
                        <strong>
                            ${escapeHTML(shipment.deliveryDate)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Origin</small>
                        <strong>
                            ${escapeHTML(shipment.origin)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Destination</small>
                        <strong>
                            ${escapeHTML(shipment.destination)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Package Weight</small>
                        <strong>
                            ${escapeHTML(shipment.weight)}
                        </strong>
                    </div>


                    <div class="info-box">
                        <small>Current Location</small>
                        <strong>
                            ${escapeHTML(shipment.location)}
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


/* =========================================================
   FORM SUBMISSION HELPER
   ========================================================= */

async function submitToFormspree(formData, resultElement, button) {

    const endpoint =
        "https://formspree.io/f/xeaqljvk";


    if (button) {
        button.disabled = true;
        button.dataset.originalText =
            button.textContent;

        button.textContent = "Sending...";
    }


    try {

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: formData
        });


        const data = await response.json();


        if (response.ok) {

            resultElement.innerHTML = `
                <div class="booking-success">

                    <h3>
                        Request Sent Successfully ✓
                    </h3>

                    <p>
                        Thank you. Your request has been
                        sent to Swift Delivery Logistics.
                    </p>

                    <p>
                        Our team will review the information
                        provided and contact you regarding
                        the next steps.
                    </p>

                </div>
            `;

            return true;

        } else {

            throw new Error(
                data.error ||
                "Unable to send request."
            );
        }

    } catch (error) {

        resultElement.innerHTML = `
            <div class="shipment-card"
                 style="margin-top:20px;">

                <h3>
                    Unable to send request
                </h3>

                <p>
                    Something went wrong while sending
                    your request. Please try again or
                    contact Swift Delivery Logistics
                    directly.
                </p>

            </div>
        `;

        return false;

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                button.dataset.originalText ||
                "Submit";
        }
    }
}


/* =========================================================
   BOOKING FORM
   ========================================================= */

const bookingForm =
    document.getElementById("bookingForm");


if (bookingForm) {

    const pickupDate =
        document.getElementById("pickupDate");


    /*
       Prevent users from selecting a date in the past.
    */

    if (pickupDate) {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1)
            .padStart(2, "0");

        const day =
            String(today.getDate())
            .padStart(2, "0");

        pickupDate.min =
            `${year}-${month}-${day}`;
    }


    bookingForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const senderName =
                document.getElementById("senderName")
                ?.value.trim();

            const senderPhone =
                document.getElementById("senderPhone")
                ?.value.trim();

            const recipientName =
                document.getElementById("recipientName")
                ?.value.trim();

            const recipientPhone =
                document.getElementById("recipientPhone")
                ?.value.trim();

            const bookingCountry =
                document.getElementById("bookingCountry")
                ?.value.trim();

            const pickupAddress =
                document.getElementById("pickupAddress")
                ?.value.trim();

            const bookingDestinationCountry =
                document.getElementById(
                    "bookingDestinationCountry"
                )
                ?.value.trim();

            const deliveryAddress =
                document.getElementById("deliveryAddress")
                ?.value.trim();

            const packageWeight =
                document.getElementById("packageWeight")
                ?.value.trim();

            const packageDimensions =
                document.getElementById("packageDimensions")
                ?.value.trim();

            const shippingMethod =
                document.getElementById("shippingMethod")
                ?.value;

            const deliveryDate =
                document.getElementById("pickupDate")
                ?.value;

            const packageDescription =
                document.getElementById("packageDescription")
                ?.value.trim();

            const paymentMethod =
                document.getElementById("paymentMethod")
                ?.value;

            const bookingResult =
                document.getElementById("bookingResult");


            if (!bookingResult) {
                return;
            }


            if (
                !senderName ||
                !senderPhone ||
                !recipientName ||
                !recipientPhone ||
                !bookingCountry ||
                !pickupAddress ||
                !bookingDestinationCountry ||
                !deliveryAddress ||
                !packageWeight ||
                !packageDimensions ||
                !shippingMethod ||
                !deliveryDate ||
                !packageDescription ||
                !paymentMethod
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


            if (
                isNaN(Number(packageWeight)) ||
                Number(packageWeight) <= 0
            ) {

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


            const submitButton =
                bookingForm.querySelector(".btn");


            const formData =
                new FormData();

            formData.append(
                "_subject",
                "Swift Delivery Logistics - Shipment Booking Request"
            );

            formData.append(
                "form_type",
                "Shipment Booking"
            );

            formData.append(
                "sender_name",
                senderName
            );

            formData.append(
                "sender_phone",
                senderPhone
            );

            formData.append(
                "recipient_name",
                recipientName
            );

            formData.append(
                "recipient_phone",
                recipientPhone
            );

            formData.append(
                "pickup_country",
                bookingCountry
            );

            formData.append(
                "pickup_location",
                pickupAddress
            );

            formData.append(
                "destination_country",
                bookingDestinationCountry
            );

            formData.append(
                "delivery_address",
                deliveryAddress
            );

            formData.append(
                "package_weight",
                `${packageWeight} kg`
            );

            formData.append(
                "package_dimensions",
                packageDimensions
            );

            formData.append(
                "shipping_method",
                shippingMethod
            );

            formData.append(
                "preferred_delivery_date",
                deliveryDate
            );

            formData.append(
                "package_description",
                packageDescription
            );

            formData.append(
                "payment_method",
                paymentMethod
            );


            const success =
                await submitToFormspree(
                    formData,
                    bookingResult,
                    submitButton
                );


            if (success) {
                bookingForm.reset();
            }

        }
    );
}


/* =========================================================
   FAQ ACCORDION
   ========================================================= */

const faqQuestions =
    document.querySelectorAll(".faq-question");


faqQuestions.forEach(function(question) {

    question.addEventListener(
        "click",
        function() {

            const currentItem =
                question.parentElement;


            document
                .querySelectorAll(".faq-item")
                .forEach(function(item) {

                    if (item !== currentItem) {
                        item.classList.remove("active");
                    }

                });


            currentItem.classList.toggle("active");

        }
    );

});


/* =========================================================
   QUOTE REQUEST
   ========================================================= */

const quoteForm =
    document.getElementById("quoteForm");


if (quoteForm) {

    quoteForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById("quoteName")
                ?.value.trim();

            const email =
                document.getElementById("quoteEmail")
                ?.value.trim();

            const phone =
                document.getElementById("quotePhone")
                ?.value.trim();

            const weight =
                document.getElementById("quoteWeight")
                ?.value.trim();

            const dimensions =
                document.getElementById("quoteDimensions")
                ?.value.trim();

            const origin =
                document.getElementById("quoteOrigin")
                ?.value.trim();

            const destination =
                document.getElementById("quoteDestination")
                ?.value.trim();

            const packageType =
                document.getElementById("packageType")
                ?.value;

            const method =
                document.getElementById("quoteMethod")
                ?.value;

            const notes =
                document.getElementById("quoteNotes")
                ?.value.trim();

            const result =
                document.getElementById("quoteResult");


            if (!result) {
                return;
            }


            if (
                !name ||
                !email ||
                !phone ||
                !weight ||
                !dimensions ||
                !origin ||
                !destination ||
                !packageType ||
                !method
            ) {

                result.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please complete all required fields.
                        </h3>

                    </div>
                `;

                return;
            }


            if (
                isNaN(Number(weight)) ||
                Number(weight) <= 0
            ) {

                result.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please enter a valid package weight.
                        </h3>

                    </div>
                `;

                return;
            }


            const submitButton =
                quoteForm.querySelector(".btn");


            const formData =
                new FormData();


            formData.append(
                "_subject",
                "Swift Delivery Logistics - Quote Request"
            );

            formData.append(
                "form_type",
                "Quote Request"
            );

            formData.append(
                "name",
                name
            );

            formData.append(
                "email",
                email
            );

            formData.append(
                "phone",
                phone
            );

            formData.append(
                "package_weight",
                `${weight} kg`
            );

            formData.append(
                "package_dimensions",
                dimensions
            );

            formData.append(
                "origin",
                origin
            );

            formData.append(
                "destination",
                destination
            );

            formData.append(
                "package_type",
                packageType
            );

            formData.append(
                "shipping_method",
                method
            );

            formData.append(
                "additional_information",
                notes || "None provided"
            );


            const success =
                await submitToFormspree(
                    formData,
                    result,
                    submitButton
                );


            if (success) {
                quoteForm.reset();
            }

        }
    );
}


/* =========================================================
   CONTACT FORM
   ========================================================= */

const contactForm =
    document.getElementById("contactForm");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById("contactName")
                ?.value.trim();

            const email =
                document.getElementById("contactEmail")
                ?.value.trim();

            const phone =
                document.getElementById("contactPhone")
                ?.value.trim();

            const message =
                document.getElementById("contactMessage")
                ?.value.trim();

            const result =
                document.getElementById("contactResult");


            if (!result) {
                return;
            }


            if (
                !name ||
                !email ||
                !message
            ) {

                result.innerHTML = `
                    <div class="shipment-card"
                         style="margin-top:20px;">

                        <h3>
                            Please complete the required fields.
                        </h3>

                    </div>
                `;

                return;
            }


            const submitButton =
                contactForm.querySelector(".btn");


            const formData =
                new FormData();


            formData.append(
                "_subject",
                "Swift Delivery Logistics - Contact Message"
            );

            formData.append(
                "form_type",
                "Contact Message"
            );

            formData.append(
                "name",
                name
            );

            formData.append(
                "email",
                email
            );

            formData.append(
                "phone",
                phone || "Not provided"
            );

            formData.append(
                "message",
                message
            );


            const success =
                await submitToFormspree(
                    formData,
                    result,
                    submitButton
                );


            if (success) {
                contactForm.reset();
            }

        }
    );
}
