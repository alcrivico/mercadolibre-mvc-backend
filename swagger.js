const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    // API Information
    title: "Backend Node.js API",
    description: "Esta es una API en node.js",
    version: "1.0.0", // Added API version
  },
  host: "localhost:3000",
  basePath: "/api", // Added base path
  schemes: ["http"], // Added supported schemes
  consumes: ["application/json"], // Added request content types
  produces: ["application/json"], // Added response content types
  securityDefinitions: {
    // Added security definitions
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "JWT authorization",
    },
  },
  tags: [
    // Added tags for organization
    {
      name: "Authentication",
      description: "User login endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
  ],
};

// Output file and routes configuration
const outputFile = "./swagger-output.json";
const routes = ["./index.js"];

// Generate Swagger documentation
swaggerAutogen(outputFile, routes, doc);
