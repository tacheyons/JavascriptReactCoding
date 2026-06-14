var findNumbers = function(nums) {
    result = 0;
    for(i=0;i<nums.length;i++) {
        out = String(num[i]).length;
        if(out % 2 === 0) {
            result+=1;
        }
    }
    return result;
};

findNumbers([12,345,2,6,7896]);