/**
 * OGP Image Generator
 * This script generates Open Graph Protocol (OGP) images for blog posts
 * using the canvas library and Hugo's list command.
 */

// Required modules
const { execSync } = require("child_process");  // For executing Hugo commands
const { createCanvas, loadImage, registerFont } = require("canvas");  // For image manipulation
const path = require("path");  // For file path operations
const fs = require("fs");  // For file system operations

// Register Japanese font for text rendering
registerFont(
    'tools/NotoSansJP-Black.ttf',
    { family: 'Noto Sans CJK' }
);

/**
 * Calculate text dimensions (width and height) based on the given context and text
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to measure
 * @returns {Object} Object containing width and height of the text
 */
const textSize = (context, text) => {
    const measure = context.measureText(text);
    const width = measure.width;
    const height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
    return { width, height };
};

/**
 * Split text into multiple lines to fit within a maximum width
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to split
 * @param {number} maxWidth - Maximum width for each line
 * @returns {Array} Array of text lines
 */
const splitLine = (context, text, maxWidth) => {
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < text.length; ++i) {
	const char = text[i];
	const tempLine = currentLine + char;
	const { width } = textSize(context, tempLine);

	if (width > maxWidth) {
	    lines.push(currentLine);
	    currentLine = char;
	} else {
	    currentLine = tempLine;
	}
    }

    if (currentLine) {
	lines.push(currentLine);
    }

    return lines;
};

/**
 * Draw the blog title on the canvas
 * @param {CanvasRenderingContext2D} context - Canvas context
 */
const writeTitle = (context) => {
    context.fillStyle = '#ffffff';
    context.font = '60px Noto Sans CJK';
    context.fillText("ぐるっとぐりっど", 40, 90);
};

/**
 * Draw the article title text on the canvas with line wrapping
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to write
 * @param {number} width - Maximum width for text
 * @param {number} height - Canvas height
 */
const writeText = (context, text, width, height) => {
    const lines = splitLine(context, text, width);
    let y = 180;

    lines.forEach((line) => {
	const {width, height} = textSize(context, line);
	context.fillText(line, 40, y);
	y += height + 10;
    });
};

/**
 * Convert content file path to OGP image filename
 * @param {string} url - Content file path
 * @returns {string} OGP image filename
 */
const convertFileName = (url) => {
    return url
	.replace('content/', '')
	.replace('/', '-')
	.replace('.md', '.png');
};

/**
 * Generate an OGP image for a specific blog post
 * @param {string} title - Blog post title
 * @param {string} url - Blog post URL/path
 */
const generateOgpImage = async (title, url) => {
    const canvas = createCanvas(800, 418);
    const context = canvas.getContext("2d");
    
    try {
        // Load background image
        const background = await loadImage(path.join('themes/sauvignon/assets/images/', 'og-background.png'));
        
        // Draw background image
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw blog title
	writeTitle(context);
	
        // Configure and draw article title
        context.fillStyle = '#000000';
        context.font = '48px Noto Sans CJK';
	writeText(context, title, canvas.width - 80, canvas.height);

        // Save the generated image
	const filename = convertFileName(url);
	console.log(filename);
	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync(path.join('static/og', filename), buffer);
	
    } catch (error) {
        console.error('Error loading background image:', error);
    }
};

/**
 * Main function to get all published pages and generate OGP images for each
 */
const main = async () => {
    // Get list of published pages from Hugo
    const pageList = execSync("hugo list published");

    // Process each page (skip header row)
    for (const page of pageList.toString().trim().split("\n")) {
        if (page === pageList.toString().trim().split("\n")[0]) continue;
        
        // Extract URL and title from CSV format
        let pageText = page.toString().split(",");
        let url = pageText[0];
        let title = pageText[2];
        console.log(url, title);
        await generateOgpImage(title, url);
    }
};

// Execute the main function
main().catch(console.error);
