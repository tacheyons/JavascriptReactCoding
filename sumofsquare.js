function sum_sq(arr) {
  var sum = 0;
  var i = arr.length-1;
  for( var j=i; j >=1;j--) {
   sum+= Math.pow(arr[j], 2);
  }
  return sum;
}


var sumArr = sum_sq([0, 1, 2, 3, 4]);
console.log(sumArr);
