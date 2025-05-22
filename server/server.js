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
  log(_fileName, _DebugBool, "=== Transforming Prepr data ===");
  log(
    _fileName,
    _DebugBool,
    "Raw Prepr data received:" + JSON.stringify(preprData, null, 2)
  );

  if (!preprData) {
    log(_fileName, _DebugBool, "No data from Prepr");
    return { projects: [] };
  }

  if (!preprData.Projects || !preprData.Projects.items) {
    log(_fileName, _DebugBool, "No Projects.items in Prepr data");
    log(_fileName, _DebugBool, "Available keys:" + Object.keys(preprData));
    if (preprData.Projects) {
      log(
        _fileName,
        _DebugBool,
        "Projects keys:" + Object.keys(preprData.Projects)
      );
    }
    return { projects: [] };
  }

  log(
    _fileName,
    _DebugBool,
    `Found ${preprData.Projects.items.length} projects in Prepr data`
  );

  const transformedProjects = preprData.Projects.items.map((project, index) => {
    log(
      _fileName,
      _DebugBool,
      `Processing project ${index + 1}:` + JSON.stringify(project)
    );

    let fullContent = [];
    if (Array.isArray(project.full_content)) {
      fullContent = project.full_content.map((content) => ({
        url: content.url || "",
      }));
    } else if (project.full_content?.url) {
      fullContent = [{ url: project.full_content.url }];
    }

    // Calculate aspect ratio and determine CSS class
    const width = project.featured_image?.width || 0;
    const height = project.featured_image?.height || 0;
    let aspectRatioClass = "square"; // default

    if (width > 0 && height > 0) {
      const aspectRatio = width / height;
      if (aspectRatio > 1) {
        aspectRatioClass = "landscape-card";
      } else if (aspectRatio < 1) {
        aspectRatioClass = "portrait-card";
      }
      // else it remains 'square' for ratio === 1
    }

    return {
      id: project._id,
      slug: project._slug,
      projectname: project.project_title || "",
      projectFeaturedImage: project.featured_image?.url || "",
      featuredImageWidth: width,
      featuredImageHeight: height,
      aspectRatioClass: aspectRatioClass,
      category: project.categorie ? project.categorie.replace(/_/g, " ") : "",
      projectDate: project.project_date || "",
      productionName: project.production_name || "",
      photographerName: project.photographer_name || "",
      forSale: project.for_sale || false,
      fullContent: fullContent,
      source: "prepr",
    };
  });

  log(
    _fileName,
    _DebugBool,
    `Transformed ${transformedProjects.length} projects from Prepr`
  );
  log(
    _fileName,
    _DebugBool,
    "Transformed projects:" + JSON.stringify(transformedProjects, null, 2)
  );
  return {
    projects: transformedProjects,
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
async function loadAllProjectData() {
  try {
    const preprData = await fetchFromPrepr(PROJECTS_QUERY);
    const transformedData = transformPreprData(preprData);

    if (
      transformedData &&
      transformedData.projects &&
      transformedData.projects.length > 0
    ) {
      log(
        _fileName,
        _DebugBool,
        `Successfully loaded ${transformedData.projects.length} projects from Prepr`
      );
      return transformedData.projects;
    }

    log(_fileName, _DebugBool, "No projects available from Prepr");
    return [];
  } catch (error) {
    log(_fileName, _DebugBool, "Error loading project data: " + error);
    return [];
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

app.get("/api/projects", async (req, res) => {
  const projects = await loadAllProjectData();

  // If random order is requested via query param
  if (req.query.random === "true") {
    const shuffledProjects = shuffleArray(projects);
    res.setHeader("Content-Type", "application/json");
    console.log("Sending randomly ordered projects");
    return res.send(JSON.stringify(shuffledProjects));
  }

  console.log("Sending projects in original order");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(projects));
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

// Projects route with randomized projects (moved from previous home route)
app.get("/projects", async (req, res) => {
  const projects = await loadAllProjectData();

  // Shuffle the projects to get a random order each time
  const randomizedProjects = shuffleArray(projects);

  log(
    _fileName,
    _DebugBool,
    `Serving ${randomizedProjects.length} projects in random order on /projects route`
  );
  console.log(
    `Serving ${randomizedProjects.length} projects in random order on /projects route`
  );

  return res.send(
    renderTemplate("server/views/projects/projects.liquid", {
      title: "Projects",
      projects: randomizedProjects,
    })
  );
});

// Render template helper
const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};
