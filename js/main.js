// main.js
// Tableau contenant les liens vers les cantiques de chaque dimanche
const cantiques = [
    {
        date: "31/12",
        title: "Hymns of 31/12/2024",
        link: "single.html?key=mar-31-12-2024"
    },
    {
        date: "29/12",
        title: "Hymns of 29/12/2024",
        link: "single.html?key=dim-29-12-2024"
    },
    {
        date: "25/12",
        title: "Hymns of 25/12/2024",
        link: "single.html?key=mer-25-12-2024"
    },
    {
        date: "22/12",
        title: "Hymns of 22/12/2024",
        link: "single.html?key=dim-22-12-2024"
    },
    {
        date: "15/12",
        title: "Hymns of 15/12/2024",
        link: "single.html?key=dim-15-12-2024"
    },
    {
        date: "08/12",
        title: "Hymns of 08/12/2024",
        link: "single.html?key=dim-08-12-2024"
    },
    {
        date: "01/12",
        title: "Hymns of 01/12/2024",
        link: "single.html?key=dim-01-12-2024"
    },
    /*{
        date: "28/11",
        title: "Hymns of 28/11/2024",
        link: "single.html?key=jeu-28-11-2024"
    },
    {
        date: "24/11",
        title: "Hymns of 24/11/2024",
        link: "single.html?key=dim-24-11-2024" 
    },
    {
        date: "17/11",
        title: "Hymns of 17/11/2024",
        link: "single.html?key=dim-17-11-2024" 
    },
    {
        date: "10/11",
        title: "Hymns of 10/11/2024",
        link: "single.html?key=dim-10-11-2024" 
    },
    {
        date: "09/11",
        title: "Hymns of 09/11/2024",
        link: "single.html?key=sam-09-11-2024" 
    },
    {
        date: "03/11",
        title: "Hymns of 03/11/2024",
        link: "single.html?key=dim-03-11-2024" 
    },
    {
        date: "27/10",
        title: "Hymns of 27/10/2024",
        link: "single.html?key=dim-27-10-2024" 
    },
    {
        date: "20/10",
        title: "Hymns of 20/10/2024",
        link: "single.html?key=dim-20-10-2024" 
    },
    {
        date: "13/10",
        title: "Hymns of 13/10/2024",
        link: "single.html?key=dim-13-10-2024" 
    },
    {
        date: "06/10",
        title: "Hymns of 06/10/2024",
        link: "single.html?key=dim-06-10-2024" 
    },
    {
        date: "29/09",
        title: "Hymns of 29/09/2024",
        link: "single.html?key=dim-29-09-2024" 
    },
    {
        date: "22/09",
        title: "Hymns of 22/09/2024",
        link: "single.html?key=dim-22-09-2024" 
    },
    {
        date: "15/09",
        title: "Hymns of 15/09/2024",
        link: "single.html?key=dim-15-09-2024" 
    },
    {
        date: "08/09",
        title: "Hymns of 08/09/2024",
        link: "single.html?key=dim-08-09-2024" 
    }*/
];

// Fonction pour injecter les cantiques dans la page
function displayCantiques() {
    const showsListContainer = document.querySelector('.shows_list');
    showsListContainer.innerHTML = ''; // Vide la liste avant de la remplir

    cantiques.forEach(cantique => {
        const li = document.createElement('li');
        li.className = 'd-flex flex-row align-items-center justify-content-start';
        li.innerHTML = `
            <div><div class="show_date">${cantique.date}</div></div>
            <div class="show_info d-flex flex-md-row flex-column align-items-md-center align-items-start justify-content-md-start justify-content-center">
                <div class="show_name"><a href="${cantique.link}">${cantique.title}</a></div>
            </div>
            <div class="ml-auto"><div class="show_shop trans_200"><a href="${cantique.link}">Discover</a></div></div>
        `;
        showsListContainer.appendChild(li);
    });
}

// Appeler la fonction pour afficher les cantiques dès que la page est prête
document.addEventListener('DOMContentLoaded', displayCantiques);

// Afficher le bouton lorsque l'utilisateur fait défiler vers le bas
window.onscroll = function() {
    var scrollToTopButton = document.getElementById("scrollToTop");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopButton.style.display = "block";
    } else {
        scrollToTopButton.style.display = "none";
    }
};

// Fonction pour défiler vers le haut
document.getElementById("scrollToTop").onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

