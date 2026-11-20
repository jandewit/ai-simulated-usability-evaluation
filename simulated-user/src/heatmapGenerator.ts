import fs from "fs";
import path from "path";
import { AttentionPoint } from "./types.js";

export class HeatmapGenerator {
  static generateHeatmapOverlay(
    screenshotPath: string,
    attentionPoints: AttentionPoint[],
    outputPath: string
  ): void {
    if (attentionPoints.length === 0) {
      console.log("No attention points to visualize");
      return;
    }

    // Generate SVG heatmap overlay - use percentage-based coordinates
    const svgContent = this.generateSVGHeatmap(attentionPoints, screenshotPath);
    fs.writeFileSync(outputPath, svgContent);
  }

  private static generateSVGHeatmap(points: AttentionPoint[], screenshotPath: string): string {
    // Screenshots are 1265x1911 pixels (aspect ratio ~1.51)
    // Calculate viewBox to maintain correct aspect ratio
    const viewBoxWidth = 100;
    const viewBoxHeight = 100 * (1911 / 1265); // ≈ 151.03

    let defs = `<defs>`;

    // Create a unique gradient for each point
    points.forEach((point, index) => {
      const id = `grad${index}`;
      const opacity = point.intensity;
      defs += `
    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:${opacity * 0.8}" />
      <stop offset="50%" style="stop-color:rgb(255,100,0);stop-opacity:${opacity * 0.4}" />
      <stop offset="100%" style="stop-color:rgb(255,200,0);stop-opacity:0" />
    </radialGradient>`;
    });

    defs += `</defs>`;

    let circles = "";
    points.forEach((point, index) => {
      const id = `grad${index}`;
      // Coordinates come as 0-100 percentages, convert to viewBox coordinates
      const svgX = point.x; // Keep x as-is since viewBox width is 100
      const svgY = (point.y / 100) * viewBoxHeight; // Scale y to match viewBox height
      
      // Scale radius based on the viewBox height
      const radius = 8 + point.intensity * 15 * (viewBoxHeight / 100);
      circles += `
  <circle cx="${svgX}" cy="${svgY}" r="${radius}" fill="url(#${id})" />
  <circle cx="${svgX}" cy="${svgY}" r="1.5" fill="red" stroke="darkred" stroke-width="0.3" />`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100%" height="100%" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  ${defs}
  ${circles}
</svg>`;
  }

  static generateHeatmapHTML(
    screenshotPath: string,
    heatmapSvgPath: string,
    outputPath: string,
    iteration: number,
    attentionPoints: AttentionPoint[] = []
  ): void {
    const screenshot = path.basename(screenshotPath);

    // Calculate stats
    const focusCount = attentionPoints.length;
    const avgIntensity = focusCount > 0 
      ? (attentionPoints.reduce((sum, p) => sum + p.intensity, 0) / focusCount).toFixed(2)
      : "0.0";

    // Generate attention points HTML
    const attentionPointsHTML = attentionPoints
      .map((point) => {
        const intensityLabel = point.intensity >= 0.7 ? "High" : point.intensity >= 0.4 ? "Medium" : "Low";
        return `
          <div class="attention-point">
            <span class="attention-point-intensity">${(point.intensity * 100).toFixed(0)}%</span>
            <strong>${intensityLabel} Intensity</strong>
            <div class="attention-point-description">
              ${point.description}
            </div>
          </div>`;
      })
      .join("");

    // Read the SVG content to embed it directly
    let svgContent = "";
    try {
      svgContent = fs.readFileSync(heatmapSvgPath, "utf-8");
      // Extract just the SVG content
      const svgMatch = svgContent.match(/<svg[^>]*>[\s\S]*<\/svg>/);
      if (svgMatch) {
        svgContent = svgMatch[0];
      }
    } catch (e) {
      console.warn("Could not read SVG file:", e);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attention Heatmap - Iteration ${iteration}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }
    .panel {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .panel-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panel-content {
      padding: 20px;
    }
    .screenshot-wrapper {
      position: relative;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-container {
      position: relative;
      display: inline-block;
      width: fit-content;
      height: fit-content;
    }
    .image-container img {
      display: block;
      max-width: 100%;
      height: auto;
    }
    .heatmap-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .heatmap-overlay svg {
      width: 100%;
      height: 100%;
    }
    .attention-point {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
    }
    .attention-point-intensity {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
      float: right;
    }
    .attention-point-description {
      color: #2c3e50;
      font-weight: 500;
      margin-top: 5px;
      clear: both;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-card {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border-left: 4px solid #667eea;
      padding: 15px;
      border-radius: 6px;
    }
    .info-card-label {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-card-value {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .legend {
      background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .legend h4 {
      color: #d39e00;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      font-size: 14px;
    }
    .legend-color {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      border-radius: 4px;
      border: 2px solid #d39e00;
    }
    .color-high {
      background: radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,100,0,0.4) 50%, rgba(255,200,0,0) 100%);
    }
    .color-medium {
      background: radial-gradient(circle, rgba(255,100,0,0.6) 0%, rgba(255,150,0,0.3) 50%, rgba(255,200,0,0) 100%);
    }
    .color-low {
      background: radial-gradient(circle, rgba(255,200,0,0.4) 0%, rgba(255,200,0,0.2) 50%, rgba(255,200,0,0) 100%);
    }
    h3 {
      color: #2c3e50;
      font-size: 16px;
      margin: 20px 0 15px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 AI User Attention Heatmap</h1>
      <p>Iteration ${iteration} - Analysis of AI Focus and Interaction Patterns</p>
    </div>

    <div class="main-content">
      <div class="panel">
        <div class="panel-title">
          📸 Screenshot with Attention Overlay
        </div>
        <div class="panel-content">
          <div class="screenshot-wrapper">
            <div class="image-container">
              <img src="${screenshot}" alt="Website Screenshot" id="screenshot">
              <div class="heatmap-overlay">
                ${svgContent}
              </div>
            </div>
          </div>
          <div class="legend">
            <h4>📊 Intensity Legend</h4>
            <div class="legend-item">
              <div class="legend-color color-high"></div>
              <span><strong>High Focus (0.7-1.0):</strong> Primary attention areas</span>
            </div>
            <div class="legend-item">
              <div class="legend-color color-medium"></div>
              <span><strong>Medium Focus (0.4-0.7):</strong> Secondary attention areas</span>
            </div>
            <div class="legend-item">
              <div class="legend-color color-low"></div>
              <span><strong>Low Focus (0.0-0.4):</strong> Peripheral attention areas</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          📊 Analysis & Focus Points
        </div>
        <div class="panel-content">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-label">Iteration</div>
              <div class="info-card-value">#${iteration}</div>
            </div>
            <div class="info-card">
              <div class="info-card-label">Focus Areas</div>
              <div class="info-card-value">${focusCount}</div>
            </div>
            <div class="info-card">
              <div class="info-card-label">Avg Intensity</div>
              <div class="info-card-value">${avgIntensity}</div>
            </div>
            <div class="info-card">
              <div class="info-card-label">Timestamp</div>
              <div class="info-card-value">${new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          <h3>🎯 Attention Focus Points</h3>
          <div id="attention-points">
            ${attentionPointsHTML}
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const img = document.getElementById('screenshot');
      const overlay = document.querySelector('.heatmap-overlay');
      const svg = overlay.querySelector('svg');
      
      function syncSVGToImage() {
        if (!img || !overlay || !svg) return;
        
        // Get the actual rendered dimensions of the image
        const imgRect = img.getBoundingClientRect();
        const containerRect = img.parentElement.getBoundingClientRect();
        
        // Calculate the actual visible area of the image within the container
        const offsetX = imgRect.left - containerRect.left;
        const offsetY = imgRect.top - containerRect.top;
        const width = imgRect.width;
        const height = imgRect.height;
        
        // Position the SVG to exactly match the image bounds
        overlay.style.position = 'absolute';
        overlay.style.left = offsetX + 'px';
        overlay.style.top = offsetY + 'px';
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';
      }
      
      // Sync on image load and window resize
      img.addEventListener('load', syncSVGToImage);
      window.addEventListener('resize', syncSVGToImage);
      
      // Sync immediately if image is already cached
      if (img.complete) {
        setTimeout(syncSVGToImage, 50);
      }
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputPath, html);
  }
}
