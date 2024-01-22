
var form = document.getElementById('myform');
var currentPage = 1;
var reposPerPage = 10;
var allRepos = [];
var reposPerPageDropdown = document.getElementById("reposPerPage");



reposPerPageDropdown.addEventListener("change", function () {
    reposPerPage = parseInt(reposPerPageDropdown.value);
    currentPage = 1; // Reset to the first page
    renderRepos(allRepos, currentPage);
    updatePagination(allRepos.length);
});
// Function to truncate string to a specified number of words
function truncateString(str, numWords) {
    return str.split(' ').splice(0, numWords).join(' ') + (str.split(' ').length > numWords ? '...' : '');
}

// Function to fetch and display languages for a specific repository
function fetchAndDisplayRepoLanguages(repo, repoContainer) {
    const url = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`;
    fetch(url)
        .then(response => response.json())
        .then(languages => {
            const tagsDiv = repoContainer.querySelector('.tags');
            for (const language in languages) {
                const tagSpan = document.createElement('span');
                tagSpan.classList.add('tag');
                tagSpan.textContent = language;
                tagsDiv.appendChild(tagSpan);
            }
        })
        .catch(err => console.error('Error fetching languages:', err));
}

// Function to render repositories on the page
function renderRepos(repos, page) {
    const startIndex = (page - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const reposToShow = repos.slice(startIndex, endIndex);

    const gridContainer = document.getElementById('repoGrid');
    gridContainer.innerHTML = ''; // Clear the container

    reposToShow.forEach(repo => {
        const repoContainer = document.createElement('div');
        repoContainer.classList.add('repo_container');
        repoContainer.style.cursor = 'pointer';
        repoContainer.addEventListener('click', () => window.open(repo.html_url, '_blank'));

        const description = repo.description ? truncateString(repo.description, 20) : 'No description';
        repoContainer.innerHTML = `
            <h2 class="repo_name">${repo.name}</h2>
            <p class="repo_description">${description}</p>
            <div class="tags"></div>
        `;

        gridContainer.appendChild(repoContainer);
        fetchAndDisplayRepoLanguages(repo, repoContainer);
    });
    document.getElementById('repoSearchBar').style.display = 'block';
}


function filterAndRenderRepos() {
    const searchInput = document.getElementById('repoSearchInput').value.toLowerCase();
    const filteredRepos = allRepos.filter(repo => repo.name.toLowerCase().includes(searchInput));
    currentPage = 1; // Reset to the first page
    renderRepos(filteredRepos, currentPage);
    updatePagination(filteredRepos.length);
}


document.getElementById('repoSearchInput').addEventListener('keyup', filterAndRenderRepos);






// Function to update pagination links
function updatePagination(totalRepos) {
    const pageCount = Math.ceil(totalRepos / reposPerPage);
    const paginationContainer = document.querySelector('.pagination-container');
    paginationContainer.innerHTML = ''; // Clear the pagination container

    for (let i = 1; i <= pageCount; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.className = 'pagination-link';
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            renderRepos(allRepos, currentPage);
            updatePagination(allRepos.length);

            // Scroll to the top of the page
            window.scrollTo(0, 0);
        });

        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        paginationContainer.appendChild(pageLink);
    }
}


// Event listener for form submission
form.addEventListener('submit', function (e) {
    document.getElementById('home-content').style.display = 'none';
    e.preventDefault();
    var search = document.getElementById('search').value.trim();
    var originalName = search.split(' ').join('');


    document.getElementById('repoGrid').innerHTML = ''; // Clear repositories grid
    document.getElementById('error-msg').style.display = 'none'; // Hide error message initially


    // Fetch user profile
    fetch(`https://api.github.com/users/${originalName}`)
        .then(result => {
            if (result.ok) {
                return result.json();
            } else {
                throw new Error('User not found');
            }
        })
        .then(data => {
            // Process and display user profile information
            // ...
            console.log(data);

            const avatarUrl = data.avatar_url || 'path_to_default_avatar_image';
            const name = data.name || 'Name not available';
            const bio = data.bio || 'Bio not available';
            const location = data.location || 'Location not available';
            const githubUrl = data.html_url || '#';
            const twitterUrl = data.twitter_username ? `https://twitter.com/${data.twitter_username}` : '#';
            // User profile information
            document.getElementById('user-profile').innerHTML = `<img src="${avatarUrl}" class="user_img">`;
            document.getElementById('user-name').innerHTML = `<h1 class="user_name">${name}</h1>`;
            document.getElementById('user-bio').innerHTML = `<p class="user_bio">${bio}</p>`;
            document.getElementById('user-location').innerHTML = `
                <p class="user_location">
                    <img src="../assets/location.svg" alt="Location" style="width: 20px; height: 20px;" /> ${location}
                </p>`;
            document.getElementById('user-github').innerHTML = `<a href="${githubUrl}" class="button github" target="_blank"><span class="icon"></span>GitHub</a>`;
            document.getElementById('user-twitter').innerHTML = `<a href="${twitterUrl}" class="button twitter" target="_blank"><span class="icon"></span>Twitter</a>`;    // Update pagination after fetching user data

            // Fetch user repositories
            return fetch(`https://api.github.com/users/${originalName}/repos`);
        })
        .then(response => response.json())
        .then(repos => {
            allRepos = repos; // Store all repos
            renderRepos(allRepos, currentPage); // Render first page of repos
            updatePagination(allRepos.length); // Update pagination
        })
        .catch(err => {
            console.error('Error:', err);
            // Display a user not found message
            document.getElementById('error-msg').innerHTML = 'User not found. Please enter a valid username.';
            document.getElementById('error-msg').style.display = 'block';

            // Clearing user profile information
            document.getElementById('user-profile').innerHTML = '';
            document.getElementById('user-name').innerHTML = '';
            document.getElementById('user-bio').innerHTML = '';
            document.getElementById('user-location').innerHTML = '';
            document.getElementById('user-github').innerHTML = '';
            document.getElementById('user-twitter').innerHTML = '';
            document.getElementById('repoSearchBar').style.display = 'none';

            // Clear the repositories grid and reset pagination
            document.getElementById('repoGrid').innerHTML = '';
            updatePagination(0);
        });
});