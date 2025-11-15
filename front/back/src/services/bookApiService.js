import axios from "axios";

const GUTENDEX_BASE_URL = "https://gutendex.com";

class BookApiService {
  async searchBooks(query, page = 1) {
    try {
      const response = await axios.get(`${GUTENDEX_BASE_URL}/books`, {
        params: {
          search: query,
          page,
        },
      });
      return response.data;
    } catch (err) {
      throw new Error(`Failed to search books: ${err.message}`);
    }
  }

  async getBooks(page = 1, genre = null, sort = null) {
    try {
      const params = { page };

      if (genre) {
        params.topic = genre;
      }

      if (sort === "popular") {
        params.sort = "popular";
      } else if (sort === "ascending") {
        params.sort = "ascending";
      } else if (sort === "descending") {
        params.sort = "descending";
      }

      const response = await axios.get(`${GUTENDEX_BASE_URL}/books`, {
        params,
      });
      return response.data;
    } catch (err) {
      throw new Error(`Failed to get books: ${err.message}`);
    }
  }

  async getBookById(id) {
    try {
      const response = await axios.get(`${GUTENDEX_BASE_URL}/books/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(`Failed to get book: ${err.message}`);
    }
  }

  async getBookContent(id) {
    try {
      const book = await this.getBookById(id);

      const textFormat =
        book.formats["text/plain"] ||
        book.formats["text/plain; charset=utf-8"] ||
        book.formats["text/plain; charset=us-ascii"];

      if (!textFormat) {
        throw new Error("Book content not available in text format");
      }

      const response = await axios.get(textFormat);
      return response.data;
    } catch (err) {
      throw new Error(`Failed to get book content: ${err.message}`);
    }
  }

  parseBookData(book) {
    return {
      id: book.id,
      title: book.title,
      authors: book.authors.map((a) => a.name),
      subjects: book.subjects,
      languages: book.languages,
      coverImage: book.formats["image/jpeg"] || null,
      downloadCount: book.download_count,
    };
  }
}

export default new BookApiService();
