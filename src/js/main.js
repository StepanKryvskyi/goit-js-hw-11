import { getImages } from './pixaby_api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  searchForm: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  target: document.querySelector(`.js-guard`),
};

let gallery = null;
let page = 1;
let currentSearch;
let totalHits = 0;
let totalPages = 0;

const options = {
  root: null,
  rootMargin: `1000px`,
};

const observer = new IntersectionObserver(loadMore, options);

elements.searchForm.addEventListener(`submit`, newSearch);

async function createItems(imagesArr) {
  elements.gallery.insertAdjacentHTML(
    `beforeend`,
    imagesArr
      .map(
        hit => `<div class="gallery-item">
        <a class="gallery-link" href="${hit.largeImageURL}">
  <img class ="gallery-image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
  <div class="info-box">
      <p class="info-text">&#x1F44D ${hit.likes}</p>
      <p class="info-views">&#x1F9D0 ${hit.views}</p>
      <p class="info-text">&#x1F4AC ${hit.comments}</p>
      <p class="info-text">&#x1F4E5 ${hit.downloads}</p>
  </div>
</div>`
      )
      .join(``)
  );
}
async function newSearch(e) {
  e.preventDefault();

  observer.unobserve(elements.target);

  totalHits = 0;
  page = 1;
  currentSearch = e.currentTarget.firstElementChild.value.trim();

  if (currentSearch === '') {
    Notiflix.Notify.warning('Please, enter search request.');
    return;
  }

  elements.gallery.innerHTML = ``;

  await getImages(currentSearch, page)
    .then(response => {
      if (!response.hits.length) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        e.target.reset();
        return;
      }
      totalHits = response.totalHits;
      totalPages = Math.ceil(totalHits / 40);

      Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);

      createItems(response.hits);

      e.target.reset();

      observer.observe(elements.target);

      gallery = new SimpleLightbox('.gallery-link', {
        captionsData: 'alt',
        captionDelay: 250,
      });

      const { height: cardHeight } =
        elements.gallery.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 0.5,
        behavior: 'smooth',
      });

      if (page >= totalPages) {
        observer.unobserve(elements.target);

        return;
      }
    })
    .catch(({ code, message }) => {
      Notiflix.Report.failure(
        `${message}. Code: ${code} `,
        'Oops! Something went wrong! Try reloading the page!',
        'OK'
      );
    });
}

async function loadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      getImages(currentSearch, page)
        .then(response => {
          createItems(response.hits);

          const { height: cardHeight } =
            elements.gallery.firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2.28,
            behavior: 'smooth',
          });

          if (page >= totalPages) {
            observer.unobserve(elements.target);

            Notiflix.Notify.success(
              'We are sorry, but you have reached the end of search results.'
            );
          }
          gallery.refresh();
        })
        .catch(({ code, message }) => {
          Notiflix.Report.failure(
            `${message}. Code: ${code} `,
            'Oops! Something went wrong! Try reloading the page!',
            'OK'
          );
        });
    }
  });
}