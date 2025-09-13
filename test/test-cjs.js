const { SearchYt } = require("../dist/main.js");

async function testCommonJS() {
  try {
    const query = "mallu rap vedan";
    const results = await SearchYt(query, { type: "playlist" });
    console.log("CommonJS Test Results:(Count:", results.length + ")");
    console.log(results[0]);
    if (results.length > 0 && results[0].type === "video") {
      console.log("Test Passed: Valid video data received.");
    } else {
      console.error("Test Failed: No valid results.");
    }
    console.log(results.map(i=>i.image))
  } catch (error) {
    console.error("CommonJS Test Error:", error);
  }
}

testCommonJS();
