// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/dbjs/10.7.1/db-app.js";
import { getDatabase, set, ref} from "https://www.gstatic.com/dbjs/10.7.1/db-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/dbjs/10.7.1/db-auth.js";
import { getAnalytics } from "https://www.gstatic.com/dbjs/10.7.1/db-analytics.js";
// TODO: Add SDKs for db products that you want to use
// https://db.google.com/docs/web/setup#available-libraries

// Your web app's db configuration
// For db JS SDK v7.20.0 and later, measurementId is optional
const dbConfig = {
  apiKey: "AIzaSyD6ZB30EJWoiK3dHefpjHSIG1-2fsl4eYA",
  authDomain: "edunest-2d87c.dbapp.com",
  projectId: "edunest-2d87c",
  storageBucket: "edunest-2d87c.appspot.com",
  messagingSenderId: "661448680628",
  appId: "1:661448680628:web:26be9e0c2411ec25afe3e1",
  measurementId: "G-MPQR8L0QLZ",
};

// Initialize db
const app = initializeApp(dbConfig);
const db = getDatabase();
const dbRef = ref(db);
const analytics = getAnalytics(app);
const auth = getAuth(app);


const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const username = document.getElementById('username').value;
const displayName = document.getElementById('display-name').value;
const loginBtn = document.querySelector('#login');
const signupBtn = document.querySelector('#signup');


// Slide animations:

loginBtn.addEventListener('click', (e) => {
	let parent = e.target.parentNode.parentNode;
	Array.from(e.target.parentNode.parentNode.classList).find((element) => {
		if(element !== "slide-up" && !signupBtn.parentNode.classList.contains('slide-up')) {
			parent.classList.add('slide-up')
		}else if(element === "slide-up"){
			signupBtn.parentNode.classList.add('slide-up')
			parent.classList.remove('slide-up')
		}
	});
});

signupBtn.addEventListener('click', (e) => {
	let parent = e.target.parentNode;
	Array.from(e.target.parentNode.classList).find((element) => {
		if(element !== "slide-up" && !loginBtn.parentNode.parentNode.classList.contains('slide-up')) {
			parent.classList.add('slide-up')
		}else if(element === "slide-up"){
			loginBtn.parentNode.parentNode.classList.add('slide-up')
			parent.classList.remove('slide-up')
		}
	});
});

  

  // Authentication logic:
  loginForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const email = loginEmail.value;
	const password = loginPassword.value;
	signInWithEmailAndPassword(email, password)
	  .then((userCredential) => {
		const user = userCredential.user;
		window.location.href = './index.html';
	  })
	  .catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
	  });
  });
  
  signupForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const email = signupEmail.value;
	const password = signupPassword.value;
	createUserWithEmailAndPassword(email, password)
	  .then((userCredential) => {
		const user = userCredential.user;

		set(ref(db, 'users/' + user.uid),{
		  username: username,
		  displayName: displayName,
		  email: email
		});
  
		window.location.href = './index.html';
	  })
	  .catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		alert(errorMessage);
	  });
  });