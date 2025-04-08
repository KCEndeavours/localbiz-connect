const businesses = {
    "bimj": {
        name: "B.I.M.J Enterprise",
        description: "Handcrafted resin and paracord pieces, along with crochet handbags.",
        location: "Five Islands Village",
        contact: "(268)774-2465 or (268)774-2400",
        social: "@b.i.m.j_enterprise",
        image: "img/bimj-card.jpg",
        tags: ["Handmade"],
        reviews: []
    },
    "rkp": {
        name: "R.K.P Technical Solutions",
        description: "Specialized AC services: installation, cleaning, maintenance, and repairs.",
        location: "Antigua and Barbuda",
        contact: "+1 268 732 5098",
        social: "Instagram & Facebook: RKP Technical Solutions",
        image: "img/rkp-card.jpg",
        tags: ["Tech Services"],
        reviews: []
    }
};

let currentBusiness = null;
let selectedRating = 0;
let isLoggedIn = false;
const businessContainer = document.getElementById("business-container");

/* Initialize the script after DOM loads */
document.addEventListener("DOMContentLoaded", function () {
    setupStarRating();
    setupBusinessTags();
});


async function signup() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    if (users[username]) {
        alert("Username already exists!");
        return;
    }

    const hashed = await hashPassword(password);
    users[username] = hashed;

    alert("Signup successful! You can now log in.");
    document.getElementById("signup-modal").style.display = "none";
}



/* Search Function */
function searchBusinesses() {
    let input = document.getElementById("search-box").value.toLowerCase();
    document.querySelectorAll(".business-card").forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}

/* 🛠️ Updated Filter Function */
function filterBusinesses() {
    let selectedTag = document.getElementById("filter-tags").value.toLowerCase();

    document.querySelectorAll(".business-card").forEach(card => {
        let tags = card.getAttribute("data-tags");

        // ✅ Fix: Convert `tags` to lowercase and split into an array
        let tagList = tags ? tags.toLowerCase().split(",") : [];

        if (selectedTag === "all" || tagList.includes(selectedTag.trim())) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}


function setupBusinessTags() {
    document.querySelectorAll(".business-card").forEach(card => {
        let businessKey = card.getAttribute("onclick").match(/'([^']+)'/)[1];
        let businessTags = businesses[businessKey].tags.map(tag => tag.trim().toLowerCase()).join(",");
        card.setAttribute("data-tags", businessTags);
    });
}


/* Star Rating System */
function setupStarRating() {
    const stars = document.querySelectorAll(".rating span");

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            selectedRating = index + 1;
            updateStarColors();
        });

        star.addEventListener("mouseover", () => highlightStars(index));
        star.addEventListener("mouseout", updateStarColors);
    });

    function updateStarColors() {
        stars.forEach((star, index) => {
            star.classList.toggle("selected", index < selectedRating);
        });
    }

    function highlightStars(index) {
        stars.forEach((star, i) => {
            star.classList.toggle("selected", i <= index);
        });
    }
}

// Add New Business

document.getElementById("add-business-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get input values
    const name = document.getElementById("business-name-input").value.trim();
    const description = document.getElementById("business-description-input").value.trim();
    const location = document.getElementById("business-location-input").value.trim();
    const contact = document.getElementById("business-contact-input").value.trim();
    const social = document.getElementById("business-social-input").value.trim();
    const tags = document.getElementById("business-tags-input").value.trim().split(",");
    const logoFile = document.getElementById("business-logo-input").files[0];
    const imageFile = document.getElementById("business-image-input").files[0];

    if (!name || !description || !location || !contact || tags.length === 0) {
        alert("Please fill out all required fields!");
        return;
    }

    // Generate a unique business key
    const key = name.toLowerCase().replace(/\s+/g, "-");

    // Default images
    let logoUrl = "img/default-logo.png";
    let imageUrl = "img/default-business.jpg";

    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            logoUrl = event.target.result;
            if (imageFile) {
                processImageUpload();
            } else {
                addBusinessToDOM(key, name, description, location, contact, social, tags, logoUrl, imageUrl);
            }
        };
        reader.readAsDataURL(logoFile);
    } else if (imageFile) {
        processImageUpload();
    } else {
        addBusinessToDOM(key, name, description, location, contact, social, tags, logoUrl, imageUrl);
    }

    function processImageUpload() {
        const reader = new FileReader();
        reader.onload = function (event) {
            imageUrl = event.target.result;
            addBusinessToDOM(key, name, description, location, contact, social, tags, logoUrl, imageUrl);
        };
        reader.readAsDataURL(imageFile);
    }

    document.getElementById("add-business-form").reset();
    hideAddBusiness();
});

