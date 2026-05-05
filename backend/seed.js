const db = require('./db');
const bcrypt = require('bcryptjs');

const sampleRecipes = [
    // Breakfast Category
    {
        name: "Masala Dosa",
        description: "A popular South Indian breakfast dish made from fermented rice and lentil batter, filled with spiced potatoes.",
        ingredients: "2 cups rice\n1/2 cup urad dal\n1/2 tsp fenugreek seeds\nSalt to taste\n4 medium potatoes\n1 onion\n2 green chilies\n1/2 tsp turmeric\n1 tsp mustard seeds\nCurry leaves",
        instructions: "1. Soak rice and dal separately for 6 hours\n2. Grind to make batter and ferment overnight\n3. Prepare potato filling with spices\n4. Spread batter on hot tawa\n5. Add filling and fold",
        category: "breakfast",
        type: "veg",
        difficulty: "medium",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg"
    },
    {
        name: "Poha",
        description: "A light and healthy breakfast dish made from flattened rice, tempered with spices and peanuts.",
        ingredients: "2 cups poha\n1 onion\n1 potato\n2 green chilies\n1/2 tsp turmeric\n1 tsp mustard seeds\nCurry leaves\nPeanuts\nLemon juice",
        instructions: "1. Wash and drain poha\n2. Temper with spices\n3. Add vegetables\n4. Mix in poha\n5. Garnish with coriander",
        category: "breakfast",
        type: "veg",
        difficulty: "easy",
        time_required: "20 minutes",
        image_url: "https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg"
    },
    {
        name: "Idli Sambar",
        description: "Soft steamed rice cakes served with lentil-based vegetable stew.",
        ingredients: "2 cups idli batter\n1 cup toor dal\nMixed vegetables\nSambar powder\nTamarind\nMustard seeds\nCurry leaves",
        instructions: "1. Steam idli batter\n2. Cook dal with vegetables\n3. Prepare sambar\n4. Temper with spices\n5. Serve hot",
        category: "breakfast",
        type: "veg",
        difficulty: "medium",
        time_required: "40 minutes",
        image_url: "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg"
    },
    {
        name: "Upma",
        description: "A savory semolina porridge cooked with vegetables and spices.",
        ingredients: "1 cup semolina\n2 cups water\n1 onion\n1 carrot\nGreen peas\nMustard seeds\nCurry leaves\nCashews",
        instructions: "1. Roast semolina\n2. Temper with spices\n3. Add vegetables\n4. Cook with water\n5. Garnish with cashews",
        category: "breakfast",
        type: "veg",
        difficulty: "easy",
        time_required: "25 minutes",
        image_url: "https://images.pexels.com/photos/4955282/pexels-photo-4955282.jpeg"
    },
    {
        name: "Aloo Paratha",
        description: "Whole wheat flatbread stuffed with spiced mashed potatoes.",
        ingredients: "2 cups wheat flour\n3 potatoes\n1 onion\nGreen chilies\nCoriander leaves\nGaram masala\nGhee",
        instructions: "1. Prepare dough\n2. Make potato filling\n3. Stuff and roll parathas\n4. Cook on tawa\n5. Serve with curd",
        category: "breakfast",
        type: "veg",
        difficulty: "medium",
        time_required: "35 minutes",
        image_url: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg"
    },

    // Snack Category
    {
        name: "Pani Puri",
        description: "A popular street food snack consisting of hollow puris filled with spicy water, tamarind chutney, and potatoes.",
        ingredients: "20 puris\n2 cups boiled potatoes\n1 cup boiled chickpeas\n1/2 cup tamarind chutney\nMint-coriander water\nChaat masala\nSev for garnish",
        instructions: "1. Make a hole in puri\n2. Fill with potatoes and chickpeas\n3. Add tamarind chutney\n4. Pour mint water\n5. Garnish with sev",
        category: "snack",
        type: "veg",
        difficulty: "easy",
        time_required: "20 minutes",
        image_url: "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg"
    },
    {
        name: "Samosa",
        description: "Crispy fried pastry filled with spiced potatoes and peas.",
        ingredients: "2 cups flour\n3 potatoes\n1/2 cup peas\nSpices\nOil for frying\nGreen chutney",
        instructions: "1. Prepare dough\n2. Make potato filling\n3. Shape samosas\n4. Deep fry\n5. Serve with chutney",
        category: "snack",
        type: "veg",
        difficulty: "medium",
        time_required: "45 minutes",
        image_url: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg"
    },
    {
        name: "Bhel Puri",
        description: "A popular Mumbai street food made with puffed rice, vegetables, and tangy chutneys.",
        ingredients: "2 cups puffed rice\n1 onion\n1 tomato\nBoiled potatoes\nTamarind chutney\nGreen chutney\nSev\nCoriander",
        instructions: "1. Mix puffed rice with vegetables\n2. Add chutneys\n3. Toss well\n4. Add sev\n5. Serve immediately",
        category: "snack",
        type: "veg",
        difficulty: "easy",
        time_required: "15 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Vada Pav",
        description: "Mumbai's favorite street food - spicy potato fritter in a bun.",
        ingredients: "4 pav buns\n4 potatoes\nGreen chilies\nGarlic\nMustard seeds\nCurry leaves\nRed chutney",
        instructions: "1. Make potato filling\n2. Shape and fry vadas\n3. Prepare chutneys\n4. Assemble vada pav\n5. Serve hot",
        category: "snack",
        type: "veg",
        difficulty: "medium",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Dhokla",
        description: "Steamed savory cake made from fermented rice and chickpea batter.",
        ingredients: "1 cup besan\n1/2 cup yogurt\n1 tsp fruit salt\nGreen chilies\nMustard seeds\nCurry leaves\nCoconut",
        instructions: "1. Prepare batter\n2. Add fruit salt\n3. Steam in greased plate\n4. Temper with spices\n5. Cut and serve",
        category: "snack",
        type: "veg",
        difficulty: "medium",
        time_required: "40 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },

    // Lunch Category
    {
        name: "Biryani",
        description: "A fragrant rice dish cooked with spices, meat, and vegetables, layered and slow-cooked to perfection.",
        ingredients: "2 cups basmati rice\n500g chicken/mutton\n2 onions\n2 tomatoes\n1 cup yogurt\nWhole spices\nBiryani masala\nSaffron\nMint leaves",
        instructions: "1. Marinate meat with spices\n2. Parboil rice\n3. Layer rice and meat\n4. Add saffron milk\n5. Dum cook for 20 minutes",
        category: "lunch",
        type: "non-veg",
        difficulty: "hard",
        time_required: "60 minutes",
        image_url: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg"
    },
    {
        name: "Rajma Chawal",
        description: "Kidney beans curry served with steamed rice, a North Indian favorite.",
        ingredients: "1 cup rajma\n2 onions\n2 tomatoes\nGinger-garlic paste\nSpices\nFresh coriander\nSteamed rice",
        instructions: "1. Soak and cook rajma\n2. Prepare onion-tomato gravy\n3. Add cooked rajma\n4. Simmer with spices\n5. Serve with rice",
        category: "lunch",
        type: "veg",
        difficulty: "medium",
        time_required: "45 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Chole Bhature",
        description: "Spicy chickpea curry served with deep-fried bread.",
        ingredients: "2 cups chickpeas\n2 onions\n2 tomatoes\nGinger-garlic paste\nSpices\n2 cups flour\nYogurt",
        instructions: "1. Cook chickpeas\n2. Prepare gravy\n3. Make bhatura dough\n4. Fry bhaturas\n5. Serve together",
        category: "lunch",
        type: "veg",
        difficulty: "medium",
        time_required: "50 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Fish Curry",
        description: "Spicy fish curry made with coconut milk and traditional spices.",
        ingredients: "500g fish\n1 cup coconut milk\n2 onions\n2 tomatoes\nGinger-garlic paste\nSpices\nCurry leaves",
        instructions: "1. Marinate fish\n2. Prepare coconut gravy\n3. Add fish pieces\n4. Simmer gently\n5. Garnish with curry leaves",
        category: "lunch",
        type: "non-veg",
        difficulty: "medium",
        time_required: "40 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Dal Tadka",
        description: "Yellow lentils tempered with spices and served with rice or roti.",
        ingredients: "1 cup yellow dal\n2 tomatoes\n1 onion\nGinger-garlic paste\nSpices\nGhee\nFresh coriander",
        instructions: "1. Cook dal\n2. Prepare tadka\n3. Mix together\n4. Simmer for flavors\n5. Garnish and serve",
        category: "lunch",
        type: "veg",
        difficulty: "easy",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg"
    },

    // Dinner Category
    {
        name: "Butter Chicken",
        description: "A rich and creamy North Indian curry made with tender chicken pieces in a tomato-based sauce.",
        ingredients: "500g chicken\n1 cup yogurt\n2 tbsp butter\n1 onion\n2 tomatoes\n1 tbsp ginger-garlic paste\n1 tsp garam masala\n1/2 cup cream\nFresh coriander",
        instructions: "1. Marinate chicken in yogurt and spices\n2. Cook chicken in tandoor or oven\n3. Prepare tomato-based gravy\n4. Add cooked chicken to gravy\n5. Finish with cream and butter",
        category: "dinner",
        type: "non-veg",
        difficulty: "medium",
        time_required: "45 minutes",
        image_url: "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg"
    },
    {
        name: "Palak Paneer",
        description: "Creamy spinach curry with soft paneer cubes.",
        ingredients: "2 bunches spinach\n200g paneer\n1 onion\n2 tomatoes\nGinger-garlic paste\nSpices\nFresh cream",
        instructions: "1. Blanch spinach\n2. Make puree\n3. Prepare gravy\n4. Add paneer cubes\n5. Finish with cream",
        category: "dinner",
        type: "veg",
        difficulty: "medium",
        time_required: "35 minutes",
        image_url: "https://images.pexels.com/photos/3659862/pexels-photo-3659862.jpeg"
    },
    {
        name: "Mutton Rogan Josh",
        description: "Aromatic lamb curry from Kashmir with rich, spicy gravy.",
        ingredients: "500g mutton\n2 onions\n2 tomatoes\nGinger-garlic paste\nKashmiri spices\nYogurt\nFresh coriander",
        instructions: "1. Marinate mutton\n2. Prepare onion base\n3. Add spices and mutton\n4. Slow cook\n5. Garnish and serve",
        category: "dinner",
        type: "non-veg",
        difficulty: "hard",
        time_required: "90 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Malai Kofta",
        description: "Deep-fried vegetable balls in rich, creamy gravy.",
        ingredients: "2 potatoes\n1/2 cup paneer\nMixed vegetables\nCashews\nFresh cream\nSpices\nFresh coriander",
        instructions: "1. Make kofta mixture\n2. Shape and fry\n3. Prepare gravy\n4. Add koftas\n5. Finish with cream",
        category: "dinner",
        type: "veg",
        difficulty: "hard",
        time_required: "60 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Prawn Curry",
        description: "Spicy prawn curry with coconut milk and traditional spices.",
        ingredients: "500g prawns\n1 cup coconut milk\n2 onions\n2 tomatoes\nGinger-garlic paste\nSpices\nCurry leaves",
        instructions: "1. Clean prawns\n2. Prepare coconut gravy\n3. Add prawns\n4. Cook gently\n5. Garnish with curry leaves",
        category: "dinner",
        type: "non-veg",
        difficulty: "medium",
        time_required: "40 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },

    // Sweet Category
    {
        name: "Gulab Jamun",
        description: "A popular Indian sweet made from milk solids, deep-fried and soaked in sugar syrup.",
        ingredients: "1 cup milk powder\n1/4 cup all-purpose flour\n1/4 tsp baking soda\n2 tbsp ghee\nMilk as needed\n1.5 cups sugar\n1.5 cups water\nCardamom powder",
        instructions: "1. Mix dry ingredients\n2. Add ghee and milk to make dough\n3. Shape into balls\n4. Deep fry until golden\n5. Soak in sugar syrup",
        category: "sweet",
        type: "veg",
        difficulty: "easy",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/3681641/pexels-photo-3681641.jpeg"
    },
    {
        name: "Rasmalai",
        description: "Soft cottage cheese balls soaked in sweetened, thickened milk, flavored with cardamom and saffron.",
        ingredients: "1 liter milk\n1/2 cup sugar\n1/4 tsp cardamom powder\nFew strands saffron\n1 tbsp chopped pistachios",
        instructions: "1. Make chenna from milk\n2. Shape into balls\n3. Cook in sugar syrup\n4. Prepare thickened milk\n5. Soak balls in milk",
        category: "sweet",
        type: "veg",
        difficulty: "medium",
        time_required: "45 minutes",
        image_url: "https://images.pexels.com/photos/3659862/pexels-photo-3659862.jpeg"
    },
    {
        name: "Jalebi",
        description: "Crispy, spiral-shaped sweet made from fermented batter, deep-fried and soaked in sugar syrup.",
        ingredients: "1 cup all-purpose flour\n1/2 cup yogurt\n1/4 tsp baking soda\n1.5 cups sugar\n1 cup water\nSaffron\nGhee for frying",
        instructions: "1. Prepare batter\n2. Let it ferment\n3. Make sugar syrup\n4. Pipe and fry jalebis\n5. Soak in syrup",
        category: "sweet",
        type: "veg",
        difficulty: "hard",
        time_required: "60 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Kheer",
        description: "Creamy rice pudding made with milk, sugar, and flavored with cardamom and nuts.",
        ingredients: "1/4 cup rice\n1 liter milk\n1/2 cup sugar\n1/4 tsp cardamom powder\nMixed nuts\nSaffron",
        instructions: "1. Cook rice in milk\n2. Add sugar\n3. Flavor with cardamom\n4. Garnish with nuts\n5. Serve chilled",
        category: "sweet",
        type: "veg",
        difficulty: "easy",
        time_required: "40 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Besan Ladoo",
        description: "Sweet balls made from roasted gram flour, ghee, and sugar.",
        ingredients: "2 cups besan\n1 cup ghee\n1 cup powdered sugar\n1/4 tsp cardamom powder\nChopped nuts",
        instructions: "1. Roast besan in ghee\n2. Add sugar and cardamom\n3. Shape into balls\n4. Garnish with nuts\n5. Let it set",
        category: "sweet",
        type: "veg",
        difficulty: "medium",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },

    // Beverage Category
    {
        name: "Mango Lassi",
        description: "A refreshing yogurt-based drink made with ripe mangoes, perfect for hot summer days.",
        ingredients: "1 cup yogurt\n1 ripe mango\n2 tbsp sugar\n1/4 tsp cardamom powder\nIce cubes\nMint leaves for garnish",
        instructions: "1. Blend yogurt and mango\n2. Add sugar and cardamom\n3. Add ice cubes\n4. Blend until smooth\n5. Garnish with mint",
        category: "beverage",
        type: "veg",
        difficulty: "easy",
        time_required: "10 minutes",
        image_url: "https://images.pexels.com/photos/2432478/pexels-photo-2432478.jpeg"
    },
    {
        name: "Masala Chai",
        description: "Spiced Indian tea made with milk, tea leaves, and aromatic spices.",
        ingredients: "2 cups water\n2 cups milk\n4 tsp tea leaves\n2 tsp sugar\nGinger\nCardamom\nCloves\nCinnamon",
        instructions: "1. Boil water with spices\n2. Add tea leaves\n3. Add milk\n4. Add sugar\n5. Strain and serve",
        category: "beverage",
        type: "veg",
        difficulty: "easy",
        time_required: "15 minutes",
        image_url: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg"
    },
    {
        name: "Thandai",
        description: "Traditional cooling drink made with milk, nuts, and spices.",
        ingredients: "2 cups milk\nMixed nuts\nPoppy seeds\nFennel seeds\nCardamom\nSaffron\nSugar",
        instructions: "1. Soak nuts and seeds\n2. Make paste\n3. Mix with milk\n4. Add sugar\n5. Chill and serve",
        category: "beverage",
        type: "veg",
        difficulty: "medium",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Nimbu Pani",
        description: "Refreshing lemonade with a touch of Indian spices.",
        ingredients: "4 lemons\n4 cups water\n4 tbsp sugar\n1/2 tsp black salt\n1/2 tsp roasted cumin\nMint leaves",
        instructions: "1. Extract lemon juice\n2. Add water\n3. Add sugar and spices\n4. Mix well\n5. Serve chilled",
        category: "beverage",
        type: "veg",
        difficulty: "easy",
        time_required: "10 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    },
    {
        name: "Badam Milk",
        description: "Creamy almond milk flavored with saffron and cardamom.",
        ingredients: "1/2 cup almonds\n4 cups milk\n4 tbsp sugar\nFew strands saffron\n1/4 tsp cardamom powder",
        instructions: "1. Soak and peel almonds\n2. Make almond paste\n3. Mix with milk\n4. Add flavorings\n5. Serve warm",
        category: "beverage",
        type: "veg",
        difficulty: "medium",
        time_required: "30 minutes",
        image_url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
    }
];

async function seedDatabase() {
    try {
        // Clear existing data
        await db.query('DELETE FROM ratings');
        await db.query('DELETE FROM recipes');
        await db.query('DELETE FROM users');

        // Create admin user
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const [adminResult] = await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
            ['admin', 'admin@recipeapp.com', adminPasswordHash, 'Admin User', true]
        );
        const adminId = adminResult.insertId;
        console.log('Admin user created successfully!');

        // Insert recipes with is_default = true
        for (const recipe of sampleRecipes) {
            await db.query(
                'INSERT INTO recipes (name, description, ingredients, instructions, category, type, difficulty, time_required, image_url, author_id, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [recipe.name, recipe.description, recipe.ingredients, recipe.instructions, recipe.category, recipe.type, recipe.difficulty, recipe.time_required, recipe.image_url, adminId, true]
            );
        }
        console.log('Sample recipes added successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit();
    }
}

seedDatabase(); 