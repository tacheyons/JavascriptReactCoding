var runningSum = function(nums) {
    var result = [];
    var temp = 0;
    for (var i = 0; i < nums.length; i++) {
        temp += nums[i];
        result.push(temp);
    }
    return result;
};


runningSum([1,2,3,4]);