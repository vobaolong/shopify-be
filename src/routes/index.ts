import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const routesPath = __dirname;

try {
	const files = fs.readdirSync(routesPath);
	const importPromises = files
		.filter(file => file !== 'index.ts' && file.endsWith('.route.ts'))
		.map(async (file) => {
			try {
				const filePath = path.join(routesPath, file);
				const fileUrl = pathToFileURL(filePath).href;
				const route = (await import(fileUrl)).default;

				if (route && typeof route.stack !== 'undefined') {
					router.use('/api/v1', route);
					console.log(`Loaded route: ${file}`);
				} else {
					console.error(`Failed to load route: ${file} - Invalid router export`);
				}
			} catch (importError) {
				console.error(`Error importing route file ${file}:`, importError);
			}
		});

	// Wait for all imports to complete before exporting the router
	Promise.all(importPromises)
		.then(() => {
			console.log('All routes loaded successfully');
		})
		.catch(error => {
			console.error('Error loading routes:', error);
		});
} catch (error) {
	console.error('Error reading routes directory:', error);
}

export default router;