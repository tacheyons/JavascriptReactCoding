var maximumWealth = function(accounts) {
    sumOfArray = 0;
    result =[];
    accounts.forEach((item) => {
        item.forEach((val) => {
            sumOfArray +=val;
        });
        console.log(sumOfArray)
        result.push(sumOfArray);
        sumOfArray = 0;
    });
    return Math.max(...result);
};

var accounts = [[1,5],[7,3],[3,5]];
maximumWealth(accounts);