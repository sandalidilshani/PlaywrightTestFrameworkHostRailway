// send-results.js (Parser only, no API call)
import fs from 'fs';
import path from 'path';

async function parseResults() {
  console.log('📂 Parsing test-results.json...');

  let results;
  try {
    results = JSON.parse(fs.readFileSync('test-results.json', 'utf-8'));
  } catch (error) {
    console.error("❌ Could not read test-results.json file:", error);
    return null;
  }

  // --- Extract test results ---
  const getLastResult = (test) => test.results[test.results.length - 1];
  const allTests = [];

  function collectTests(suites) {
    suites.forEach(suite => {
      if (suite.specs && suite.specs.length > 0) {
        suite.specs.forEach(spec => {
          spec.tests.forEach(test => {
            allTests.push({
              spec: spec,
              test: test,
              result: getLastResult(test)
            });
          });
        });
      }
      if (suite.suites && suite.suites.length > 0) {
        collectTests(suite.suites);
      }
    });
  }

  collectTests(results.suites);

  const parsedPayload = {
    projectId: '123',
    tests: allTests.map(({ spec, result }) => {
      const testPayload = {
        testCaseId: spec.title.split(' ')[0], // only ID part
        status: result.status,
      };

      if (result.status === 'failed') {
        testPayload.error = result.error ? {
          message: result.error.message,
          stack: result.error.stack,
        } : null;

        const screenshotAttachment = result.attachments.find(att => att.name === 'screenshot');
        if (screenshotAttachment && screenshotAttachment.path) {
          const normalizedPath = path.resolve(
            screenshotAttachment.path.replace('test-resultts', 'test-results')
          );
          if (fs.existsSync(normalizedPath)) {
            const base64Screenshot = fs.readFileSync(normalizedPath).toString('base64');
            testPayload.screenshot = base64Screenshot.length > 1000
              ? `${base64Screenshot.substring(0, 1000)}...`
              : base64Screenshot;
          }
        }
      }

      return testPayload;
    }),
  };

  return parsedPayload;
}

export default parseResults;
