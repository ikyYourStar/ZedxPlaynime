const BASE_URL = "https://api.sansekai.my.id/api/anime";

export const api = {
  getLatest: async () => {
    const res = await fetch(`${BASE_URL}/latest`);
    return res.json();
  },
  getRecommended: async () => {
    const res = await fetch(`${BASE_URL}/recommended`);
    return res.json();
  },
  getMovies: async () => {
    const res = await fetch(`${BASE_URL}/movie`);
    return res.json();
  },
  searchAnime: async (query: string) => {
    const res = await fetch(`${BASE_URL}/search?query=${query}`);
    const json = await res.json();
    return json.data[0]?.result || [];
  },
  getDetail: async (urlId: string) => {
    const res = await fetch(`${BASE_URL}/detail?urlId=${urlId}`);
    const json = await res.json();
    return json.data[0];
  },
  getStream: async (chapterUrlId: string, reso: string) => {
    const res = await fetch(`${BASE_URL}/getvideo?chapterUrlId=${chapterUrlId}&reso=${reso}`);
    const json = await res.json();
    return json.data[0];
  }
};
