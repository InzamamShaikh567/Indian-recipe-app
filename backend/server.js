const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { authenticateToken, requireAuth, requireAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins during development
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Auth endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
      [username, email, password_hash, full_name || null]
    );

    const userId = result[0].insertId;

    // Generate token
    const token = jwt.sign(
      { id: userId, username, email, is_admin: false },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: userId, username, email, full_name, is_admin: false }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        description: user.description,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, email, full_name, description, is_admin, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { full_name, description } = req.body;

    await db.query(
      "UPDATE users SET full_name = ?, description = ? WHERE id = ?",
      [full_name || null, description || null, req.user.id]
    );

    const [users] = await db.query(
      "SELECT id, username, email, full_name, description, is_admin FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.get("/api/recipes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const type = req.query.type || "";
    const difficulty = req.query.difficulty || "";

    let query = `
      SELECT r.*, u.username as author_name, u.is_admin as author_is_admin,
             COALESCE(AVG(rt.rating), 0) as average_rating,
             COUNT(rt.id) as rating_count
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
    `;
    let countQuery = "SELECT COUNT(*) as total FROM recipes r";
    const queryParams = [];
    const countParams = [];
    const conditions = [];

    if (search) {
      const searchPattern = "%" + search + "%";
      conditions.push("(r.name LIKE ? OR r.description LIKE ? OR r.category LIKE ?)");
      queryParams.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== "all") {
      conditions.push("r.category = ?");
      queryParams.push(category);
      countParams.push(category);
    }

    if (type && type !== "all") {
      conditions.push("r.type = ?");
      queryParams.push(type);
      countParams.push(type);
    }

    if (difficulty && difficulty !== "all") {
      conditions.push("r.difficulty = ?");
      queryParams.push(difficulty);
      countParams.push(difficulty);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " GROUP BY r.id ORDER BY r.created_at DESC LIMIT " + limit + " OFFSET " + offset;
    // offset and limit are now in the query string

    const [recipes] = await db.query(query, queryParams);
    const [totalResult] = await db.query(countQuery, countParams);
    const total = totalResult[0].total;
    const hasMore = page * limit < total;

    res.json({ recipes: recipes || [], page, limit, total, hasMore });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: error.message });
  }
});
// Get current user's recipes with pagination
app.get("/api/recipes/me", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const [recipes] = await db.query(`
      SELECT r.*, u.username as author_name, u.is_admin as author_is_admin
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.author_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    const [totalResult] = await db.query(
      "SELECT COUNT(*) as total FROM recipes WHERE author_id = ?",
      [req.user.id]
    );
    const total = totalResult[0].total;
    const hasMore = page * limit < total;

    res.json({ recipes, page, limit, total, hasMore });
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const [recipe] = await db.query(`
      SELECT r.*, u.username as author_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ?
    `, [req.params.id]);
    if (recipe.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/recipes", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      instructions,
      category,
      type,
      difficulty,
      time_required,
      image_url,
    } = req.body;
    const result = await db.query(
      "INSERT INTO recipes (name, description, ingredients, instructions, category, type, difficulty, time_required, image_url, author_id, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        ingredients,
        instructions,
        category,
        type,
        difficulty,
        time_required,
        image_url,
        req.user.id,
        false
      ]
    );
    res.status(201).json({ id: result[0].insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/recipes/:id", authenticateToken, async (req, res) => {
  try {
    // Check ownership
    const [recipes] = await db.query("SELECT * FROM recipes WHERE id = ?", [req.params.id]);
    if (recipes.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const recipe = recipes[0];

    // Only author or admin can delete
    if (recipe.author_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ message: "You can only delete your own recipes" });
    }

    const result = await db.query("DELETE FROM recipes WHERE id = ?", [req.params.id]);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/recipes/:id", authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipeData = req.body;

    // Check ownership
    const [recipes] = await db.query("SELECT * FROM recipes WHERE id = ?", [recipeId]);
    if (recipes.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const recipe = recipes[0];

    // Only author or admin can edit
    if (recipe.author_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ message: "You can only edit your own recipes" });
    }

    // Update recipe with only the provided fields
    const updateFields = [];
    const updateValues = [];

    // Build the update query dynamically based on provided fields
    Object.entries(recipeData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add the recipe ID to the values array
    updateValues.push(recipeId);

    // Construct the update query
    const updateQuery = `UPDATE recipes SET ${updateFields.join(", ")} WHERE id = ?`;

    // Execute the update
    const result = await db.query(updateQuery, updateValues);

    // Get the updated recipe
    const [updatedRecipe] = await db.query(
      "SELECT * FROM recipes WHERE id = ?",
      [recipeId]
    );
    res.json(updatedRecipe[0]);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Error updating recipe" });
  }
});

// Rating endpoints
app.get("/api/recipes/:id/ratings", async (req, res) => {
  try {
    const [ratings] = await db.query(
      "SELECT * FROM ratings WHERE recipe_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recipes/:id/average-rating", async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as rating_count FROM ratings WHERE recipe_id = ?",
      [req.params.id]
    );

    // Handle case where no ratings exist
    const data = result[0] || { average_rating: null, rating_count: 0 };

    const avgRating = data.average_rating ? parseFloat(data.average_rating) : 0;

    res.json({
      averageRating: avgRating > 0 ? avgRating.toFixed(1) : 0,
      ratingCount: data.rating_count || 0,
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/recipes/:id/ratings", authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const result = await db.query(
      "INSERT INTO ratings (recipe_id, user_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, created_at = CURRENT_TIMESTAMP",
      [req.params.id, req.user.id, rating, rating]
    );

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, email, full_name, description, is_admin, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, email, full_name, description, is_admin, created_at FROM users WHERE id = ?",
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Get user's recipes
    const [recipes] = await db.query(
      "SELECT id, name, category, type, difficulty, created_at FROM recipes WHERE author_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );

    res.json({ ...user, recipes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { full_name, description, is_admin } = req.body;

    await db.query(
      "UPDATE users SET full_name = ?, description = ?, is_admin = ? WHERE id = ?",
      [full_name || null, description || null, is_admin || false, req.params.id]
    );

    const [users] = await db.query(
      "SELECT id, username, email, full_name, description, is_admin, created_at FROM users WHERE id = ?",
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const result = await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow endpoints
app.post("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if user exists
    const [users] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const [existing] = await db.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Already following this user" });
    }

    await db.query(
      "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
      [followerId, userId]
    );

    res.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followerId = req.user.id;

    const result = await db.query(
      "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, userId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id/followers", async (req, res) => {
  try {
    const [followers] = await db.query(`
      SELECT u.id, u.username, u.full_name, u.description
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [req.params.id]);

    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id/following", async (req, res) => {
  try {
    const [following] = await db.query(`
      SELECT u.id, u.username, u.full_name, u.description
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `, [req.params.id]);

    res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id/is-following", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [req.user.id, req.params.id]
    );

    res.json({ isFollowing: result.length > 0 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get recipes from followed users (following feed)
app.get("/api/users/me/following-feed", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page -1) * limit;

    const [recipes] = await db.query(`
      SELECT r.*, u.username as author_name, u.is_admin as author_is_admin
      FROM recipes r
      JOIN follows f ON r.author_id = f.following_id
      LEFT JOIN users u ON r.author_id = u.id
      WHERE f.follower_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    const [totalResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM recipes r
      JOIN follows f ON r.author_id = f.following_id
      WHERE f.follower_id = ?
    `, [req.user.id]);

    const total = totalResult[0].total;
    const hasMore = page * limit < total;

    res.json({ recipes, page, limit, total, hasMore });
  } catch (error) {
    console.error("Error fetching following feed:", error);
    res.status(500).json({ error: error.message });
  }
});


