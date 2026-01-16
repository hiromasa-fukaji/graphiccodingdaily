// update.jsでサムネイル画像の幅・高さを取得し、projects.jsonに格納する
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 除外するフォルダ名
const ignore = ['.git', 'node_modules', '.vscode'];

async function main() {
  const projects = [];
  for (const file of fs.readdirSync(__dirname)) {
    if (
      fs.statSync(file).isDirectory() &&
      !ignore.includes(file) &&
      !file.startsWith('.')
    ) {
      const files = fs.readdirSync(file);
      const thumb = files.find(f => f.match(/^thumb\.(jpg|png|gif)$/i)) || '';
      let width = null, height = null;
      if (thumb) {
        try {
          const imgPath = path.join(__dirname, file, thumb);
          const meta = await sharp(imgPath).metadata();
          width = meta.width;
          height = meta.height;
        } catch (e) {
          console.error(e);
        }
      }
      if (thumb) {
        projects.push({
          name: file,
          path: file,
          thumb: thumb,
          width: width,
          height: height,
          date: ""
        });
      }
    }
  }
  fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
  console.log(`Updated projects.json with ${projects.length} items.`);
}

main();