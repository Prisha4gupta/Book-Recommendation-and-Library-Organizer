document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

window.onload = () => {
    if (JSON.parse(localStorage.getItem('darkMode'))) {
        document.body.classList.add('dark-mode');
    }
    loadLibrary();
    loadReadingProgress();
};

document.getElementById('add-book-fab').addEventListener('click', openAddBookModal);

async function fetchBooks(query) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items.slice(0, 10);
        } else {
            alert("No books found. Please try a different search term.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching books:", error);
        alert("An error occurred while fetching books. Please try again later.");
        return [];
    }
}

    function openAddBookModal() {
        const modal = document.getElementById('add-book-modal');
        modal.style.display = 'flex';
    
        modal.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

    document.getElementById('add-book-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        addToLibrary({ title, author });
        modal.remove();
    });
}

function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        const coverUrl = getBookCover(book.volumeInfo.imageLinks?.thumbnail);
        bookItem.innerHTML = `
            <img src="${coverUrl}" alt="${book.volumeInfo.title}">
            <h3>${book.volumeInfo.title}</h3>
            <p>${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}</p>
            <button onclick='addToLibrary(${JSON.stringify({
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author",
                coverUrl: book.volumeInfo.imageLinks?.thumbnail || "default_cover.jpg"
            })})'>Add to Library</button>
        `;
        bookList.appendChild(bookItem);
    });
}

function getBookCover(coverUrl) {
    return coverUrl || "default_cover.jpg";
}

document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-genre').value;
    if (!query) return;
    const books = await fetchBooks(query);
    displayBooks(books);
});

function addToLibrary(book) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    const bookAuthors = book.authors || "Unknown Author";
    const coverUrl = book.coverUrl || "default_cover.jpg";


    if (!library.some(b => b.title === book.title && b.authors === bookAuthors)) {
        library.push({ title: book.title, authors: bookAuthors, coverUrl });
        localStorage.setItem('library', JSON.stringify(library));
        alert("Book added to library!");
        loadLibrary();
    } else {
        alert("Book already in library!");
    }
}

function loadLibrary() {
    const library = JSON.parse(localStorage.getItem('library')) || [];
    const libraryList = document.getElementById('book-list');
    libraryList.innerHTML = '';

    library.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img src="${book.coverUrl}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.authors}</p>
            <button onclick="removeFromLibrary('${book.title}', '${book.authors}')">Remove from Library</button>
        `;
        libraryList.appendChild(bookItem);
    });
}

function removeFromLibrary(title, authors) {
    let library = JSON.parse(localStorage.getItem('library')) || [];
    library = library.filter(book => !(book.title === title && book.authors === authors));
    localStorage.setItem('library', JSON.stringify(library));
    loadLibrary();
}

function clearLibrary() {
    if (confirm("Are you sure you want to remove all books?")) {
        localStorage.removeItem("library");
        loadLibrary();
        alert("Library cleared!");
    }
}
document.getElementById("clear-library").addEventListener("click", clearLibrary);

let readingProgress = JSON.parse(localStorage.getItem('readingProgress')) || [
    { title: "The Hobbit", progress: 40 },
    { title: "Atomic Habits", progress: 65 },

];

function displayReadingProgress() {
    const progressList = document.getElementById("progress-list");
    progressList.innerHTML = "";

    readingProgress.forEach((book, index) => {
        const bookProgress = document.createElement("div");
        bookProgress.classList.add("progress-container");

        bookProgress.innerHTML = `
            <h3>${book.title}</h3>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${book.progress}%"></div>
            </div>
            <div class="progress-input">
                <input type="number" min="0" max="100" value="${book.progress}" id="progress-input-${index}">
                <button onclick="updateProgress(${index})">Update</button>
            </div>
        `;

        progressList.appendChild(bookProgress);
    });
}

function updateProgress(index) {
    const newProgress = document.getElementById(`progress-input-${index}`).value;
    if (newProgress >= 0 && newProgress <= 100) {
        readingProgress[index].progress = newProgress;
        localStorage.setItem('readingProgress', JSON.stringify(readingProgress));
        displayReadingProgress();
    } else {
        alert("Enter a value between 0 and 100");
    }
}

function loadReadingProgress() {
    const savedProgress = JSON.parse(localStorage.getItem('readingProgress'));
    if (savedProgress) {
        readingProgress = savedProgress;
    }
    displayReadingProgress();
}