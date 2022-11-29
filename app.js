const addBookMarkBTN = document.querySelector('#AddBookMark')
const bookMarkContainer = document.querySelector('#bookMarkContainer')
const contextMenuContainer = document.querySelector('#contextMenuContainer')
const contextMenu = document.querySelector('#contextMenu')
const formContainer = document.querySelector('#formContainer')
const form = document.querySelector('#form')

window.onload = () => reload()

formContainer.onclick = (e) => {
    if (e.target.id === "formContainer") {
        form.reset();
        return formContainer.style.display = 'none';
    }
}

contextMenuContainer.onclick = (e) => {
    if (e.target.id === "contextMenuContainer") {
        return contextMenuContainer.style.display = 'none';
    }
}

addBookMarkBTN.onclick = () => {
    formContainer.style.display = 'unset';
    form.querySelector('button').textContent = "CREATE"
    populateForm({
        dateModified: Date.now(),
        title: '',
        description: '',
        category: '',
        link: ''
    })
}

form.onsubmit = (e) => {
    e.preventDefault();
    if (form.querySelector('input#toUpdate').value === 'true') {
        onUpdate()
    } else {
        store({
            dateModified: form.querySelector('input#dateModified').value,
            title: form.querySelector('input#title').value,
            description: form.querySelector('textarea#description').value,
            category: form.querySelector('input#category').value,
            link: form.querySelector('input#link').value,
        })
    }
    formContainer.click();
    reload();
}
function createBookMarkDIV(title, link, dateModified = Date.now(), description, category, isFirst = false) {
    const div = document.createElement('a')
    const categorySpan = document.createElement('span')
    const titleSpan = document.createElement('span')
    const descriptionP = document.createElement('p')

    titleSpan.className = 'titleSpan'
    categorySpan.className = 'categorySpan'
    descriptionP.className = 'descriptionP'

    div.classList.add('bookMark')
    isFirst && div.classList.add('firstOfCategory');
    div.setAttribute('data-title', title)
    div.setAttribute('data-link', link)
    div.setAttribute('href', link)
    div.setAttribute('data-date-modified', dateModified)

    titleSpan.textContent = title
    categorySpan.textContent = category
    descriptionP.textContent = description

    div.appendChild(titleSpan)
    div.appendChild(categorySpan)
    div.appendChild(descriptionP)

    div.onclick = (e) => {
        window.location = e.currentTarget.getAttribute('data-link')
    }
    div.oncontextmenu = (e) => {
        e.preventDefault()
        console.log(e)
        contextMenuContainer.style.display = 'unset'
        contextMenu.style.top = `${e.pageY}px`
        contextMenu.style.left = `${e.pageX}px`

        contextMenu.querySelector('#EditBookMark').addEventListener('click', () => {
            console.log('clicked edit')
            formContainer.style.display = 'unset';
            contextMenuContainer.style.display = 'none';
            populateForm({
                title, link, dateModified, description, category
            }, true)
            form.querySelector('button').textContent = 'UPDATE'
        }, { once: true })

        contextMenu.querySelector('#DeleteBookMark').addEventListener('click', () => {
            deleteBookMark(dateModified)
            contextMenuContainer.style.display = 'none';
        }, { once: true })
    }

    return div
}

function store(bookmark) {
    const oldString = localStorage.getItem('andelaBookmarks') ?? '[]';
    const oldParsed = JSON.parse(oldString);

    oldParsed.push({ ...bookmark, dateModified: Date.now() })

    localStorage.setItem('andelaBookmarks', JSON.stringify(oldParsed))
}

function update(bookmark) {
    console.log("UPDTIN....")
    const oldString = localStorage.getItem('andelaBookmarks') ?? '[]';
    let oldParsed = JSON.parse(oldString);

    oldParsed = oldParsed.map(el => (el.dateModified == bookmark.dateModified) ? bookmark : el)

    localStorage.setItem('andelaBookmarks', JSON.stringify(oldParsed))
}

function deleteBookMark(dateModified) {
    const oldString = localStorage.getItem('andelaBookmarks') ?? '[]';
    let oldParsed = JSON.parse(oldString);

    oldParsed = oldParsed.filter(el => el.dateModified !== dateModified)

    localStorage.setItem('andelaBookmarks', JSON.stringify(oldParsed))
    reload()
}

function reload() {
    const oldString = localStorage.getItem('andelaBookmarks') ?? '[]';
    let oldParsed = JSON.parse(oldString);

    oldParsed = groupByCategory(oldParsed)

    bookMarkContainer.innerHTML = "";

    for (const bookMark of oldParsed) {
        bookMarkContainer.appendChild(createBookMarkDIV(bookMark.title, bookMark.link, bookMark.dateModified, bookMark.description, bookMark.category, !!bookMark.isFirst))
    }

}

function onUpdate() {
    update({
        dateModified: form.querySelector('input#dateModified').value,
        title: form.querySelector('input#title').value,
        description: form.querySelector('textarea#description').value,
        category: form.querySelector('input#category').value,
        link: form.querySelector('input#link').value,
    });
}

function populateForm(bookMark, toUpdate = false) {
    [
        form.querySelector('input#title').value,
        form.querySelector('input#link').value,
        form.querySelector('input#dateModified').value,
        form.querySelector('textarea#description').value,
        form.querySelector('input#category').value,
        form.querySelector('input#toUpdate').value,
    ] = [bookMark.title, bookMark.link, bookMark.dateModified, bookMark.description, bookMark.category, toUpdate]
}

function groupByCategory(bookMarks) {
    const categories = new Set(bookMarks.map(el => el.category).sort())
    const rearranged = [];

    for (const category of categories) {
        const inCategory = bookMarks.filter(el => el.category === category)
        inCategory[0].isFirst = true
        rearranged.push(...inCategory)
    }

    return rearranged
}