const extractData = require("../dist/main.cjs");

async function testCommonJS() {
  try {
    const query = "rick astley never gonna give you up";
    const results = await extractData(query, { type: "video" });
    console.log("CommonJS Test Results:(Count:", results.length + ")");
    console.log(results[0]);
    if (results.length > 0 && results[0].type === "video") {
      console.log("Test Passed: Valid video data received.");
    } else {
      console.error("Test Failed: No valid results.");
    }
  } catch (error) {
    console.error("CommonJS Test Error:", error);
  }
}

testCommonJS();
