var calPoints = function(operations) {
    
    const result = [];
    operations.forEach((item) => {
        const val = !isNaN(item) ? Number(item) : item;
        
        if (typeof val === 'number') {
            result.push(val);
        } else if (val === 'C') {
            result.pop();
        } else if (val === 'D') {
            result.push(2 * result[result.length - 1]);
        } else if (val === '+') {
            result.push(result[result.length - 2] + result[result.length - 1]);
        }
    });
    return result.reduce((accumulator, current) => accumulator + current, 0); // summing up the total points
};

var input = ["5","-2","4","C","D","9","+","+"];
calPoints(input);