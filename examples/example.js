const { searchYouTube } = require("ytsearch.js");

const main = async() =>{
  let results = await searchYouTube("Iron man");
  
  console.log(results)

}
main()
