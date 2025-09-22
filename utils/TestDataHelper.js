import fs from 'fs';
import path from 'path';

class TestDataHelper {
    constructor() {
        this.staticTestDataPath = path.join(process.cwd(), 'testdata.json');
        this.dynamicTestDataPath = path.join(process.cwd(), 'current-test-data.json');
        this.testData = {};
        this.loadTestData();
    }

    loadTestData() {
        try {
            // First try to load dynamic test data (from API requests)
            if (fs.existsSync(this.dynamicTestDataPath)) {
                console.log('Loading dynamic test data from:', this.dynamicTestDataPath);
                const rawData = fs.readFileSync(this.dynamicTestDataPath, 'utf8');
                const dynamicData = JSON.parse(rawData);
                
                // Handle different formats of dynamic test data
                if (dynamicData.testData) {
                    // Format: { projectId: "123", testData: { TC13: {...} } }
                    this.testData = dynamicData.testData;
                } else if (dynamicData.tests) {
                    // Format: { projectId: "123", tests: [...] }
                    this.testData = this.convertTestsArrayToObject(dynamicData.tests);
                } else {
                    // Direct format: { TC13: {...}, TC14: {...} }
                    this.testData = dynamicData;
                }
                console.log('✅ Dynamic test data loaded successfully');
            } else {
                // Fallback to static test data
                console.log('Loading static test data from:', this.staticTestDataPath);
                const rawData = fs.readFileSync(this.staticTestDataPath, 'utf8');
                this.testData = JSON.parse(rawData);
                console.log('✅ Static test data loaded successfully');
            }
            
        } catch (error) {
            console.error('❌ Error loading test data:', error);
            throw new Error(`Failed to load test data: ${error.message}`);
        }
    }

    // Convert tests array to object format for consistency
    convertTestsArrayToObject(testsArray) {
        const testObject = {};
        testsArray.forEach((test, index) => {
            const testId = test.testId || test.id || `TC${index + 1}`;
            testObject[testId] = test;
        });
        return testObject;
    }

    // Get test data by specific test case ID
    getTestDataById(testId) {
        const trimmedTestId = testId.trim();
        console.log('📝 Requested test ID:', trimmedTestId);
        
        if (!this.testData[trimmedTestId]) {
            console.log('❌ Available test cases:', Object.keys(this.testData));
            throw new Error(`Test data not found for ID: ${trimmedTestId}`);
        }
        
        console.log('✅ Found test data for:', trimmedTestId);
        return this.testData[trimmedTestId];
    }

    // Get all available test IDs
    getAllTestIds() {
        return Object.keys(this.testData);
    }
    
    // Filter tests by pattern (e.g., get all TC tests or EDGE tests)
    filterTestsByPattern(pattern) {
        const allIds = this.getAllTestIds();
        return allIds.filter(id => id.includes(pattern));
    }

    // Get multiple test data at once
    getMultipleTestData(testIds) {
        const result = {};
        testIds.forEach(id => {
            result[id] = this.getTestDataById(id);
        });
        return result;
    }

    // Save test data to JSON file
    saveTestDataToFile(data, filePath = null) {
        try {
            const targetPath = filePath || this.dynamicTestDataPath;
            fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`💾 Test data saved to: ${targetPath}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to save test data:', error);
            return false;
        }
    }

    // Validate JSON test data structure
    validateTestData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Test data must be an object' };
        }

        // Check if it's in the expected format
        const hasTestCases = Object.keys(data).some(key => key.startsWith('TC') || key.startsWith('EDGE'));
        
        if (!hasTestCases && !data.testData && !data.tests) {
            return { 
                valid: false, 
                error: 'Invalid test data format. Expected test cases (TC*) or testData/tests properties' 
            };
        }

        return { valid: true };
    }

    // Reload test data from file
    reloadTestData() {
        this.loadTestData();
    }

    // Get test data file info
    getTestDataInfo() {
        return {
            staticDataExists: fs.existsSync(this.staticTestDataPath),
            dynamicDataExists: fs.existsSync(this.dynamicTestDataPath),
            totalTestCases: Object.keys(this.testData).length,
            testCaseIds: this.getAllTestIds(),
            lastModified: this.getLastModified()
        };
    }

    // Get last modified timestamp of current test data file
    getLastModified() {
        try {
            if (fs.existsSync(this.dynamicTestDataPath)) {
                const stats = fs.statSync(this.dynamicTestDataPath);
                return stats.mtime.toISOString();
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}

export default TestDataHelper;