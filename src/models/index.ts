import fs from 'fs';
import path from 'path';

const basename = path.basename(__filename);
const db : any= {};

const modelsDir = __dirname;

fs.readdirSync(modelsDir)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' &&
      !file.includes('.test.ts'),
  )
  .forEach((file) => {
  const imported = require(path.join(modelsDir, file));
  const model = imported.default || imported;
  db[model.modelName] = model;
});
console.log('Models loaded:', Object.keys(db));
module.exports = db;
