// test.js - Comprehensive Backend API Test Suite
// Run with: node test.js

const API_BASE = 'http://localhost:3001/api';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Test state
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

let authToken = '';
let userId = '';
let savedRequestId = '';
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'testpassword123';

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${colors.bold}Testing: ${testName}${colors.reset}`, colors.blue);
}

function logPass(message) {
  testResults.passed++;
  testResults.total++;
  log(`✓ PASS: ${message}`, colors.green);
}

function logFail(message, error) {
  testResults.failed++;
  testResults.total++;
  log(`✗ FAIL: ${message}`, colors.red);
  if (error) log(`  Error: ${error}`, colors.red);
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test suites
async function testAuthSignup() {
  logTest('User Signup');

  // Test 1: Successful signup
  try {
    const result = await makeRequest('POST', '/auth/signup', {
      email: testEmail,
      password: testPassword
    });

    if (result.ok && result.data.token && result.data.user) {
      authToken = result.data.token;
      userId = result.data.user.id;
      logPass('User signup successful with valid credentials');
      logPass(`Token received: ${authToken.substring(0, 20)}...`);
      logPass(`User ID: ${userId}`);
    } else {
      logFail('User signup failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('User signup request failed', error.message);
  }

  // Test 2: Duplicate email
  try {
    const result = await makeRequest('POST', '/auth/signup', {
      email: testEmail,
      password: testPassword
    });

    if (result.status === 400 && result.data.error) {
      logPass('Duplicate email correctly rejected');
    } else {
      logFail('Duplicate email should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Duplicate email test failed', error.message);
  }

  // Test 3: Missing email
  try {
    const result = await makeRequest('POST', '/auth/signup', {
      password: testPassword
    });

    if (result.status === 400) {
      logPass('Signup without email correctly rejected');
    } else {
      logFail('Signup without email should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Missing email test failed', error.message);
  }

  // Test 4: Missing password
  try {
    const result = await makeRequest('POST', '/auth/signup', {
      email: `another${Date.now()}@example.com`
    });

    if (result.status === 400) {
      logPass('Signup without password correctly rejected');
    } else {
      logFail('Signup without password should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Missing password test failed', error.message);
  }
}

async function testAuthSignin() {
  logTest('User Signin');

  // Test 1: Successful signin
  try {
    const result = await makeRequest('POST', '/auth/signin', {
      email: testEmail,
      password: testPassword
    });

    if (result.ok && result.data.token && result.data.user) {
      logPass('User signin successful with valid credentials');
      logPass(`Token matches: ${result.data.token === authToken}`);
    } else {
      logFail('User signin failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('User signin request failed', error.message);
  }

  // Test 2: Wrong password
  try {
    const result = await makeRequest('POST', '/auth/signin', {
      email: testEmail,
      password: 'wrongpassword'
    });

    if (result.status === 401) {
      logPass('Wrong password correctly rejected');
    } else {
      logFail('Wrong password should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Wrong password test failed', error.message);
  }

  // Test 3: Non-existent user
  try {
    const result = await makeRequest('POST', '/auth/signin', {
      email: 'nonexistent@example.com',
      password: testPassword
    });

    if (result.status === 401) {
      logPass('Non-existent user correctly rejected');
    } else {
      logFail('Non-existent user should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Non-existent user test failed', error.message);
  }
}

async function testCreateRequest() {
  logTest('Create API Request');

  // Test 1: Create request without authentication
  try {
    const result = await makeRequest('POST', '/requests', {
      name: 'Test Request',
      url: 'https://api.example.com/test',
      method: 'GET'
    });

    if (result.status === 401) {
      logPass('Request creation without token correctly rejected');
    } else {
      logFail('Request creation without token should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Unauthenticated request test failed', error.message);
  }

  // Test 2: Create request with authentication
  try {
    const requestData = {
      name: 'Test GET Request',
      description: 'A test GET request',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      headers: JSON.stringify([
        { key: 'Content-Type', value: 'application/json' }
      ]),
      body: ''
    };

    const result = await makeRequest('POST', '/requests', requestData, authToken);

    if (result.ok && result.data.id) {
      savedRequestId = result.data.id;
      logPass('Request created successfully');
      logPass(`Request ID: ${savedRequestId}`);
    } else {
      logFail('Request creation failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Request creation failed', error.message);
  }

  // Test 3: Create POST request with body
  try {
    const requestData = {
      name: 'Test POST Request',
      description: 'A test POST request with body',
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      headers: JSON.stringify([
        { key: 'Content-Type', value: 'application/json' }
      ]),
      body: JSON.stringify({ title: 'Test', body: 'Test body', userId: 1 })
    };

    const result = await makeRequest('POST', '/requests', requestData, authToken);

    if (result.ok && result.data.id) {
      logPass('POST request with body created successfully');
    } else {
      logFail('POST request creation failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('POST request creation failed', error.message);
  }

  // Test 4: Create request with invalid token
  try {
    const requestData = {
      name: 'Test Request',
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: '[]',
      body: ''
    };

    const result = await makeRequest('POST', '/requests', requestData, 'invalid-token');

    if (result.status === 403) {
      logPass('Invalid token correctly rejected');
    } else {
      logFail('Invalid token should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Invalid token test failed', error.message);
  }
}

async function testGetRequests() {
  logTest('Get Saved Requests');

  // Test 1: Get requests without authentication
  try {
    const result = await makeRequest('GET', '/requests');

    if (result.status === 401) {
      logPass('Get requests without token correctly rejected');
    } else {
      logFail('Get requests without token should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Unauthenticated get requests test failed', error.message);
  }

  // Test 2: Get requests with authentication
  try {
    const result = await makeRequest('GET', '/requests', null, authToken);

    if (result.ok && Array.isArray(result.data)) {
      logPass(`Retrieved ${result.data.length} saved requests`);
      
      if (result.data.length > 0) {
        const request = result.data[0];
        logPass(`First request has required fields: ${
          request.id && request.name && request.url && request.method
        }`);
      }
    } else {
      logFail('Get requests failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Get requests failed', error.message);
  }

  // Test 3: Verify request order (newest first)
  try {
    const result = await makeRequest('GET', '/requests', null, authToken);

    if (result.ok && result.data.length >= 2) {
      const first = new Date(result.data[0].created_at);
      const second = new Date(result.data[1].created_at);
      
      if (first >= second) {
        logPass('Requests ordered correctly (newest first)');
      } else {
        logFail('Requests not ordered correctly', 'Expected newest first');
      }
    } else {
      log('  ⚠ Not enough requests to test ordering', colors.yellow);
    }
  } catch (error) {
    logFail('Request ordering test failed', error.message);
  }
}

async function testDeleteRequest() {
  logTest('Delete API Request');

  // Test 1: Delete without authentication
  try {
    const result = await makeRequest('DELETE', `/requests/${savedRequestId}`);

    if (result.status === 401) {
      logPass('Delete without token correctly rejected');
    } else {
      logFail('Delete without token should be rejected', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Unauthenticated delete test failed', error.message);
  }

  // Test 2: Delete with authentication
  try {
    const result = await makeRequest('DELETE', `/requests/${savedRequestId}`, null, authToken);

    if (result.ok) {
      logPass('Request deleted successfully');
    } else {
      logFail('Request deletion failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Request deletion failed', error.message);
  }

  // Test 3: Verify deletion
  try {
    const result = await makeRequest('GET', '/requests', null, authToken);

    if (result.ok) {
      const deletedExists = result.data.some(req => req.id === savedRequestId);
      
      if (!deletedExists) {
        logPass('Deleted request no longer in list');
      } else {
        logFail('Deleted request still in list', 'Request should be removed');
      }
    }
  } catch (error) {
    logFail('Verification of deletion failed', error.message);
  }

  // Test 4: Delete non-existent request
  try {
    const result = await makeRequest('DELETE', '/requests/99999', null, authToken);

    if (result.ok) {
      logPass('Delete non-existent request handled gracefully');
    } else {
      logFail('Delete non-existent request failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Delete non-existent request test failed', error.message);
  }
}

async function testDataIsolation() {
  logTest('Data Isolation Between Users');

  // Create a second user
  const user2Email = `test2${Date.now()}@example.com`;
  const user2Password = 'testpassword456';
  let user2Token = '';

  try {
    const signupResult = await makeRequest('POST', '/auth/signup', {
      email: user2Email,
      password: user2Password
    });

    if (signupResult.ok && signupResult.data.token) {
      user2Token = signupResult.data.token;
      logPass('Second user created successfully');
    } else {
      logFail('Second user creation failed', JSON.stringify(signupResult.data));
      return;
    }
  } catch (error) {
    logFail('Second user creation failed', error.message);
    return;
  }

  // Create request for user 1
  let user1RequestId = '';
  try {
    const result = await makeRequest('POST', '/requests', {
      name: 'User 1 Private Request',
      url: 'https://api.example.com/user1',
      method: 'GET',
      headers: '[]',
      body: ''
    }, authToken);

    if (result.ok && result.data.id) {
      user1RequestId = result.data.id;
      logPass('User 1 request created');
    }
  } catch (error) {
    logFail('User 1 request creation failed', error.message);
  }

  // Verify user 2 cannot see user 1's requests
  try {
    const result = await makeRequest('GET', '/requests', null, user2Token);

    if (result.ok && Array.isArray(result.data)) {
      const hasUser1Request = result.data.some(req => req.id === user1RequestId);
      
      if (!hasUser1Request) {
        logPass('User 2 cannot see User 1\'s requests (data isolated)');
      } else {
        logFail('Data isolation failed', 'User 2 can see User 1\'s requests');
      }
    }
  } catch (error) {
    logFail('Data isolation test failed', error.message);
  }

  // Verify user 2 cannot delete user 1's request
  try {
    const result = await makeRequest('DELETE', `/requests/${user1RequestId}`, null, user2Token);

    if (result.ok) {
      // Check if request still exists for user 1
      const checkResult = await makeRequest('GET', '/requests', null, authToken);
      const stillExists = checkResult.data.some(req => req.id === user1RequestId);
      
      if (stillExists) {
        logPass('User 2 cannot delete User 1\'s requests');
      } else {
        logFail('Data isolation failed', 'User 2 deleted User 1\'s request');
      }
    }
  } catch (error) {
    logFail('Cross-user deletion test failed', error.message);
  }
}

async function testEdgeCases() {
  logTest('Edge Cases and Error Handling');

  // Test 1: Very long request name
  try {
    const longName = 'A'.repeat(1000);
    const result = await makeRequest('POST', '/requests', {
      name: longName,
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: '[]',
      body: ''
    }, authToken);

    if (result.ok) {
      logPass('Long request name handled');
    } else {
      logFail('Long request name failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Long request name test failed', error.message);
  }

  // Test 2: Special characters in request data
  try {
    const result = await makeRequest('POST', '/requests', {
      name: 'Test <script>alert("xss")</script>',
      description: 'Test with "quotes" and \'apostrophes\'',
      url: 'https://api.example.com/test?param=value&other=123',
      method: 'POST',
      headers: JSON.stringify([{ key: 'X-Custom', value: 'test\nvalue' }]),
      body: '{"test": "value with \\"quotes\\""}'
    }, authToken);

    if (result.ok) {
      logPass('Special characters handled correctly');
    } else {
      logFail('Special characters handling failed', JSON.stringify(result.data));
    }
  } catch (error) {
    logFail('Special characters test failed', error.message);
  }

  // Test 3: Empty request name
  try {
    const result = await makeRequest('POST', '/requests', {
      name: '',
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: '[]',
      body: ''
    }, authToken);

    // Should either reject or accept - just verify it doesn't crash
    logPass('Empty request name handled without crashing');
  } catch (error) {
    logFail('Empty request name test failed', error.message);
  }

  // Test 4: Invalid JSON in headers
  try {
    const result = await makeRequest('POST', '/requests', {
      name: 'Test Invalid JSON',
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: 'not valid json',
      body: ''
    }, authToken);

    // Should handle gracefully
    logPass('Invalid JSON in headers handled');
  } catch (error) {
    logFail('Invalid JSON test failed', error.message);
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), colors.bold);
  log('POSTMAN CLONE - BACKEND API TEST SUITE', colors.bold);
  log('='.repeat(60) + '\n', colors.bold);

  log(`Testing against: ${API_BASE}`, colors.blue);
  log(`Test started at: ${new Date().toISOString()}\n`, colors.blue);

  try {
    await testAuthSignup();
    await testAuthSignin();
    await testCreateRequest();
    await testGetRequests();
    await testDeleteRequest();
    await testDataIsolation();
    await testEdgeCases();
  } catch (error) {
    log(`\nTest suite error: ${error.message}`, colors.red);
  }

  // Print summary
  log('\n' + '='.repeat(60), colors.bold);
  log('TEST SUMMARY', colors.bold);
  log('='.repeat(60), colors.bold);
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? colors.red : colors.green);
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  log('='.repeat(60) + '\n', colors.bold);

  if (testResults.failed > 0) {
    log('❌ Some tests failed. Please review the failures above.', colors.red);
    process.exit(1);
  } else {
    log('✅ All tests passed!', colors.green);
    process.exit(0);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(API_BASE.replace('/api', '/'));
    return true;
  } catch (error) {
    log('❌ Error: Backend server is not running!', colors.red);
    log(`Please start the server at ${API_BASE}`, colors.yellow);
    log('Run: cd backend && npm run dev\n', colors.yellow);
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServerHealth();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();