import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { Liquid } from "liquidjs";
import { log } from "../client/debug.js";
import sirv from "sirv";

const _DebugBool = false;
const _fileName = "server";

// Configuration
const PREPR_CONFIG = {
  apiUrl:
    "https://graphql.prepr.io/ac_c957f8b18f145116ffd7434e47029e0deee9d41f2d76f4e2b52612e400da0d1c",
  token: "ac_c957f8b18f145116ffd7434e47029e0deee9d41f2d76f4e2b52612e400da0d1c",
};

// GraphQL query to fetch projects from Prepr
const PROJECTS_QUERY = `
query GetProjects {
    Projects {
        items {
            _id
            _slug
            project_title
            production_name
            featured_image {
                url
                height
                width
            }
            photographer_name
            project_date
            for_sale
            categorie
            full_content {
                url
            }
        }
    }
}
`;

const ITEMS_QUERY = `
query GetItems {
    SquareItems {
    items {
      _id
      item_name
      item_image {
        url
       
      }
    }
  }
}
`;


const engine = new Liquid({
  extname: ".liquid",
});

const app = new App();

// GraphQL fetch from Prepr
async function fetchFromPrepr(query, variables = {}) {
  try {
    log(_fileName, _DebugBool, "=== Starting Prepr GraphQL fetch ===");
    log(_fileName, _DebugBool, "URL:" + PREPR_CONFIG.apiUrl);

    const response = await fetch(PREPR_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PREPR_CONFIG.token}`,
        "User-Agent": "Node-Portfolio-App",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    log(_fileName, _DebugBool, "Response status:" + response.status);

    if (!response.ok) {
      log(_fileName, _DebugBool, `HTTP error! status: ${response.status}`);
      const text = await response.text();
      log(_fileName, _DebugBool, "Error response:" + text);
      return null;
    }

    const data = await response.json();
    log(
      _fileName,
      _DebugBool,
      "Raw response data:" + JSON.stringify(data, null, 2)
    );

    if (data.errors) {
      log(
        _fileName,
        _DebugBool,
        "GraphQL errors:" + JSON.stringify(data.errors)
      );
      if (data.data) {
        log(_fileName, _DebugBool, "Returning partial data despite errors");
        return data.data;
      }
      return null;
    }

    return data.data;
  } catch (error) {
    log(_fileName, _DebugBool, "Error fetching from Prepr:" + error);
    return null;
  }
}

// Transform Prepr data from GraphQL
function transformPreprData(preprData) {
    log(_fileName, _DebugBool, '=== Transforming Prepr data ===');
    
    if (!preprData) {
        log(_fileName, _DebugBool, 'No data from Prepr');
        return { projects: [], categories: [] };
    }
    
    if (!preprData.Projects || !preprData.Projects.items) {
        log(_fileName, _DebugBool, 'No Projects.items in Prepr data');
        return { projects: [], categories: [] };
    }
    
    log(_fileName, _DebugBool, `Found ${preprData.Projects.items.length} projects in Prepr data`);
    
    // Set to collect unique categories
    const uniqueCategories = new Set();
    
    const transformedProjects = preprData.Projects.items.map((project, index) => {
        // Extract and format category
        const category = project.categorie ? project.categorie.replace(/_/g, ' ') : '';
        
        // Add to unique categories collection if it exists
        if (category && category.trim() !== '') {
            uniqueCategories.add(category);
        }
        
        // Rest of transformation code...
        let fullContent = [];
        if (Array.isArray(project.full_content)) {
            fullContent = project.full_content.map(content => ({
                url: content.url || ''
            }));
        } else if (project.full_content?.url) {
            fullContent = [{ url: project.full_content.url }];
        }
        
        // Calculate aspect ratio and determine CSS class
        const width = project.featured_image?.width || 0;
        const height = project.featured_image?.height || 0;
        let aspectRatioClass = 'square'; // default
        
        if (width > 0 && height > 0) {
            const aspectRatio = width / height;
            if (aspectRatio > 1) {
                aspectRatioClass = 'landscape-card';
            } else if (aspectRatio < 1) {
                aspectRatioClass = 'portrait-card';
            }
        }
        
        return {
            id: project._id,
            slug: project._slug,
            projectname: project.project_title || '',
            projectFeaturedImage: project.featured_image?.url || '',
            featuredImageWidth: width,
            featuredImageHeight: height,
            aspectRatioClass: aspectRatioClass,
            category: category,
            projectDate: project.project_date || '',
            productionName: project.production_name || '',
            photographerName: project.photographer_name || '',
            forSale: project.for_sale || false,
            fullContent: fullContent,
            source: 'prepr'
        };
    });
    
    // Convert the Set to sorted array
    const categories = Array.from(uniqueCategories).sort();
    
    log(_fileName, _DebugBool, `Transformed ${transformedProjects.length} projects from Prepr`);
    log(_fileName, _DebugBool, `Extracted ${categories.length} unique categories: ${categories.join(', ')}`);
    
    return {
        projects: transformedProjects,
        categories: categories
    };
}


// Helper function to shuffle an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Load all project data
// Load all project data and items data
async function loadAllProjectData() {

    try {
        // First fetch items data
        const itemsData = await fetchFromPrepr(ITEMS_QUERY);
        
        // Then fetch projects data
        const preprData = await fetchFromPrepr(PROJECTS_QUERY);
        const transformedData = transformPreprData(preprData);
        
        // IMPORTANT: Transform the items data too!
        const transformedItems = transformSquareItemsData(itemsData);
        
        if (transformedData && transformedData.projects && transformedData.projects.length > 0) {
            log(_fileName, _DebugBool, `Successfully loaded ${transformedData.projects.length} projects from Prepr`);
            log(_fileName, _DebugBool, `Successfully loaded ${transformedItems.length} items from Prepr`);
            log(_fileName, _DebugBool, `Successfully loaded ${transformedData.categories.length} categories from Prepr`);
            
            return {
                items: transformedItems, // Now properly transformed
                projects: transformedData.projects,
                categories: transformedData.categories
            };
        }
        
        log(_fileName, _DebugBool, 'No projects available from Prepr');
        return {
            items: transformedItems || [], // Return transformed items even if no projects
            projects: [],
            categories: []
        };
    } catch (error) {
        log(_fileName, _DebugBool, 'Error loading project data: ' + error);
        return {
            items: [],
            projects: [],
            categories: []
        };
    }

}


// Setup middleware
async function setupMiddleware() {
  app.use(logger());

  // Serve static files
  app.use("/resources", sirv("public/resources", { dev: true }));
  app.use("/public", sirv("public", { dev: true }));
  app.use("/", sirv("dist", { dev: true }));
}

// Setup middleware
setupMiddleware();

// Start server
app.listen(3000, () =>
  console.log("Server available on http://localhost:3000")
);

// API Routes for client-side access
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get('/api/projects', async (req, res) => {
    const projectData = await loadAllProjectData();
    const projects = projectData.projects;

    
    // If random order is requested via query param
    if (req.query.random === 'true') {
        const shuffledProjects = shuffleArray(projects);
        res.setHeader('Content-Type', 'application/json');
        console.log('Sending randomly ordered projects');
        return res.send(JSON.stringify({
            projects: shuffledProjects,
            categories: projectData.categories,
            items: projectData.items
        }));
    }
    
    console.log('Sending projects in original order');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        projects: projects,
        categories: projectData.categories
    }));
});

app.get("/api/projects/:id", async (req, res) => {
  const projects = await loadAllProjectData();
  const project = projects.find((p) => p.id === req.params.id);

  if (project) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(project));
  } else {
    res.status(404).send({ error: "Project not found" });
  }
});

app.get('/api/categories', async (req, res) => {
    const projectData = await loadAllProjectData();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(projectData.categories));
});

// New Home route without project data
app.get("/", async (req, res) => {
  log(_fileName, _DebugBool, "Serving home page without project data");
  console.log("Serving home page without project data");

  return res.send(
    renderTemplate("server/views/index.liquid", {
      title: "Home",
    })
  );
});


function transformSquareItemsData(itemsData) {
    if (!itemsData || !itemsData.SquareItems || !itemsData.SquareItems.items) {
        console.log('No SquareItems found in data');
        return [];
    }
    
    const squareItems = itemsData.SquareItems.items.map((item, index) => {
        return {
            id: `square-item-${index}`,
            title: item.item_name || `Item ${index + 1}`,
            category: item.category || "Design", // Default category if not provided
            image: item.item_image?.url || "",
            type: "square", // This is what the template checks for
            aspectRatioClass: "square", // For CSS styling
            source: 'square-item' // To distinguish from 'prepr' projects
        };
    });
    
    console.log(`Transformed ${squareItems.length} square items`);
    return squareItems;
}

// Add a dedicated endpoint for square items
app.get('/api/square-items', async (req, res) => {
    try {
        const itemsData = await fetchFromPrepr(ITEMS_QUERY);
        const squareItems = transformSquareItemsData(itemsData);
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(squareItems));
        console.log(squareItems);
    } catch (error) {
        console.error('Error fetching square items:', error);
        res.status(500).send({ error: 'Failed to fetch square items' });
    }
});

// Projects route with randomized projects (moved from previous home route)

app.get('/projects', async (req, res) => {
    try {
        const projectData = await loadAllProjectData();
        const projects = projectData.projects;
        const items = projectData.items; // Now properly transformed
        
        // Combine projects and items
        const together = projects.concat(items);
        
        // Shuffle the combined array to get a random order each time
        const randomizedProjects = shuffleArray(together);
        
        log(_fileName, _DebugBool, `Serving ${projects.length} projects and ${items.length} items (${randomizedProjects.length} total) in random order on /projects route`);
        log(_fileName, _DebugBool, `Passing ${projectData.categories.length} categories to template`);
        console.log(`Serving ${projects.length} projects and ${items.length} items (${randomizedProjects.length} total) in random order on /projects route`);
        console.log(`Serving ${projectData.categories.length} categories: ${projectData.categories.join(', ')}`);
        
        console.log('Categories being passed to template:', projectData.categories);
        console.log('Sample of combined data:', randomizedProjects.slice(0, 3)); // Debug: show first 3 items

        return res.send(renderTemplate('server/views/projects/projects.liquid', { 
            title: 'Projects',
            projects: randomizedProjects, // This now contains both projects and transformed items
            categories: projectData.categories
        }));
    } catch (error) {
        console.error('Error rendering projects page:', error);
        return res.status(500).send('An error occurred while loading projects');
    }
});

// Render template helper
const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};
