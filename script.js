/* =========================================================
   SWIFT DELIVERY LOGISTICS
   PREMIUM UI / UX + 3D INTERACTION SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     MOBILE NAVIGATION
  ======================================================= */

  const navigation = document.getElementById("navigation");
  const menuToggle = document.querySelector(".menu-toggle");

  window.toggleMenu = function () {
    if (!navigation) return;

    navigation.classList.toggle("active");

    if (menuToggle) {
      menuToggle.setAttribute(
        "aria-expanded",
        navigation.classList.contains("active")
      );
    }
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navigation?.classList.remove("active");

      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });


  /* =======================================================
     HEADER SCROLL EFFECT
  ======================================================= */

  const header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 30);
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();


  /* =======================================================
     SCROLL PROGRESS BAR
  ======================================================= */

  const progress = document.createElement("div");

  progress.className = "scroll-progress";

  progress.innerHTML = "<span></span>";

  document.body.prepend(progress);

  const progressBar = progress.querySelector("span");

  function updateScrollProgress() {

    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop;

    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const percentage =
      scrollHeight > 0
        ? (scrollTop / scrollHeight) * 100
        : 0;

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true
  });

  updateScrollProgress();


  /* =======================================================
     HERO 3D SYSTEM
  ======================================================= */

  function createHero3D() {

    const hero = document.querySelector(".hero");

    if (!hero) return;

    if (hero.querySelector(".hero-3d")) return;

    const visual = document.createElement("div");

    visual.className = "hero-3d";

    visual.setAttribute("aria-hidden", "true");

    visual.innerHTML = `
      <div class="hero-orbit orbit-one"></div>
      <div class="hero-orbit orbit-two"></div>
      <div class="hero-orbit orbit-three"></div>

      <div class="hero-route-line route-one"></div>
      <div class="hero-route-line route-two"></div>

      <div class="hero-node node-one"></div>
      <div class="hero-node node-two"></div>
      <div class="hero-node node-three"></div>
      <div class="hero-node node-four"></div>

      <div class="hero-cube">
        <div class="cube-face cube-front">SDL</div>
        <div class="cube-face cube-back">SDL</div>
        <div class="cube-face cube-right">→</div>
        <div class="cube-face cube-left">←</div>
        <div class="cube-face cube-top">✦</div>
        <div class="cube-face cube-bottom"></div>
      </div>

      <div class="hero-network-card">
        <div class="network-status">
          <i></i>
          LOGISTICS NETWORK
        </div>

        <strong>Global Route System</strong>

        <small>
          Connecting shipments across destinations
        </small>

        <div class="network-route">
          <span></span>
          <i></i>
          <span></span>
        </div>
      </div>
    `;

    hero.appendChild(visual);
  }

  createHero3D();


  /* =======================================================
     HERO PARALLAX
  ======================================================= */

  const hero = document.querySelector(".hero");
  const hero3D = document.querySelector(".hero-3d");

  if (
    hero &&
    hero3D &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {

    hero.addEventListener("pointermove", event => {

      const rect = hero.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        rect.width;

      const y =
        (event.clientY - rect.top) /
        rect.height;

      const moveX = (x - 0.5) * 35;
      const moveY = (y - 0.5) * 25;

      hero3D.style.setProperty(
        "--hero-x",
        `${moveX}px`
      );

      hero3D.style.setProperty(
        "--hero-y",
        `${moveY}px`
      );
    });

    hero.addEventListener("pointerleave", () => {

      hero3D.style.setProperty(
        "--hero-x",
        "0px"
      );

      hero3D.style.setProperty(
        "--hero-y",
        "0px"
      );
    });
  }


  /* =======================================================
     CURSOR GLOW
  ======================================================= */

  if (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {

    document.addEventListener("pointermove", event => {

      document.body.style.setProperty(
        "--cursor-x",
        `${event.clientX}px`
      );

      document.body.style.setProperty(
        "--cursor-y",
        `${event.clientY}px`
      );
    });
  }


  /* =======================================================
     SCROLL REVEAL SYSTEM
  ======================================================= */

  const revealSelectors = [
    ".section-heading",
    ".tracking-box",
    ".rate-card",
    ".form-shell",
    ".service-card",
    ".why-card",
    ".about-image-wrap",
    ".about-content",
    ".payment-method",
    ".faq-item",
    ".quote-content",
    ".quote-form-wrap",
    ".contact-detail",
    ".contact-form-shell"
  ];

  revealSelectors.forEach(selector => {

    document.querySelectorAll(selector).forEach(element => {

      if (!element.classList.contains("reveal")) {
        element.classList.add("reveal");
      }
    });
  });


  const revealElements =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add("revealed");

              revealObserver.unobserve(
                entry.target
              );
            }
          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("revealed");
    });
  }


  /* =======================================================
     STAGGER CARD ANIMATIONS
  ======================================================= */

  const staggerGroups = [
    ".rates-grid",
    ".services-grid",
    ".why-grid",
    ".payment-grid",
    ".contact-details"
  ];

  staggerGroups.forEach(selector => {

    const group =
      document.querySelector(selector);

    if (!group) return;

    Array.from(group.children).forEach(
      (child, index) => {

        child.style.transitionDelay =
          `${index * 70}ms`;
      }
    );
  });


  /* =======================================================
     3D CARD TILT
  ======================================================= */

  const tiltSelectors = [
    ".service-card",
    ".rate-card",
    ".why-card",
    ".payment-method",
    ".quick-action",
    ".contact-detail",
    ".tracking-box"
  ];

  function enableTilt() {

    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    tiltSelectors.forEach(selector => {

      document.querySelectorAll(selector).forEach(card => {

        if (card.dataset.tiltReady === "true") {
          return;
        }

        card.dataset.tiltReady = "true";

        card.classList.add("tilt-card");

        card.addEventListener("pointermove", event => {

          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX - rect.left) /
            rect.width;

          const y =
            (event.clientY - rect.top) /
            rect.height;

          const rotateY =
            (x - 0.5) * 7;

          const rotateX =
            (0.5 - y) * 7;

          card.style.setProperty(
            "--rx",
            `${rotateX}deg`
          );

          card.style.setProperty(
            "--ry",
            `${rotateY}deg`
          );
        });

        card.addEventListener("pointerleave", () => {

          card.style.setProperty(
            "--rx",
            "0deg"
          );

          card.style.setProperty(
            "--ry",
            "0deg"
          );
        });
      });
    });
  }

  enableTilt();


  /* =======================================================
     TRACKING SYSTEM
  ======================================================= */

  window.trackShipment = function (event) {

    event.preventDefault();

    const input =
      document.getElementById("trackingNumber");

    const result =
      document.getElementById("trackingResult");

    if (!input || !result) return;

    const trackingNumber =
      input.value.trim().toUpperCase();

    if (!trackingNumber) {

      result.innerHTML = `
        <div class="tracking-error">
          Please enter a tracking number.
        </div>
      `;

      return;
    }


    /*
      IMPORTANT:
      No fake shipment records are created here.

      Real shipment data can be connected later
      through a database/API.
    */

    const shipments = {};


    if (!shipments[trackingNumber]) {

      result.innerHTML = `
        <div class="tracking-error">
          <strong>Shipment Not Found</strong>
          <p>
            We could not find a shipment matching
            <strong>${escapeHTML(trackingNumber)}</strong>.
            Please check the tracking number and try again.
          </p>
        </div>
      `;

      return;
    }


    const shipment =
      shipments[trackingNumber];


    const steps = [
      "Label Created",
      "Picked Up",
      "In Transit",
      "Arrived at Facility",
      "Out for Delivery",
      "Delivered"
    ];


    const currentStep =
      shipment.currentStep ?? 0;


    const timeline =
      steps.map((step, index) => {

        const active =
          index <= currentStep
            ? "active"
            : "";

        return `
          <div class="tracking-step ${active}">
            <span class="tracking-step-dot"></span>
            <span>${escapeHTML(step)}</span>
          </div>
        `;
      }).join("");


    result.innerHTML = `
      <div class="tracking-success">

        <h3>
          ${escapeHTML(shipment.status || "Shipment Update")}
        </h3>

        <p>
          Tracking number:
          <strong>${escapeHTML(trackingNumber)}</strong>
        </p>

        <div class="tracking-timeline">
          ${timeline}
        </div>

      </div>
    `;
  };


  /* =======================================================
     HTML ESCAPING
  ======================================================= */

  window.escapeHTML = function (value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };


  /* =======================================================
     FORMSPREE
  ======================================================= */

  async function submitToFormspree(
    formData,
    resultElement,
    button
  ) {

    const endpoint =
      "https://formspree.io/f/xeaqljvk";

    const originalText =
      button ? button.innerHTML : "";

    if (button) {
      button.disabled = true;
      button.innerHTML = "Sending...";
    }

    try {

      const response =
        await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });


      if (!response.ok) {
        throw new Error(
          "Unable to submit the form."
        );
      }


      if (resultElement) {

        resultElement.innerHTML = `
          <div class="form-success">
            ✓ Thank you. Your request has been
            submitted successfully.
          </div>
        `;
      }


      return true;

    } catch (error) {

      console.error(error);

      if (resultElement) {

        resultElement.innerHTML = `
          <div class="form-error">
            Unable to submit your request right now.
            Please try again or contact us directly.
          </div>
        `;
      }

      return false;

    } finally {

      if (button) {

        button.disabled = false;

        button.innerHTML =
          originalText;
      }
    }
  }


  /* =======================================================
     BOOKING FORM
  ======================================================= */

  const bookingForm =
    document.getElementById("bookingForm");

  if (bookingForm) {

    const pickupDate =
      bookingForm.querySelector(
        'input[name="pickup_date"]'
      );

    if (pickupDate) {

      const today =
        new Date().toISOString().split("T")[0];

      pickupDate.min = today;
    }


    bookingForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const result =
          document.getElementById(
            "bookingResult"
          );

        const submitButton =
          bookingForm.querySelector(
            'button[type="submit"]'
          );


        const formData =
          new FormData(bookingForm);


        formData.append(
          "_subject",
          "New Shipment Booking Request"
        );

        formData.append(
          "form_type",
          "Shipment Booking"
        );


        const requiredFields = [
          "sender_name",
          "recipient_name",
          "pickup_address",
          "destination_address",
          "package_type",
          "weight",
          "pickup_date",
          "payment_method"
        ];


        for (const field of requiredFields) {

          const value =
            formData.get(field);

          if (!value || !String(value).trim()) {

            if (result) {

              result.innerHTML = `
                <div class="form-error">
                  Please complete all required fields.
                </div>
              `;
            }

            return;
          }
        }


        const weight =
          Number(formData.get("weight"));


        if (
          Number.isNaN(weight) ||
          weight <= 0
        ) {

          if (result) {

            result.innerHTML = `
              <div class="form-error">
                Please enter a valid package weight.
              </div>
            `;
          }

          return;
        }


        const success =
          await submitToFormspree(
            formData,
            result,
            submitButton
          );


        if (success) {
          bookingForm.reset();

          if (pickupDate) {

            const today =
              new Date()
                .toISOString()
                .split("T")[0];

            pickupDate.min = today;
          }
        }

      }
    );
  }


  /* =======================================================
     QUOTE FORM
  ======================================================= */

  const quoteForm =
    document.getElementById("quoteForm");

  if (quoteForm) {

    quoteForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const result =
          document.getElementById(
            "quoteResult"
          );

        const submitButton =
          quoteForm.querySelector(
            'button[type="submit"]'
          );


        const formData =
          new FormData(quoteForm);


        formData.append(
          "_subject",
          "New Shipping Quote Request"
        );

        formData.append(
          "form_type",
          "Quote Request"
        );


        const requiredFields = [
          "name",
          "email",
          "origin",
          "destination"
        ];


        for (const field of requiredFields) {

          const value =
            formData.get(field);

          if (!value || !String(value).trim()) {

            if (result) {

              result.innerHTML = `
                <div class="form-error">
                  Please complete all required fields.
                </div>
              `;
            }

            return;
          }
        }


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


  /* =======================================================
     CONTACT FORM
  ======================================================= */

  const contactForm =
    document.getElementById("contactForm");

  if (contactForm) {

    contactForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const result =
          document.getElementById(
            "contactResult"
          );

        const submitButton =
          contactForm.querySelector(
            'button[type="submit"]'
          );


        const formData =
          new FormData(contactForm);


        formData.append(
          "_subject",
          "New Contact Message"
        );

        formData.append(
          "form_type",
          "Contact Message"
        );


        const requiredFields = [
          "name",
          "email",
          "message"
        ];


        for (const field of requiredFields) {

          const value =
            formData.get(field);

          if (!value || !String(value).trim()) {

            if (result) {

              result.innerHTML = `
                <div class="form-error">
                  Please complete all required fields.
                </div>
              `;
            }

            return;
          }
        }


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


  /* =======================================================
     FAQ ACCORDION
  ======================================================= */

  const faqItems =
    document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {

    const question =
      item.querySelector(".faq-question");

    const answer =
      item.querySelector(".faq-answer");


    if (!question || !answer) return;


    question.setAttribute(
      "aria-expanded",
      "false"
    );


    question.addEventListener(
      "click",
      () => {

        const isActive =
          item.classList.contains("active");


        faqItems.forEach(otherItem => {

          otherItem.classList.remove("active");

          const otherQuestion =
            otherItem.querySelector(
              ".faq-question"
            );

          const otherAnswer =
            otherItem.querySelector(
              ".faq-answer"
            );

          if (otherQuestion) {

            otherQuestion.setAttribute(
              "aria-expanded",
              "false"
            );
          }

          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
          }
        });


        if (!isActive) {

          item.classList.add("active");

          question.setAttribute(
            "aria-expanded",
            "true"
          );

          answer.style.maxHeight =
            `${answer.scrollHeight}px`;
        }
      }
    );
  });


  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const sections =
    document.querySelectorAll(
      "section[id]"
    );

  const navLinks =
    document.querySelectorAll(
      ".nav-link"
    );


  if ("IntersectionObserver" in window) {

    const sectionObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }

            const id =
              entry.target.getAttribute("id");

            navLinks.forEach(link => {

              const href =
                link.getAttribute("href");

              link.classList.toggle(
                "active",
                href === `#${id}`
              );
            });

          });

        },
        {
          rootMargin:
            "-35% 0px -55% 0px"
        }
      );


    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }


  /* =======================================================
     BACK TO TOP
  ======================================================= */

  const backToTop =
    document.createElement("button");

  backToTop.className =
    "back-to-top";

  backToTop.type = "button";

  backToTop.setAttribute(
    "aria-label",
    "Back to top"
  );

  backToTop.innerHTML = "↑";

  document.body.appendChild(backToTop);


  function updateBackToTop() {

    backToTop.classList.toggle(
      "show",
      window.scrollY > 700
    );
  }


  window.addEventListener(
    "scroll",
    updateBackToTop,
    {
      passive: true
    }
  );


  backToTop.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );


  updateBackToTop();


  /* =======================================================
     BUTTON MICRO-INTERACTION
  ======================================================= */

  document.querySelectorAll(".btn").forEach(button => {

    button.addEventListener(
      "pointerdown",
      () => {
        button.style.transform =
          "translateY(1px) scale(.98)";
      }
    );

    button.addEventListener(
      "pointerup",
      () => {
        button.style.transform = "";
      }
    );

    button.addEventListener(
      "pointerleave",
      () => {
        button.style.transform = "";
      }
    );
  });


  /* =======================================================
     IMAGE LOADING POLISH
  ======================================================= */

  document.querySelectorAll("img").forEach(img => {

    img.addEventListener(
      "load",
      () => {
        img.classList.add("loaded");
      },
      {
        once: true
      }
    );
  });


  /* =======================================================
     PREVENT EMPTY HASH JUMP
  ======================================================= */

  document.querySelectorAll(
    'a[href="#"]'
  ).forEach(link => {

    link.addEventListener(
      "click",
      event => {
        event.preventDefault();
      }
    );
  });


  /* =======================================================
     RE-CALCULATE TILT AFTER DYNAMIC CONTENT
  ======================================================= */

  setTimeout(() => {
    enableTilt();
  }, 500);


  /* =======================================================
     RESIZE HANDLING
  ======================================================= */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);

      resizeTimer =
        setTimeout(() => {

          const activeFAQ =
            document.querySelector(
              ".faq-item.active .faq-answer"
            );

          if (activeFAQ) {
            activeFAQ.style.maxHeight =
              `${activeFAQ.scrollHeight}px`;
          }

        }, 150);
    }
  );


  /* =======================================================
     INITIALIZATION COMPLETE
  ======================================================= */

  document.body.classList.add(
    "js-ready"
  );

});
