// Main entry point for the application
// This file serves as the entry point that the container expects

import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import parseResults from './TestParser.js';

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Affooh Automation Playwright Server is alive ✅",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Playwright webhook is alive ✅",
    timestamp: new Date().toISOString()
  });
});

// Endpoint to get the latest test results
app.get("/results", (req, res) => {
  try {
    // Check if latest results file exists
    if (!fs.existsSync('latest-results.json')) {
      return res.status(404).json({
        status: "error",
        message: "No test results available yet"
      });
    }

    // Read and return the latest results
    const results = JSON.parse(fs.readFileSync('latest-results.json', 'utf-8'));
    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      data: results
    });
  } catch (error) {
    console.error("❌ Error reading results:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to read test results",
      error: error.message
    });
  }
});

// Endpoint to get results from a specific results file
app.get("/results/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = `results/${filename}`;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        message: `Results file ${filename} not found`
      });
    }

    const results = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      filename: filename,
      data: results
    });
  } catch (error) {
    console.error("❌ Error reading specific results:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to read test results file",
      error: error.message
    });
  }
});

// Endpoint to list all available result files
app.get("/results-list", (req, res) => {
  try {
    if (!fs.existsSync('results')) {
      return res.json({
        status: "success",
        message: "No results directory found",
        files: []
      });
    }

    const files = fs.readdirSync('results')
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = `results/${file}`;
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified); // Sort by newest first

    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      files: files
    });
  } catch (error) {
    console.error("❌ Error listing results:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to list result files",
      error: error.message
    });
  }
});

// Endpoint to trigger tests and return results
app.post("/trigger-tests", async (req, res) => {
  const { projectId, tests, callbackUrl } = req.body;
  console.log("📝 Received start tests request for project:", projectId);

  // Save incoming test data
  try {
    const testDataToSave = { projectId, tests, callbackUrl };
    fs.writeFileSync('current-test-data.json', JSON.stringify(testDataToSave, null, 2));
    console.log("💾 Test data saved");
  } catch (err) {
    console.error("❌ Error saving test data:", err.message);
    return res.status(500).json({ 
      status: "error", 
      message: "Failed to save test data",
      error: err.message 
    });
  }

  // Run Playwright tests and wait for completion
  console.log("🚀 Starting Playwright tests...");
  
  exec("npx playwright test", async (error, stdout, stderr) => {
    console.log("✅ Playwright tests completed");
    
    

    try {
      // Check if test-results.json was created
      if (!fs.existsSync('test-results.json')) {
        console.error("❌ test-results.json file not found after test execution");
        return res.status(500).json({
          status: "error",
          message: "Test results file not generated"
        });
      }

      const parsed = await parseResults();
      
      if (!parsed) {
        console.error("❌ Failed to parse test results");
        return res.status(500).json({
          status: "error",
          message: "Failed to parse test results"
        });
      }

      // Always save results locally
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedFile = `results-${timestamp}.json`;
      
      // Ensure results directory exists
      if (!fs.existsSync('results')) {
        fs.mkdirSync('results', { recursive: true });
      }
      
      // Save timestamped version in results folder
      fs.writeFileSync(`results/${timestampedFile}`, JSON.stringify(parsed, null, 2));
      console.log(`💾 Results saved to results/${timestampedFile}`);
      
      // Save as latest results
      fs.writeFileSync("latest-results.json", JSON.stringify(parsed, null, 2));
      console.log("💾 Latest results updated");

      // Send to callback URL if provided
      if (callbackUrl) {
        try {
          const fetch = (await import("node-fetch")).default;
          const response = await fetch(callbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed)
          });
          
          if (response.ok) {
            console.log("📤 Results sent to callbackUrl successfully");
          } else {
            console.error(`❌ Failed to send results to callbackUrl: ${response.status} ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error("❌ Error sending to callbackUrl:", fetchError.message);
        }
      }

      // Return results in the response
      res.json({
        status: "success",
        message: "Tests completed successfully",
        projectId: projectId,
        timestamp: new Date().toISOString(),
        resultsFile: timestampedFile,
        data: parsed
      });

    } catch (err) {
      console.error("❌ Error parsing/saving results:", err.message);
      console.error("Stack trace:", err.stack);
      res.status(500).json({
        status: "error",
        message: "Error processing test results",
        error: err.message
      });
    }
  });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Affooh Automation Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Trigger tests: http://localhost:${PORT}/trigger-tests`);
  console.log(`📊 Get latest results: http://localhost:${PORT}/results`);
  console.log(`📋 List all results: http://localhost:${PORT}/results-list`);
  console.log(`📄 Get specific result: http://localhost:${PORT}/results/{filename}`);
});