// Favorites endpoints
app.get("/api/users/me/favorites", authenticateToken, async (req, res) => {
  try {
    const [favorites] = await db.query(`
      SELECT r.*, u.username as author_name, u.is_admin as author_is_admin
      FROM favorites f
      JOIN recipes r ON f.recipe_id = r.id
      LEFT JOIN users u ON r.author_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/recipes/:id/favorite", authenticateToken, async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);

    // Check if recipe exists
    const [recipes] = await db.query("SELECT id FROM recipes WHERE id = ?", [recipeId]);
    if (recipes.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Check if already favorited
    const [existing] = await db.query(
      "SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [req.user.id, recipeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Recipe already in favorites" });
    }

    await db.query(
      "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
      [req.user.id, recipeId]
    );

    res.json({ message: "Recipe added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/recipes/:id/favorite", authenticateToken, async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);

    const result = await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [req.user.id, recipeId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(400).json({ error: "Recipe not in favorites" });
    }

    res.json({ message: "Recipe removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recipes/:id/is-favorite", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [req.user.id, req.params.id]
    );

    res.json({ isFavorite: result.length > 0 });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Comment endpoints
app.get("/api/recipes/:id/comments", async (req, res) => {
  try {
    const recipeId = req.params.id;
    let userId = null;

    // Optional authentication
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid, proceed without user context
      }
    }

    // Get all comments with author info and vote counts
    const [comments] = await db.query(`
      SELECT c.*,
             u.username as author_name,
             u.is_admin as author_is_admin,
             COALESCE(SUM(CASE WHEN cv.vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
             COALESCE(SUM(CASE WHEN cv.vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_votes cv ON c.id = cv.comment_id
      WHERE c.recipe_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [recipeId]);

    // Get user's votes if authenticated
    let userVotes = {};
    if (userId) {
      const [votes] = await db.query(
        'SELECT comment_id, vote_type FROM comment_votes WHERE user_id = ?',
        [userId]
      );
      userVotes = votes.reduce((acc, v) => ({ ...acc, [v.comment_id]: v.vote_type }), {});
    }

    // Build nested structure
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      comment.replies = [];
      comment.user_vote = userVotes[comment.id] || null;
      commentMap[comment.id] = comment;
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        commentMap[comment.parent_comment_id].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    res.json(rootComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/recipes/:id/comments", authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { content, parent_comment_id } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
    }

    // Verify recipe exists
    const [recipes] = await db.query('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // If replying, verify parent comment exists and belongs to same recipe
    if (parent_comment_id) {
      const [parentComments] = await db.query(
        'SELECT id FROM comments WHERE id = ? AND recipe_id = ?',
        [parent_comment_id, recipeId]
      );
      if (parentComments.length === 0) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }
    }

    const result = await db.query(
      'INSERT INTO comments (recipe_id, user_id, parent_comment_id, content) VALUES (?, ?, ?, ?)',
      [recipeId, req.user.id, parent_comment_id || null, content.trim()]
    );

    // Fetch the created comment with author info
    const [newComment] = await db.query(`
      SELECT c.*, u.username as author_name, u.is_admin as author_is_admin
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result[0].insertId]);

    // Send notification for new comment
    if (!parent_comment_id) {
      // Top-level comment on recipe → notify recipe author
      const [recipe] = await db.query('SELECT author_id FROM recipes WHERE id = ?', [recipeId]);
      const recipeAuthorId = recipe[0]?.author_id;
      if (recipeAuthorId && recipeAuthorId !== req.user.id) {
        await db.query(
          'INSERT INTO notifications (recipient_id, sender_id, type, recipe_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [recipeAuthorId, req.user.id, 'comment_on_recipe', recipeId, newComment[0].id]
        );
      }
    } else {
      // Reply to a comment → notify parent comment author
      const [parentComment] = await db.query('SELECT user_id FROM comments WHERE id = ?', [parent_comment_id]);
      const parentAuthorId = parentComment[0]?.user_id;
      if (parentAuthorId && parentAuthorId !== req.user.id) {
        await db.query(
          'INSERT INTO notifications (recipient_id, sender_id, type, recipe_id, comment_id) VALUES (?, ?, ?, ?, ?)',
          [parentAuthorId, req.user.id, 'reply_to_comment', recipeId, newComment[0].id]
        );
      }
    }

    res.status(201).json({ ...newComment[0], upvotes: 0, downvotes: 0, user_vote: null, replies: [] });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/comments/:id/vote", authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { vote_type } = req.body;

    if (!vote_type || !['up', 'down'].includes(vote_type)) {
      return res.status(400).json({ error: 'Valid vote_type (up/down) is required' });
    }

    // Verify comment exists
    const [comments] = await db.query('SELECT id FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already voted
    const [existingVotes] = await db.query(
      'SELECT vote_type FROM comment_votes WHERE user_id = ? AND comment_id = ?',
      [req.user.id, commentId]
    );

    if (existingVotes.length > 0) {
      if (existingVotes[0].vote_type === vote_type) {
        // Same vote - remove it (toggle off)
        await db.query(
          'DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?',
          [req.user.id, commentId]
        );
      } else {
        // Different vote - update it
        await db.query(
          'UPDATE comment_votes SET vote_type = ? WHERE user_id = ? AND comment_id = ?',
          [vote_type, req.user.id, commentId]
        );
      }
    } else {
      // New vote
      await db.query(
        'INSERT INTO comment_votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)',
        [req.user.id, commentId, vote_type]
      );
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
  try {
    // Get the comment
    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[0];

    // Check if user is owner or admin
    if (comment.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment (cascade will handle replies and votes)
    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Notification endpoints
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [notifications] = await db.query(`
      SELECT n.*,
             u.username as sender_name,
             r.name as recipe_name,
             c.content as comment_content
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      LEFT JOIN recipes r ON n.recipe_id = r.id
      LEFT JOIN comments c ON n.comment_id = c.id
      WHERE n.recipient_id = ?
      ORDER BY n.is_read ASC, n.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM notifications WHERE recipient_id = ?',
      [req.user.id]
    );
    const total = totalResult[0].total;
    const hasMore = page * limit < total;

    res.json({ notifications, page, limit, total, hasMore });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = false',
      [req.user.id]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE recipient_id = ? AND is_read = false',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create favorites table if not exists
const initFavoritesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, recipe_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `);
    console.log('Favorites table initialized');
  } catch (error) {
    console.error('Error creating favorites table:', error);
  }
};

// Create follows table if not exists
const initFollowsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS follows (
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Follows table initialized');
  } catch (error) {
    console.error('Error creating follows table:', error);
  }
};

// Create comments table if not exists
const initCommentsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipe_id INT NOT NULL,
        user_id INT NOT NULL,
        parent_comment_id INT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
    console.log('Comments table initialized');
  } catch (error) {
    console.error('Error creating comments table:', error);
  }
};

// Create comment_votes table if not exists
const initCommentVotesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS comment_votes (
        user_id INT NOT NULL,
        comment_id INT NOT NULL,
        vote_type ENUM('up', 'down') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, comment_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
    console.log('Comment votes table initialized');
  } catch (error) {
    console.error('Error creating comment votes table:', error);
  }
};

// Create notifications table if not exists
const initNotificationsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipient_id INT NOT NULL,
        sender_id INT NOT NULL,
        type ENUM('comment_on_recipe', 'reply_to_comment') NOT NULL,
        recipe_id INT NULL,
        comment_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        INDEX idx_recipient_unread (recipient_id, is_read)
      )
    `);
    console.log('Notifications table initialized');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  }
};

const initDb = async () => {
  await initFavoritesTable();
  await initFollowsTable();
  await initCommentsTable();
  await initCommentVotesTable();
  await initNotificationsTable();
};

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});




