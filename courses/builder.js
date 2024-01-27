import {
  db,
  auth,
  ref,
  get,
  set,
  push,
  onValue,
  off,
  onChildAdded
} from '/firebaseConfig.js'

function getCourseTitleFromPath () {
  //   const pathSegments = window.location.pathname.split('/')
  //   let courseTitle = decodeURIComponent(pathSegments[pathSegments.length - 2])

  //   return courseTitle
  const urlParams = new URLSearchParams(window.location.search)
  const courseId = urlParams.get('course')

  if (!courseId) {
    throw new Error('Course ID not found in URL parameters')
  }

  return courseId
}

const courseTitle = getCourseTitleFromPath()
const courseIdRef = ref(db, '/courseTitles/' + courseTitle.toLocaleLowerCase())
const chapterModal = new bootstrap.Modal(
  document.getElementById('chapterModal')
)
const lessonModal = new bootstrap.Modal(document.getElementById('lessonModal'))

let courseId
let userRole
get(courseIdRef).then(snapshot => {
  courseId = snapshot.val() // Fetch the course ID
  const courseRef = ref(db, '/courses/' + courseId)

  onValue(courseRef, snapshot => {
    const courseData = snapshot.val()
    document.getElementById('course-image').src = courseData.image
    document.getElementById('course-title').textContent = courseData.title
    document.getElementById('course-description').textContent =
      courseData.description
  })

  const chaptersRef = ref(db, '/courses/' + courseId + '/chapters')

  // Fetch existing chapters
  get(chaptersRef, snapshot => {
    snapshot.forEach(childSnapshot => {
      const chapterData = childSnapshot.val()
      // Display the chapter
      displayChapter(chapterData, childSnapshot.key)
    })
  })

  // Handle new chapters
  onChildAdded(chaptersRef, snapshot => {
    const chapterData = snapshot.val()
    // Display the chapter
    displayChapter(chapterData, snapshot.key)
  })
})

function displayChapter (chapterData, chapterId) {
  // Create a new div for the chapter
  const chapterDiv = document.createElement('div')
  chapterDiv.className = 'card my-3'
  chapterDiv.innerHTML = `
    <div class="card-header">
      <h2>${chapterData.title}</h2>
    </div>
    <div class="card-body" id="chapter-${chapterId}-lessons">
      <p>${chapterData.description}</p>
    </div>
  `

  document.querySelector('.course-content .row').appendChild(chapterDiv)

//Check if the current user is an admin then create the create-lesson-btn if they are!
if (userRole === 'admin') {
  const createLessonBtn = document.createElement('button');
  createLessonBtn.id = 'create-lesson-btn-' + chapterId;
  createLessonBtn.className = 'btn btn-primary float-end';
  createLessonBtn.textContent = 'Create Lesson';

  createLessonBtn.addEventListener('click', function () {
    // Store the current chapter ID in a global variable
    window.currentChapterId = chapterId
    // Show the lesson creation modal
    lessonModal.show()
  })
  document.querySelector('.card-header').appendChild(createLessonBtn);
}
 

  // Fetch the lessons for this chapter
  const lessonsRef = ref(
    db,
    '/courses/' + courseId + '/chapters/' + chapterId + '/lessons'
  )
  onChildAdded(lessonsRef, snapshot => {
    const lessonId = snapshot.key
    const lessonData = snapshot.val()

    // Create a new div for the lesson
    const lessonDiv = document.createElement('div')
    lessonDiv.className = 'card my-2'
    lessonDiv.innerHTML = `
      <div class="card-body">
        <h3>${lessonData.title}</h3>
      </div>
    `
    document
      .getElementById('chapter-' + chapterId + '-lessons')
      .appendChild(lessonDiv)
  })
}

auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    const userId = user.uid

    get(ref(db, 'users/' + userId))
      .then(snapshot => {
        const userData = snapshot.val()
        if (userData) {
            userRole = userData.role
          if (userRole === 'admin') {
            const row = document.querySelector('main .row')
            const createChapterBtn = document.createElement('button')
            createChapterBtn.id = 'create-chapter-btn'
            createChapterBtn.textContent = 'Create Chapter'
            createChapterBtn.classList.add('btn', 'btn-primary', 'my-3')
            createChapterBtn.addEventListener('click', function () {
              chapterModal.show()
            })
            row.appendChild(createChapterBtn)
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error)
      })
  }
})

document
  .getElementById('save-chapter-btn')
  .addEventListener('click', function () {
    // Check if the user is an admin
    auth.onAuthStateChanged(user => {
      if (user) {
        const userId = user.uid

        get(ref(db, 'users/' + userId))
          .then(snapshot => {
            const userData = snapshot.val()
            if (userData) {
              const userRole = userData.role
              if (userRole != 'admin') {
                alert('Only admins can create chapters.')
                return
              } else {
                const chapterTitle = document
                  .getElementById('chapterTitle')
                  .value.trim()
                get(
                  ref(
                    db,
                    'courses/' +
                      courseId +
                      '/chapters/' +
                      chapterTitle.toLowerCase()
                  )
                ).then(snapshot => {
                  if (snapshot.exists()) {
                    alert(
                      'There is a chapter with this title in this course. Please choose a different one.'
                    )
                    return
                  } else {
                    handleChapterCreation(courseId, chapterTitle)
                  }
                })
              }
            }
          })
          .catch(error => {
            console.error('Failed to fetch user data:', error)
          })
      }
    })
  })

function handleChapterCreation (courseId, chapterTitle) {
  // Create a new chapter object
  const newChapter = {
    title: chapterTitle,
    lessons: [], // Initialize an empty array for lessons
    quiz: {}, // Initialize an empty object for the quiz
    created: new Date().toISOString()
  }
  // Save the chapter to Firebase
  const newChapterRef = push(ref(db, 'courses/' + courseId + '/chapters'))
  set(newChapterRef, newChapter)
    .then(() => {
      console.log('Chapter saved successfully!')
      // Reset the form fields
      document.getElementById('chapterTitle').value = ''
    })
    .catch(error => {
      console.error('Failed to save chapter:', error)
    })

  // Save the chapter to the chapters array that is in the course object
  //   const courseRef = ref(db, 'courses/' + courseId)
  //   get(courseRef).then(snapshot => {
  //     const courseData = snapshot.val()
  //     push(courseData.chapters, newChapterRef.key)
  //     set(courseRef, courseData)
  //   })

  chapterModal.hide()
}
