const fs = require('fs');
const path = require('path');

// 除外するフォルダ名
const ignore = ['.git', 'node_modules', '.vscode'];

const projects = fs.readdirSync(__dirname)
  .filter(file => {
    return fs.statSync(file).isDirectory() 
           && !ignore.includes(file) 
           && !file.startsWith('.');
  })
  .map(dir => {
    // フォルダ内の thumb.jpg (または png) を探す
    const files = fs.readdirSync(dir);
    const thumb = files.find(f => f.match(/^thumb\.(jpg|png|gif)$/i)) || '';
    
    // フォルダ名から日付などを抽出しても良いが、一旦シンプルに
    return {
      name: dir, // フォルダ名をタイトルにする
      path: dir,
      thumb: thumb,
      date: "" // 必要ならファイルの作成日などを取得する処理を追加可能
    };
  })
  // サムネイルがあるものだけを有効にするならフィルタリング
  .filter(p => p.thumb !== '');

// JSON書き出し
fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
console.log(`Updated projects.json with ${projects.length} items.`);