// Clean Server.js - Data only, no HTML generation

import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { Liquid } from "liquidjs";
import { log } from "../client/debug.js";
import sirv from "sirv";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const _DebugBool = false;
const _fileName = "server";

// Configuration with environment variables
const PREPR_CONFIG = {
  apiUrl: process.env.PREPR_API_URL,
  token: process.env.PREPR_TOKEN,
};

// Validate required environment variables
if (!process.env.PREPR_TOKEN) {
  console.warn("Warning: PREPR_TOKEN not found in environment variables, using fallback");
}
// GraphQL queries
const PROJECTS_QUERY = `
query GetProjects {
    Projects (limit: 1000)  {
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

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.log("GraphQL errors:", data.errors);
      if (data.data) {
        return data.data;
      }
      return null;
    }

    return data.data;
  } catch (error) {
    console.log("Error fetching from Prepr:", error);
    return null;
  }
}

// Helper function to parse and sort dates
function parseProjectDate(dateString) {
    if (!dateString) return new Date(0); // Default to epoch for missing dates
    
    // Handle various date formats that might come from Prepr
    const date = new Date(dateString);
    
    // If the date is invalid, try parsing as ISO string or other common formats
    if (isNaN(date.getTime())) {
        // Try parsing as YYYY-MM-DD format
        const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
        }
        
        // If all else fails, return epoch
        console.warn(`Could not parse date: ${dateString}`);
        return new Date(0);
    }
    
    return date;
}

// Transform Prepr project data
function transformPreprData(preprData) {
    if (!preprData?.Projects?.items) {
        return { projects: [], categories: [] };
    }
    
    const uniqueCategories = new Set();
    
    const transformedProjects = preprData.Projects.items.map((project) => {
        const category = project.categorie ? project.categorie.replace(/_/g, ' ') : '';
        
        if (category && category.trim() !== '') {
            uniqueCategories.add(category);
        }
        
        // Calculate aspect ratio and determine CSS class
        const width = project.featured_image?.width || 0;
        const height = project.featured_image?.height || 0;
        let aspectRatioClass = 'square';
        
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
            projectDateParsed: parseProjectDate(project.project_date), // Add parsed date for sorting
            productionName: project.production_name || '',
            photographerName: project.photographer_name || '',
            forSale: project.for_sale || false,
            source: 'prepr'
        };
    });
    
    // Sort projects by date - newest first (descending order)
    transformedProjects.sort((a, b) => {
        return b.projectDateParsed.getTime() - a.projectDateParsed.getTime();
    });
    
    const categories = Array.from(uniqueCategories).sort();
    
    console.log(`Transformed ${transformedProjects.length} projects from Prepr`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Date range: ${transformedProjects[transformedProjects.length - 1]?.projectDate} to ${transformedProjects[0]?.projectDate}`);
    
    return {
        projects: transformedProjects,
        categories: categories
    };
}

// Transform square items data
function transformSquareItemsData(itemsData) {
    if (!itemsData?.SquareItems?.items) {
        return [];
    }
    
    const squareItems = itemsData.SquareItems.items.map((item, index) => {
        return {
            id: `square-item-${index}`,
            title: item.item_name || `Item ${index + 1}`,
            category: "square-item",
            image: item.item_image?.url || "",
            type: "square",
            aspectRatioClass: "square",
            source: 'square-item'
        };
    });
    
    console.log(`Transformed ${squareItems.length} square items`);
    return squareItems;
}

// Load all data for the system
async function loadAllData() {
    try {
        console.log('=== Loading all data ===');
        
        // Fetch both datasets
        const [projectsData, itemsData] = await Promise.all([
            fetchFromPrepr(PROJECTS_QUERY),
            fetchFromPrepr(ITEMS_QUERY)
        ]);
        
        // Transform the data
        const transformedProjects = transformPreprData(projectsData);
        const transformedItems = transformSquareItemsData(itemsData);
        
        console.log(`Loaded ${transformedProjects.projects.length} projects`);
        console.log(`Loaded ${transformedItems.length} square items`);
        
        return {
            projects: transformedProjects.projects,
            squares: transformedItems,
            categories: transformedProjects.categories,
            custom: [
                {
                    id: 'break-glass-1',
                    title: 'Break Glass Interactive',
                    type: 'custom',
                    category: 'interactive',
                    source: 'custom'
                }
            ]
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return {
            projects: [],
            squares: [],
            custom: [],
            categories: []
        };
    }
}

// Setup middleware
app.use(logger());
app.use("/resources", sirv("public/resources", { dev: true }));
app.use("/public", sirv("public", { dev: true }));
app.use("/", sirv("dist", { dev: true }));

// CORS middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Home route
app.get("/", async (req, res) => {
    return res.send(renderTemplate("server/views/index.liquid", {
        title: "Home",
    }));
});

// Main projects route - pass data to Liquid for HTML generation
app.get('/projects', async (req, res) => {
    try {
        console.log('=== Serving /projects route ===');
        
        const allData = await loadAllData();
        
        // Add this logging to see the actual order being sent
        console.log('First 10 projects in order being sent to template:');
        allData.projects.slice(0, 10).forEach((project, index) => {
            console.log(`${index + 1}. ${project.projectname} - ${project.projectDate} (${project.projectDateParsed.toISOString()})`);
        });
        
        return res.send(renderTemplate('server/views/projects/projects.liquid', { 
            title: 'Projects',
            allData: allData,
            categories: allData.categories
        }));
    } catch (error) {
        console.error('Error rendering projects page:', error);
        return res.status(500).send('An error occurred while loading projects');
    }
});

// API endpoint for client-side if needed
app.get('/api/grid-data', async (req, res) => {
    try {
        const allData = await loadAllData();
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(allData));
    } catch (error) {
        console.error('Error in /api/grid-data:', error);
        res.status(500).send({ error: 'Failed to load grid data' });
    }
});

// Helper function to render templates
const renderTemplate = (template, data) => {
    return engine.renderFileSync(template, data);
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server available on http://localhost:${PORT}`);
    console.log("Clean data-only server running");
});

export default app;