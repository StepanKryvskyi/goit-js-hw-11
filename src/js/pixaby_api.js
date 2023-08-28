import axios from 'axios';

export async function getImages(input, page) {
  const config = {
    url: 'https://pixabay.com/api/',
    params: {
      key: '39113555-125c4bf310951cf7ae23320a5',
      q: input,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    },
  };
  const response = await axios(config);
  return response.data;
}