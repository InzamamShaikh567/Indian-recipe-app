# Recipe App - System Architecture

## Overview
Mermaid UML diagrams for the complete Recipe App architecture including frontend, backend, and database.

---

## 1. System Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React)"]
        direction TB
        App[App.jsx]
        Router[React Router]
        Pages[Pages]
        Components[Components]
        Context[Context/State Management]
        Services[API Services]

        App --> Router
        Router --> Pages
        Pages --> Components
        Components --> Context
        Components --> Services
    end

    subgraph Backend["Backend (Node/Express)"]
        direction TB
        Server[server.js]
        Middleware[Middleware<br/>- authenticateToken<br/>- cors<br/>- express.json]
        Routes[API Routes]
        DB[(MySQL Database)]

        Server --> Middleware
        Middleware --> Routes
        Routes --> DB
    end

    subgraph External["External Services"]
        JWT[JSON Web Token]
        Bcrypt[Bcrypt Password Hashing]
    end

    Services -->|HTTP Requests| Routes
    Routes -->|JWT Verification| JWT
    Routes -->|Password Hash/Compare| Bcrypt
    DB -->|Store/Retrieve| Routes
```

---

## 2. Complete System Component Diagram

```mermaid
flowchart TB
    subgraph Browser["🌐 User's Browser"]
        direction TB

        subgraph Frontend["⚛️ Frontend (React App)"]
            direction TB
            App[App.jsx<br/>Main Entry Point]
            Router[React Router<br/>v6]

            subgraph Pages["📄 Pages"]
                Home[Home Page]
                RecipeList[Recipe List]
                RecipeDetail[Recipe Detail]
                UserProfile[User Profile]
                LoginPage[Login/Register]
                AdminDash[Admin Dashboard]
            end

            subgraph Components["🧩 Components"]
                Navbar[Navbar<br/>+ Search + Notifications]
                RecipeDetailComp[RecipeDetail<br/>+ Image + Meta + Actions]
                CommentSection[CommentSection<br/>+ Form + Items + Vote]
                Notifications[Notifications<br/>Poll every 30s]
                AuthModal[AuthModal<br/>Login/Register Form]
                ShareModal[ShareModal]
                FollowButton[FollowButton]
            end

            subgraph Context["📦 Context/State Management"]
                AuthCtx[AuthContext<br/>user, token, login, logout]
                FavCtx[FavoritesContext<br/>favorites, toggle]
                NotifCtx[NotificationContext<br/>notifications, unreadCount]
            end

            subgraph LocalStorage["💾 LocalStorage"]
                TokenStore[token - JWT]
                UserStore[user - user object]
            end
        end
    end

    subgraph Backend["🖥️ Backend (Node/Express)"]
        direction TB
        Server[server.js<br/>Express App]

        subgraph Middleware["🔒 Middleware"]
            AuthToken[authenticateToken<br/>JWT Verification]
            Cors[cors - Cross-Origin]
            JsonParser[express.json]
        end

        subgraph APIRoutes["🛣️ API Routes"]
            AuthRoutes[Auth Routes<br/>POST /login<br/>POST /register<br/>GET /profile]
            RecipeRoutes[Recipe Routes<br/>CRUD /api/recipes]
            CommentRoutes[Comment Routes<br/>GET/POST comments<br/>POST vote]
            NotifRoutes[Notification Routes<br/>GET /notifications<br/>PUT /read]
            FavRoutes[Favorite Routes<br/>GET/POST/DELETE]
            RatingRoutes[Rating Routes<br/>POST /ratings]
            FollowRoutes[Follow Routes<br/>POST/DELETE /follow]
        end

        subgraph Services["⚙️ Services"]
            JWT_Service[JSON Web Token<br/>sign/verify]
            Bcrypt[Bcrypt<br/>hash/compare]
            DB_Query[Database Queries<br/>mysql2/promise]
        end
    end

    subgraph Database["🗄️ MySQL Database"]
        direction TB
        Users[(users table<br/>id, username, email<br/>password_hash, is_admin)]
        Recipes[(recipes table<br/>id, name, description<br/>ingredients, instructions)]
        Comments[(comments table<br/>id, recipe_id, user_id<br/>parent_comment_id, content)]
        Notifications_DB[(notifications table<br/>id, recipient_id, sender_id<br/>type, recipe_id, comment_id)]
        Favorites[(favorites table<br/>id, user_id, recipe_id)]
        Follows[(follows table<br/>id, follower_id, following_id)]
        Ratings[(ratings table<br/>id, user_id, recipe_id, rating)]
    end

    %% Connections: Frontend Internal
    App --> Router
    Router --> Pages
    Pages --> Components
    Components --> Context
    Context --> LocalStorage

    %% Connections: Frontend to Backend
    Components -->|HTTP Requests<br/>Fetch API| Server
    AuthCtx -->|store token| TokenStore
    AuthCtx -->|store user| UserStore

    %% Connections: Backend Internal
    Server --> Middleware
    Middleware --> APIRoutes
    APIRoutes --> Services

    %% Connections: Backend to Database
    Services -->|SQL Queries| Database

    %% Connections: Auth Flow
    AuthRoutes -->|verify token| JWT_Service
    AuthRoutes -->|hash/compare| Bcrypt
    CommentRoutes -->|create notification| NotifRoutes
