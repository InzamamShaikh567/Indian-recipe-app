# Recipe Application - Technical Documentation
## live website: https://recipe-frontend-singleppol.vercel.app/
## Complete Workflow & Architecture Guide

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [API Endpoints](#api-endpoints)
9. [Component Breakdown](#component-breakdown)
10. [Key Features Implementation](#key-features-implementation)
11. [Security & Best Practices](#security--best-practices)
12. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

This is a **full-stack recipe management application** that allows users to:
- View recipes organized by categories (Breakfast, Lunch, Dinner, Snack, Sweet, Beverage)
- Add new recipes with detailed information
- Edit existing recipes
- Delete recipes
- Toggle between light and dark themes
- Browse recipes with filtering by type (Vegetarian/Non-Vegetarian) and difficulty

---

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - Database driver
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **CSS3** - Styling with CSS variables for theming
- **Fetch API** - HTTP requests

---

## 📁 Project Structure

```
recipe-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── db.js             # Database connection
│   ├── seed.js           # Sample data seeder
│   ├── schema.sql        # Database schema
│   └── package.json      # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js           # Recipe listing page
│   │   │   ├── RecipeDetail.js   # Individual recipe view
│   │   │   ├── AddRecipe.js      # Add new recipe form
│   │   │   ├── EditRecipe.js     # Edit recipe form
│   │   │   └── Navbar.js         # Navigation component
│   │   ├── context/
│   │   │   └── ThemeContext.js   # Theme management
│   │   ├── App.js               # Main app component
│   │   └── App.css              # Global styles
│   └── package.json             # Frontend dependencies
```

---

## 🗄 Database Design

### Table: `recipes`
```sql
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    category ENUM('breakfast', 'snack', 'lunch', 'dinner', 'sweet', 'beverage') NOT NULL,
    type ENUM('veg', 'non-veg') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    time_required VARCHAR(50),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Design Decisions:**
- `AUTO_INCREMENT` for unique recipe IDs
- `ENUM` types for controlled vocabulary (category, type, difficulty)
- `TEXT` fields for long content (ingredients, instructions)
- `TIMESTAMP` for automatic creation tracking

---

## ⚙️ Backend Architecture

### 1. Database Connection (`db.js`)
```javascript
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'recipe_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

**Features:**
- Connection pooling for better performance
- Environment variable configuration
- Promise-based interface
- Automatic connection management

### 2. Server Configuration (`server.js`)
```javascript
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type']
}));
```

**Key Features:**
- CORS enabled for frontend communication
- JSON body parsing
- Error handling middleware
- RESTful API design

---

## 🎨 Frontend Architecture

### 1. App Structure (`App.js`)
```javascript
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <ThemeToggle />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/add-recipe" element={<AddRecipe />} />
              <Route path="/edit-recipe/:id" element={<EditRecipe />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}
```

**Architecture Patterns:**
- **Context API** for theme management
- **React Router** for client-side routing
- **Component composition** for modularity
- **Props drilling** for data passing

### 2. Theme Management (`ThemeContext.js`)
```javascript
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
```

**Features:**
- Persistent theme preference
- CSS custom properties for theming
- Global state management
- Automatic DOM updates

---

## 🔄 Data Flow Diagrams

### 1. Recipe Creation Flow
```
User Input → AddRecipe Component → API POST Request → Express Server → MySQL Database
     ↓
Success Response → Navigation to Home → Recipe Display
```

### 2. Recipe Viewing Flow
```
Home Component → API GET Request → Express Server → MySQL Database
     ↓
Recipe Data → Component State → UI Rendering
```

### 3. Recipe Update Flow
```
EditRecipe Component → Fetch Current Data → Form Pre-population
     ↓
User Modifications → API PUT Request → Database Update → Navigation
```

### 4. Recipe Deletion Flow
```
RecipeDetail Component → Confirmation → API DELETE Request → Database Removal
     ↓
Success Response → Navigation to Home
```

---

## 🌐 API Endpoints

### GET `/api/recipes`
- **Purpose**: Fetch all recipes
- **Response**: Array of recipe objects
- **Usage**: Home page recipe listing

### GET `/api/recipes/:id`
- **Purpose**: Fetch single recipe by ID
- **Response**: Single recipe object
- **Usage**: Recipe detail page

### POST `/api/recipes`
- **Purpose**: Create new recipe
- **Body**: Recipe data object
- **Response**: Created recipe with ID
- **Usage**: Add recipe form submission

### PUT `/api/recipes/:id`
- **Purpose**: Update existing recipe
- **Body**: Partial recipe data
- **Response**: Updated recipe object
- **Usage**: Edit recipe form submission

### DELETE `/api/recipes/:id`
- **Purpose**: Remove recipe
- **Response**: Success message
- **Usage**: Delete recipe action

---

## 🧩 Component Breakdown

### 1. Home Component (`Home.js`)
**Responsibilities:**
- Fetch and display all recipes
- Organize recipes by category
- Handle loading and error states
- Provide navigation to recipe details

**Key Features:**
```javascript
const [recipes, setRecipes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes');
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
    }
  };
  fetchRecipes();
}, []);
```

### 2. RecipeDetail Component (`RecipeDetail.js`)
**Responsibilities:**
- Display complete recipe information
- Handle edit and delete actions
- Format ingredients and instructions
- Provide navigation controls

**Key Features:**
```javascript
const handleDelete = async () => {
  try {
    await fetch(`http://localhost:5000/api/recipes/${id}`, {
      method: 'DELETE',
    });
    navigate('/');
  } catch (error) {
    console.error('Error deleting recipe:', error);
  }
};
```

### 3. AddRecipe Component (`AddRecipe.js`)
**Responsibilities:**
- Collect recipe information via form
- Validate required fields
- Submit data to backend
- Handle form state management

**Key Features:**
```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  ingredients: '',
  instructions: '',
  category: 'breakfast',
  type: 'veg',
  difficulty: 'easy',
  time_required: '',
  image_url: ''
});
```

### 4. EditRecipe Component (`EditRecipe.js`)
**Responsibilities:**
- Pre-populate form with existing data
- Handle form updates
- Submit changes to backend
- Maintain data consistency

**Key Features:**
```javascript
useEffect(() => {
  const fetchRecipe = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      setError(error.message);
    }
  };
  fetchRecipe();
}, [id]);
```

---

## ✨ Key Features Implementation

### 1. Theme Switching
**Implementation:**
- CSS custom properties for theme variables
- Context API for global theme state
- localStorage for persistence
- Dynamic DOM attribute updates

**CSS Variables:**
```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #4a90e2;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --primary-color: #64b5f6;
}
```

### 2. Responsive Design
**Features:**
- CSS Grid for recipe layout
- Flexible card components
- Mobile-friendly navigation
- Adaptive typography

**Grid Layout:**
```css
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}
```

### 3. Error Handling
**Frontend:**
- Try-catch blocks for API calls
- Loading states for better UX
- Error messages for user feedback

**Backend:**
- HTTP status codes
- Error response objects
- Database error handling

---

## 🔒 Security & Best Practices

### 1. Input Validation
- Required field validation
- URL validation for images
- SQL injection prevention through parameterized queries

### 2. Error Handling
- Graceful error responses
- User-friendly error messages
- Console logging for debugging

### 3. Code Organization
- Separation of concerns
- Modular component structure
- Reusable utility functions

---

## 🚀 Deployment Guide

### Backend Deployment
1. Set up MySQL database
2. Configure environment variables
3. Install dependencies: `npm install`
4. Run database schema: `mysql -u root -p < schema.sql`
5. Seed database: `node seed.js`
6. Start server: `npm start`

### Frontend Deployment
1. Install dependencies: `npm install`
2. Build for production: `npm run build`
3. Serve static files or deploy to hosting service

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recipe_app
PORT=5000
```

---

## 📊 Performance Considerations

### 1. Database Optimization
- Connection pooling
- Indexed primary keys
- Efficient query patterns

### 2. Frontend Optimization
- Component state management
- Efficient re-rendering
- Image optimization
- CSS transitions

### 3. API Optimization
- RESTful design
- Proper HTTP status codes
- JSON response format
- Error handling

---

## 🎯 Learning Outcomes

This project demonstrates:
1. **Full-stack development** with modern technologies
2. **Database design** and management
3. **API development** with Express.js
4. **React component architecture**
5. **State management** with Context API
6. **Responsive web design**
7. **Error handling** and user experience
8. **Code organization** and best practices

---

## 🔧 Future Enhancements

Potential improvements:
1. Image upload functionality

---


