const { SearchYt } = require("ytsearch.js");

const main = async() =>{
  let results = await SearchYt("Iron man");
  
  console.log(results)

}
main()
