import swaggerJSDoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Shopify API',
			version: '1.0.0',
			description: 'API documentation for Shopify-like backend',
		},
		servers: [
			{ url: 'http://localhost:5000/api/v1/' }
		],
	},
	apis: ['./src/routes/*.route.ts'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
