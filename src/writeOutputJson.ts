import * as fs from 'fs';

function writeOutputFile(obj: object): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile('./output.json', JSON.stringify(obj), err => {
      if (err) {
        console.error('Error writing file.', err);
        return reject(err);
      }
      console.log('Output file created.');
      return resolve();
    });
  });
}

export { writeOutputFile };
