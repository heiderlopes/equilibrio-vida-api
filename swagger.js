const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Equilíbrio Vida & Trabalho API",
      version: "1.0.0",
      description: "API para atividades de bem-estar e produtividade",
    },
  },
  apis: ["./server.js"],
};

module.exports = swaggerJsDoc(options);
