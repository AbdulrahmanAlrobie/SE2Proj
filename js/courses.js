import {
    auth,
    db,
    get,
    set,
    push,
    ref,
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL
} from '../firebaseConfig.js'

const courseModal = new bootstrap.Modal(document.getElementById('courseModal'));

auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        const userId = user.uid;

        get(ref(db, "users/" + userId))
            .then((snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    const userRole = userData.role;
                    if (userRole === "admin") {
                        document.getElementById("create-course-btn").style.display =
                            "block";
                    }
                }
            })
            .catch((error) => {
                console.error("Failed to fetch user data:", error);
            });
    }
});


document.getElementById("create-course-btn").addEventListener("click", function () {
    courseModal.show();
});

document.getElementById("saveCourse").addEventListener("click", function () {
    // Check if the user is an admin
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            const userId = user.uid;

            get(ref(db, "users/" + userId))
                .then((snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        const userRole = userData.role;
                        if (userRole != "admin") {
                            alert("Only admins can create courses.")
                            return;
                        } else {
                            // Get the form values
                            const courseTitle = document.getElementById("courseTitle").value;
                            const courseDescription = document.getElementById("courseDescription").value;
                            const courseImageFile = document.getElementById("courseImage").files[0] ? document.getElementById("courseImage").files[0] : './img/courses/default.png';
                            const coursesFolder = storageRef(storage, `courses/${courseImageFile.name}`);
                            uploadBytes(coursesFolder, courseImageFile).then((snapshot) => {
                                console.log('Uploaded image successfully!');
                                getDownloadURL(snapshot.ref).then((downloadURL) => {
                                    // Create a new course object
                                    const newCourse = {
                                        title: courseTitle,
                                        description: courseDescription,
                                        image: downloadURL,
                                        chapters: [],  // Initialize an empty array for chapters
                                        created: new Date()  // Store the current date and time
                                    };
                                    // Save the course to Firebase
                                    const coursesRef = ref(db, 'courses');
                                    const newCourseRef = push(coursesRef);
                                    set(newCourseRef, newCourse).then(() => {
                                        console.log('Course saved successfully!');
                                    }).catch((error) => {
                                        console.error('Failed to save course:', error);
                                    });

                                    // Close the modal
                                    courseModal.hide();
                                });
                            }).catch((error) => {
                                console.error('Failed to upload image:', error);
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch user data:", error);
                });
        }
    });
});