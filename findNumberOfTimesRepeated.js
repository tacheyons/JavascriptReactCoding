

var arr1=[3, 'a', 'a', 'a', 2, 3, 'a', 3, 'a', 2, 4, 9, 3];
var unique = new Set(arr1);
var convert = Array.from(unique);
let j = 0;
console.log(convert);
const final = convert.reduce((accumulator, currentValue, index) => {
     arr1.map((item, i) => {
       if(item === currentValue){
         j=j+1;
       }
     });
  accumulator = [...accumulator, {[currentValue]: j}];
  j=0;
    return accumulator;
},[]);
  console.log(final);
const maxObject = Object.assign({}, ...final);
console.log(maxObject);
const values = Object.values(maxObject);
const maxval = Math.max(...values);
const t = Object.keys(maxObject).find((item)=> maxObject[item] === maxval)

  console.log(t+' : '+maxval+' times');


  ///unique values in array of objects
  var test = [{id:1, PlaceRef: "*00011", Component: "BATH", SubLocCode: "BAT", BarCode: ""},{id:2, PlaceRef: "*00022", Component: "BAXI10R", SubLocCode: "KIT", BarCode:""},{id:1, PlaceRef: "*00011", Component: "BATH", SubLocCode: "BAT", BarCode: ""},{id:3, PlaceRef: "*00011", Component: "ANR190", SubLocCode: "B1", BarCode: ""}]
var uniq = [...new Set(test.map(({id}) => id))].map(e => test.find(({id}) => id == e));	
console.log(uniq);
