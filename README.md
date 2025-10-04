# 📚 LightLib - Online Library System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

> A modern, user-friendly web application for accessing, reading, and managing your personal digital book library.

## 🌟 Overview

LightLib is an online library platform that allows users to browse, search, read, and organize digital books. With features like personalized reading lists, progress tracking, and a clean reading interface, LightLib makes digital reading accessible and enjoyable.

### ✨ Key Features

- 🔐 **User Authentication** - Secure registration and login system
- 📖 **Extensive Book Catalog** - Access thousands of books via external APIs
- 🔍 **Advanced Search** - Filter by title, author, genre, and publication year
- 📚 **Personal Library** - Organize books into Favorites, Plans, Reading Now, and Finished
- 📄 **Reading Interface** - Built-in reader with customizable settings
- 🌓 **Dark/Light Mode** - Comfortable reading in any environment
- 🔖 **Bookmarks** - Save your favorite pages
- 📊 **Progress Tracking** - Never lose your place
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🎯 Project Scope

LightLib serves as a centralized platform for:

- Discovering and accessing digital books
- Managing personal reading collections
- Tracking reading progress across devices
- Creating a personalized reading experience

**Target Audience:** Book enthusiasts, students, researchers, and casual readers looking for a convenient way to manage their digital library.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Catalog │  │  Library │  │  Reader  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
┌────────────────────▼────────────────────────────────────┐
│                Backend (Node.js + Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │   Books  │  │  Library │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────┬───────────────────────────┬────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌──────────────────────┐
│   PostgreSQL    │       │   External Book APIs │
│    Database     │       │  - Google Books API  │
└─────────────────┘       │  - Gutendex API      │
                          │  - Springer API      │
                          └──────────────────────┘
```

### Tech Stack

#### Frontend

- **Framework:** React.js
- **State Management:** React Context API / Redux
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui

#### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Security:** Helmet, CORS

#### External APIs

- Google Books API
- Gutendex (Project Gutenberg)
- Springer Open Access API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher) or **yarn**
- **PostgreSQL** (v12.0 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lightlib.git
cd lightlib
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Example .env file:**

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/lightlib
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
NODE_ENV=development
```

```bash
# Create database
createdb lightlib

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

Backend will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend API URL
nano .env
```

**Example .env file:**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
# Start development server
npm start
```

Frontend will be running at `http://localhost:3000`

## 📁 Project Structure

```
lightlib/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   └── app.js           # Express app
│   ├── tests/               # Backend tests
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # Context providers
│   │   ├── utils/           # Utility functions
│   │   └── App.js
│   ├── .env
│   └── package.json
├── docs/                    # Documentation
│   ├── SRS.pdf             # Software Requirements Specification
│   ├── API.md              # API documentation
│   └── UML/                # UML diagrams
├── README.md
└── LICENSE
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/forgot-password # Request password reset
```

### Books

```
GET    /api/books                # Get book catalog
GET    /api/books/search         # Search books
GET    /api/books/:id            # Get book details
GET    /api/books/:id/content    # Get book content
```

### Library Management

```
GET    /api/users/library        # Get user's library
POST   /api/users/library        # Add book to library
PUT    /api/users/library/:id    # Update book status
DELETE /api/users/library/:id    # Remove book from library
```

### Reading Progress

```
GET    /api/users/progress/:id   # Get reading progress
PUT    /api/users/progress       # Update progress
GET    /api/bookmarks            # Get bookmarks
POST   /api/bookmarks            # Add bookmark
DELETE /api/bookmarks/:id        # Delete bookmark
```

For detailed API documentation, see [API.md](docs/API.md)

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
```

### End-to-End Tests

```bash
npm run test:e2e           # Run E2E tests
```

## 🔒 Security Features

- **HTTPS/TLS** - All communications encrypted
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured cross-origin policies
- **Helmet.js** - Security headers
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - Parameterized queries via Sequelize
- **Rate Limiting** - API rate limiting to prevent abuse

## 🎨 User Interface

### Screenshots

_(Add screenshots of your application here)_

- Home/Catalog Page
- Book Details Page
- Reading Interface
- My Library Page
- Login/Registration

## 📊 Database Schema

### Users

- id (Primary Key)
- email (Unique)
- password_hash
- created_at
- updated_at

### User Library

- id (Primary Key)
- user_id (Foreign Key)
- book_id (External API ID)
- status (Favorites, Plans, Reading Now, Finished)
- added_at

### Bookmarks

- id (Primary Key)
- user_id (Foreign Key)
- book_id (External API ID)
- page_number
- created_at

### Reading Progress

- id (Primary Key)
- user_id (Foreign Key)
- book_id (External API ID)
- last_page
- updated_at

## 🚀 Deployment

### Backend Deployment (Heroku)

```bash
# Login to Heroku
heroku login

# Create app
heroku create lightlib-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set GOOGLE_BOOKS_API_KEY=your_api_key

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Bekenova Dina** - _Developer_ - [GitHub Profile](https://github.com/bekenova-dina)
- **Taubayev Yerassyl** - _Developer_ - [GitHub Profile](https://github.com/taubayev-yerassyl)

## 🙏 Acknowledgments

- Google Books API for book metadata
- Project Gutenberg for free book content
- Springer for academic book access
- Inspired by MangaLib and similar reading platforms

## 📞 Contact

Project Link: [https://github.com/yourusername/lightlib](https://github.com/yourusername/lightlib)

## 🗺️ Roadmap

### Version 1.0 (Current)

- ✅ User authentication
- ✅ Book catalog and search
- ✅ Reading interface
- ✅ Library management
- ✅ Progress tracking

### Version 1.1 (Planned)

- ⏳ Book recommendations
- ⏳ User reviews and ratings
- ⏳ Social features (share books)
- ⏳ Reading statistics dashboard

### Version 2.0 (Future)

- 🔮 Gamification (achievements, badges)
- 🔮 Multi-language support
- 🔮 Offline reading mode
- 🔮 Book clubs and community features

## ❓ FAQ

**Q: Do I need to pay for book access?**  
A: LightLib aggregates free books from public sources. Some books may have restricted access depending on the external API.

**Q: Can I upload my own books?**  
A: Currently, LightLib only provides access to books from external APIs. Personal upload feature is planned for future releases.

**Q: Is my reading data private?**  
A: Yes, all user data including reading progress and library lists are private and encrypted.

**Q: Which book formats are supported?**  
A: The reading interface supports PDF, ePub, and HTML formats, depending on what's available from the external APIs.

## 🐛 Known Issues

- Reading interface may have limited functionality for some book formats
- Some books from external APIs may have restricted preview access
- Mobile reading experience is continuously being improved

For a full list of issues, see [GitHub Issues](https://github.com/yourusername/lightlib/issues)

## 📚 Documentation

- [Software Requirements Specification (SRS)](docs/SRS.pdf)
- [API Documentation](docs/API.md)
- [UML Diagrams](docs/UML/)
- [Backend Development Guide](docs/BACKEND.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Made with ❤️ by the LightLib Team**
