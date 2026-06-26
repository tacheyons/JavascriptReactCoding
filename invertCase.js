let st = 'The Quick Brown Foxvar';

let r = st.split('');
console.log(st);
const temp = [];
r.forEach((item, index) => {
  if(item !== '') {
    if(item === st[index].toUpperCase()){
      temp.push(st[index].toLowerCase());
    } else {
      temp.push(st[index].toUpperCase());
    }
  }
});
console.log(temp.join(''));
