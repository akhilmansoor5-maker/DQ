import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const dir = path.join("assets", "photos");
fs.mkdirSync(dir, { recursive: true });

const photos = [
  ["hero.jpg", "1476514525535-07fb3b4ae5f1", 1800],
  ["cta.jpg", "1441974231531-c6227db76b6e", 1800],
  ["services-hero.jpg", "1556388158-158ea6776950", 1800],
  ["destinations-hero.jpg", "1503220317375-aaad61436b1b", 1800],
  ["contact-aside.jpg", "1488085061387-422e80d1ebde", 1400],
  ["kashmir.jpg", "1483728642387-6f49bd8c013b", 1400],
  ["himachal.jpg", "1464822759023-fed622ff2c3b", 1400],
  ["rajasthan.jpg", "1518548419970-58e3b4079ab2", 1400],
  ["kerala.jpg", "1602216056096-3b40cc0c9944", 1400],
  ["goa.jpg", "1519046904884-53103b34b206", 1400],
  ["karnataka.jpg", "1599661046289-e31897846e41", 1400],
  ["tamil-nadu.jpg", "1548013146-72479768bada", 1400],
  ["dubai.jpg", "1512453979798-5ea266f8880c", 1400],
  ["southeast-asia.jpg", "1528183429750-a7cce9ba2fcf", 1400],
  ["maldives.jpg", "1514282401047-d79a71a590e8", 1400],
  ["sri-lanka.jpg", "1544735716-392fe2489ffa", 1400],
  ["ticketing.jpg", "1436491865332-7a61a109cc05", 1400],
  ["visa.jpg", "1488646953014-85cb44e25828", 1400],
  ["umrah.jpg", "1564760055775-d63b17a4957b", 1400],
  ["corporate.jpg", "1497366216548-37526070297c", 1400],
  ["hotels.jpg", "1566073771259-6a8506099945", 1400]
];

function fetchTo(file, id, width) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
  return new Promise((resolve, reject) => {
    const out = path.join(dir, file);
    const req = https.get(url, { headers: { "User-Agent": "DQJourneySite/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { "User-Agent": "DQJourneySite/1.0" } }, (res2) => {
          if (res2.statusCode !== 200) {
            reject(new Error(`${file} ${res2.statusCode}`));
            res2.resume();
            return;
          }
          const chunks = [];
          res2.on("data", (c) => chunks.push(c));
          res2.on("end", () => {
            const buf = Buffer.concat(chunks);
            if (buf.length < 8000) reject(new Error(`${file} too small (${buf.length})`));
            else {
              fs.writeFileSync(out, buf);
              console.log(`ok ${file} ${(buf.length / 1024).toFixed(0)}kb`);
              resolve();
            }
          });
        }).on("error", reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${file} ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 8000) reject(new Error(`${file} too small (${buf.length})`));
        else {
          fs.writeFileSync(out, buf);
          console.log(`ok ${file} ${(buf.length / 1024).toFixed(0)}kb`);
          resolve();
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error(`${file} timeout`));
    });
  });
}

for (const photo of photos) {
  try {
    await fetchTo(...photo);
  } catch (err) {
    console.error("fail", err.message);
    process.exitCode = 1;
  }
}