```

---

## 3. Database Schema (ER Diagram)

```mermaid
erDiagram
    USERS ||--o{ RECIPES : "authors"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ FAVORITES : "saves"
    USERS ||--o{ FOLLOWS : "follows"
    USERS ||--o{ RATINGS : "rates"

    RECIPES ||--o{ COMMENTS : "has"
    RECIPES ||--o{ FAVORITES : "saved in"
    RECIPES ||--o{ RATINGS : "rated by"
    RECIPES }o--|| USERS : "author"

    COMMENTS ||--o{ COMMENTS : "replies to"
    NOTIFICATIONS }o--|| USERS : "sender"
    NOTIFICATIONS }o--|| COMMENTS : "references"

    USERS {
        int id PK
        varchar username
        varchar email
        varchar password_hash
        boolean is_admin
        timestamp created_at
    }

    RECIPES {
        int id PK
        varchar name
        text description
        text ingredients
        text instructions
        varchar image_url
        int author_id FK
        decimal average_rating
        int rating_count
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        int id PK
        int recipe_id FK
        int user_id FK
        int parent_comment_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        int id PK
        int recipient_id FK
        int sender_id FK
        enum type
        int recipe_id FK
        int comment_id FK
        boolean is_read
        timestamp created_at
    }

    FAVORITES {
        int id PK
        int user_id FK
        int recipe_id FK
        timestamp created_at
    }

    FOLLOWS {
        int id PK
        int follower_id FK
        int following_id FK
        timestamp created_at
    }

    RATINGS {
        int id PK
        int user_id FK
        int recipe_id FK
        int rating
        timestamp created_at
    }
```

---

## 4. Frontend Component Hierarchy

```mermaid
flowchart TD
    App[App.jsx] --> Navbar[Navbar]
    App --> Routes[Routes]

    Routes --> Home[Home Page]
    Routes --> Login[Login Page]
    Routes --> Register[Register Page]
    Routes --> RecipeList[Recipe List Page]
    Routes --> RecipeDetail[Recipe Detail Page]
    Routes --> UserProfile[User Profile Page]
    Routes --> AdminDashboard[Admin Dashboard]

    RecipeDetail --> RecipeHeader[RecipeHeader]
    RecipeDetail --> RecipeImage[RecipeImage]
    RecipeDetail --> RecipeMeta[RecipeMeta]
    RecipeDetail --> RecipeActions[RecipeActions]
    RecipeDetail --> CommentSection[CommentSection]

    CommentSection --> CommentForm[CommentForm]
    CommentSection --> CommentItem[CommentItem]
    CommentItem --> CommentVote[CommentVote]
    CommentItem --> CommentReply[Reply Button]

    RecipeDetail --> Notifications[Notifications]
    Notifications --> NotificationItem[NotificationItem]

    RecipeDetail --> AuthModal[AuthModal]
    RecipeDetail --> ShareModal[ShareModal]

    Navbar --> SearchBar[SearchBar]
    Navbar --> UserMenu[UserMenu]
    Navbar --> NotificationBell[NotificationBell]
```

---

## 5. Backend API Endpoints

```mermaid
flowchart LR
    subgraph Auth["Authentication"]
        POST_LOGIN[POST /api/login]
        POST_REGISTER[POST /api/register]
        GET_PROFILE[GET /api/profile]
    end

    subgraph Recipes["Recipes"]
        GET_RECIPES[GET /api/recipes]
        GET_RECIPE[GET /api/recipes/:id]
        POST_RECIPE[POST /api/recipes]
        PUT_RECIPE[PUT /api/recipes/:id]
        DELETE_RECIPE[DELETE /api/recipes/:id]
        GET_USER_RECIPES[GET /api/users/:id/recipes]
    end

    subgraph Comments["Comments"]
        GET_COMMENTS[GET /api/recipes/:id/comments]
        POST_COMMENT[POST /api/recipes/:id/comments]
        DELETE_COMMENT[DELETE /api/comments/:id]
        POST_VOTE[POST /api/comments/:id/vote]
    end

    subgraph Notifications["Notifications"]
        GET_NOTIFS[GET /api/notifications]
        GET_UNREAD[GET /api/notifications/unread-count]
        PUT_READ[PUT /api/notifications/:id/read]
        PUT_READ_ALL[PUT /api/notifications/read-all]
    end

    subgraph Favorites["Favorites"]
        GET_FAVS[GET /api/favorites]
        POST_FAV[POST /api/favorites]
        DELETE_FAV[DELETE /api/favorites/:id]
    end

    subgraph Ratings["Ratings"]
        POST_RATING[POST /api/recipes/:id/ratings]
        GET_RATINGS[GET /api/recipes/:id/ratings]
    end

    subgraph Follows["Follows"]
        POST_FOLLOW[POST /api/users/:id/follow]
        DELETE_FOLLOW[DELETE /api/users/:id/follow]
        GET_FOLLOWERS[GET /api/users/:id/followers]
        GET_FOLLOWING[GET /api/users/:id/following]
    end

    Auth --> Recipes
    Auth --> Comments
    Auth --> Notifications
    Auth --> Favorites
    Auth --> Ratings
    Auth --> Follows
```

---

## 6. Data Flow - Comment Reply with Notification

```mermaid
sequenceDiagram
    participant User as User (Frontend)
    participant API as Backend API
    participant DB as MySQL Database

    User->>API: POST /api/recipes/:id/comments<br/>{content, parent_comment_id}
    API->>API: authenticateToken()
    API->>DB: Insert comment with parent_comment_id
    DB-->>API: Return new comment ID

    API->>DB: Get parent comment author_id
    DB-->>API: Return parent comment user_id

    alt Parent comment author != current user
        API->>DB: Insert notification<br/>(recipient_id, sender_id, type='reply_to_comment', comment_id)
        DB-->>API: Notification created
    end

    API-->>User: Return new comment JSON
    User->>User: Update UI with new reply

    Note over User: Parent comment author receives<br/>notification: "user replied with 'text' on Recipe"
```

---

## 7. Notification System Flow

```mermaid
flowchart TD
    A[User replies to comment] --> B[Backend creates notification]
    B --> C[Store in notifications table<br/>with comment_id]
    C --> D[Frontend polls /api/notifications<br/>every 30 seconds]
    D --> E[Fetch notifications with<br/>JOIN comments for content]
    E --> F[Display: 'user replied with<br/>content on Recipe']
    F --> G{User clicks notification}
    G -->|Yes| H[Mark as read]
    H --> I[Navigate to recipe#comments]
```

---

## 8. Key Technologies

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, React Router v6, Context API |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Token), bcrypt |
| Styling | CSS Variables, Flexbox, Grid |
| State | React Context (Auth, Favorites, Notifications) |

---

## 9. File Structure

```
recipe-app/
├── backend/
│   └── server.js          # Express server, all API routes, DB init
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AuthModal.jsx
│       │   ├── CommentSection.jsx
│       │   ├── CommentItem.jsx
│       │   ├── CommentForm.jsx
│       │   ├── CommentVote.jsx
│       │   ├── Notifications.jsx
│       │   ├── RecipeDetail.jsx
│       │   └── ...
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── FavoritesContext.jsx
│       │   └── NotificationContext.jsx
│       ├── pages/
│       └── App.jsx
└── ARCHITECTURE.md       # This file
```
