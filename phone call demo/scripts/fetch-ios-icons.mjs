#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ICONS = [
  { name: "clock", bundleId: "com.apple.mobiletimer" },
  { name: "calendar", bundleId: "com.apple.mobilecal" },
  { name: "messages", bundleId: "com.apple.MobileSMS" },
  { name: "calculator", bundleId: "com.apple.calculator" },
  { name: "camera", bundleId: "com.apple.camera" },
  { name: "phone", bundleId: "com.apple.mobilephone" },
  { name: "mail", bundleId: "com.apple.mobilemail" },
  { name: "weather", bundleId: "com.apple.weather" },
  { name: "google-maps", bundleId: "com.google.Maps" },
  { name: "spotify", bundleId: "com.spotify.client" },
  { name: "netflix", bundleId: "com.netflix.Netflix" },
  { name: "myfitnesspal", bundleId: "com.myfitnesspal.mfp" },
];

const OUTPUT_DIR = path.join(process.cwd(), "public", "icons");

async function getArtworkUrl(bundleId) {
  const url = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&entity=software`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Lookup failed for ${bundleId} (${response.status})`);
  }

  const data = await response.json();
  if (!data.resultCount || !data.results?.[0]?.artworkUrl512) {
    throw new Error(`No artworkUrl512 for ${bundleId}`);
  }

  return data.results[0].artworkUrl512;
}

async function downloadToFile(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Icon download failed (${response.status})`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, bytes);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const failures = [];
  for (const icon of ICONS) {
    const outputPath = path.join(OUTPUT_DIR, `${icon.name}.jpg`);
    try {
      const artworkUrl = await getArtworkUrl(icon.bundleId);
      await downloadToFile(artworkUrl, outputPath);
      console.log(`saved ${icon.name}: ${artworkUrl}`);
    } catch (error) {
      failures.push(icon.name);
      console.error(`failed ${icon.name}: ${error.message}`);
    }
  }

  if (failures.length) {
    console.error(`\nFailed icons: ${failures.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll iOS icons fetched successfully.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
