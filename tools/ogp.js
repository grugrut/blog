const { execSync } = require("child_process");
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
const fs = require("fs");

// フォントの登録
registerFont(
    'tools/NotoSansJP-Black.ttf',
    { family: 'Noto Sans CJK' }
);

const textSize = (context, text) => {
    const measure = context.measureText(text);
    const width = measure.width;
    const height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
    return { width, height };
};

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

// テキストを描画する関数
const writeTitle = (context) => {
    context.fillStyle = '#ffffff';
    context.font = '60px Noto Sans CJK';
    context.fillText("ぐるっとぐりっど", 40, 90);
};

const writeText = (context, text, width, height) => {
    const lines = splitLine(context, text, width);
    let y = 180;

    lines.forEach((line) => {
	const {width, height} = textSize(context, line);
	context.fillText(line, 40, y);
	y += height + 10;
    });
};



const convertFileName = (url) => {
    return url
	.replace('content/', '')
	.replace('/', '-')
	.replace('.md', '.png');
};

// OGP画像を生成する関数
const generateOgpImage = async (title, url) => {
    const canvas = createCanvas(800, 418);
    const context = canvas.getContext("2d");
    
    try {
        // 背景画像を読み込む
        const background = await loadImage(path.join('themes/sauvignon/assets/images/', 'og-background.png'));
        
        // 背景画像を描画
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

	writeTitle(context);
	
        // テキスト描画設定
        context.fillStyle = '#000000';
        context.font = '48px Noto Sans CJK';
	writeText(context, title, canvas.width - 80, canvas.height);

	
	const filename = convertFileName(url);
	console.log(filename);
	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync(path.join('static/og', filename), buffer);
	
    } catch (error) {
        console.error('Error loading background image:', error);
    }
};

// ページ一覧を取得し、OGP画像を生成する
const main = async () => {
    const pageList = execSync("hugo list published");

    for (const page of pageList.toString().trim().split("\n")) {
        if (page === pageList.toString().trim().split("\n")[0]) continue;
        
        let pageText = page.toString().split(",");
        let url = pageText[0];
        let title = pageText[2];
        console.log(url, title);
        await generateOgpImage(title, url);
    }
};

main().catch(console.error);
