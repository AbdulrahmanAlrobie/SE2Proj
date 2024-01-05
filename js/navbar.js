import { auth, db } from "../js/auth.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const userInfo = document.getElementById("user-info");
// Check if the user's name is stored in localStorage
const storedName = localStorage.getItem("userDisplayName");

if (storedName) {
  // If the user's name is stored, use it
  userInfo.innerHTML = `
         <a href="account.html" id="account">${storedName}</a>
         <button id="sign-out-btn" class="link-navbar">Sign out</button>
     `;
} else {
  // If the user's name is not stored, show the default state
  userInfo.innerHTML = `
         <a href="auth.html?form=login" id="log-in">Log in</a>
         <button id="sign-up-btn" class="link-navbar" onclick="window.location.href ='auth.html?form=signup'">Sign up</button>
     `;
}

// Add event listener for the "Sign out" button using event delegation
userInfo.addEventListener("click", function (event) {
  if (event.target.id === "sign-out-btn") {
    auth
      .signOut()
      .then(() => {
        // Clear the user's name from localStorage when they sign out
        localStorage.removeItem("userDisplayName");
        location.reload();
      })
      .catch((error) => {
        alert(error.message);
      });
  }
});

auth.onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    const userRef = ref(db, "users/" + user.uid);

    // Listen for changes in the user's data
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const userDisplayName = data.displayName;

      // Store the user's name in localStorage
      localStorage.setItem("userDisplayName", userDisplayName);

      // Update the UI
      userInfo.innerHTML = `
        <a href="account.html" id="account">${userDisplayName}</a>
        <button id="sign-out-btn" class="link-navbar">Sign out</button>
      `;
    });
  } else {
    // User is not signed in.

    userInfo.innerHTML = `
        <a href="auth.html?form=login" id="log-in">Log in</a>
        <button id="sign-up-btn" class="link-navbar" onclick="window.location.href ='auth.html?form=signup'">Sign up</button>
      `;
  }
});