/* ADD NEW BUSINESS TO THE DOM */
function addBusinessToDOM(key, name, description, location, contact, social, tags, logoUrl, imageUrl) {
    businesses[key] = { name, description, location, contact, social, image: imageUrl, logo: logoUrl, tags, reviews: [] };

    const businessCard = document.createElement("div");
    businessCard.classList.add("business-card");
    
    // Convert tag array to a comma-separated string
    let tagString = tags.map(tag => tag.trim().toLowerCase()).join(",");

    businessCard.setAttribute("data-tags", tagString);
    businessCard.setAttribute("onclick", `showBusinessDetails('${key}')`);

    businessCard.innerHTML = `
        <div class="business-logo">
            <img src="${logoUrl}" alt="${name}">
        </div>
        <h3>${name}</h3>
        <p>${description}</p>
        <span class="business-tag">${tags.join(", ")}</span>
    `;

    businessContainer.appendChild(businessCard);
    setupBusinessTags();
}

/* LIVE PREVIEW FUNCTION */
document.querySelectorAll("#add-business-form input, #add-business-form textarea").forEach(input => {
    input.addEventListener("input", updatePreview);
});

function updatePreview() {
    document.getElementById("preview-name").innerText = document.getElementById("business-name-input").value || "Business Name";
    document.getElementById("preview-description").innerText = document.getElementById("business-description-input").value || "Description of the business...";
    document.getElementById("preview-tags").innerText = document.getElementById("business-tags-input").value || "Tags";
}

document.getElementById("business-logo-input").addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById("preview-logo").src = event.target.result;
    };
    reader.readAsDataURL(this.files[0]);
});



/* Display Business Details */
function showBusinessDetails(key) {
    const details = businesses[key];
    if (!details) return;

    currentBusiness = key;
    document.getElementById("business-name").innerText = details.name;
    document.getElementById("business-description").innerText = details.description;
    document.getElementById("business-location").innerText = details.location;
    document.getElementById("business-contact").innerText = details.contact;
    document.getElementById("business-social").innerText = details.social;
    document.getElementById("business-image").src = details.image;

    displayReviews();

    document.getElementById("business-details").style.display = "block";
}

/* Hide Business Details */
function hideDetails() {
    document.getElementById("business-details").style.display = "none";
}

/* Add Customer Review */
document.getElementById("review-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("reviewer-name").value.trim();
    const text = document.getElementById("review-text").value.trim();

    if (name && text && selectedRating > 0) {
        businesses[currentBusiness].reviews.push({ name, text, rating: selectedRating });
        displayReviews();

        document.getElementById("review-form").reset();
        selectedRating = 0; // Reset rating
    }
});

/* Display Customer Reviews */
function displayReviews() {
    const reviewsContainer = document.getElementById("reviews-container");
    reviewsContainer.innerHTML = "";

    businesses[currentBusiness].reviews.forEach(review => {
        reviewsContainer.innerHTML += `
            <div class="review">
                <strong>${review.name}</strong> - <span class="stars">${"★".repeat(review.rating)}</span>
                <p>${review.text}</p>
            </div>
        `;
    });
}

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
});

/* SHOW LOGIN MODAL */
function showLogin() {
    document.getElementById("login-modal").style.display = "flex";
}

/* SHOW SIGNUP MODAL */
function showSignup() {
    document.getElementById("signup-modal").style.display = "flex";
    document.getElementById("login-modal").style.display = "none";
}


/* HIDE LOGIN MODAL */
function hideLogin() {
    document.getElementById("login-modal").style.display = "none";
}

/* LOGIN FUNCTION */
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const hashed = await hashPassword(password);

    if (users[username] && users[username] === hashed) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        updateUIAfterLogin(username);
    } else {
        alert("Invalid credentials.");
    }
}


/* LOGOUT FUNCTION */
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    updateUIAfterLogout();
}

/* CHECK LOGIN STATUS */
function checkLoginStatus() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        updateUIAfterLogin(localStorage.getItem("username"));
    }
}

/* UPDATE UI AFTER LOGIN */
function updateUIAfterLogin(username) {
    isLoggedIn = true;

    document.querySelector(".login-btn").innerText = `Logout (${username})`;
    document.querySelector(".login-btn").setAttribute("onclick", "logout()");
    
    document.getElementById("add-business-btn").classList.remove("hidden");
    document.getElementById("add-business-btn").style.display = "block";
    
    document.getElementById("marketing-tips").classList.remove("hidden");
    

    hideLogin();
    alert(`Welcome, ${username}!`);
}

/* UPDATE UI AFTER LOGOUT */
function updateUIAfterLogout() {
    isLoggedIn = false;

    document.querySelector(".login-btn").innerText = "Login";
    document.querySelector(".login-btn").setAttribute("onclick", "showLogin()");
    
    document.getElementById("add-business-btn").classList.add("hidden");
    document.getElementById("add-business-btn").style.display = "none";
    
    document.getElementById("marketing-tips").classList.add("hidden");


    alert("You have been logged out.");
}

/* SHOW ADD BUSINESS MODAL */
function showAddBusiness() {
    if (!isLoggedIn) {
        alert("You must be logged in to add a business!");
        return;
    }
    document.getElementById("add-business-modal").style.display = "flex";
}

/* HIDE ADD BUSINESS MODAL */
function hideAddBusiness() {
    document.getElementById("add-business-modal").style.display = "none";
}

