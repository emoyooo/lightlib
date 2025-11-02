import bookApiService from "../services/bookApiService.js";

export const searchBooks = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const data = await bookApiService.searchBooks(query, page);

    res.json({
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results.map((book) => bookApiService.parseBookData(book)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const { page = 1, genre, sort } = req.query;

    const data = await bookApiService.getBooks(page, genre, sort);

    res.json({
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results.map((book) => bookApiService.parseBookData(book)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookApiService.getBookById(id);

    res.json(bookApiService.parseBookData(book));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await bookApiService.getBookContent(id);

    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
