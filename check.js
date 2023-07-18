function testAnswer(answer, ...teacherNames) {
    answer = answer.toLowerCase();
    teacherNames = teacherNames.map(name => name.toLowerCase());
  
    const answerList = answer.split("");
    const answerLength = answerList.length;
    const teacherNameLengths = teacherNames.map(name => name.length);
  
    const results = [];
  
    for (let i = 0; i < teacherNames.length; i++) {
      let total = 0;
      let addOn = 0;
      let matchCount = 0;
  
      for (let j = 0; j < answerLength; j++) {
        if (answerList[j] == teacherNames[i][j - addOn]) {
          total++;
          matchCount++;
        } else {
          addOn++;
        }
      }
  
      const percentage = (100 / answerLength) * total;
  
      if (
        percentage >= 75 &&
        (answerLength <= teacherNameLengths[i] + 2 && answerLength >= teacherNameLengths[i] - 2)
      ) {
        results.push({
          teacherName: teacherNames[i],
          passed: true,
          percentage: percentage,
          matchCount: matchCount
        });
      } else if (percentage > 50 && percentage < 75 &&
        (answerLength <= teacherNameLengths[i] + 2 && answerLength >= teacherNameLengths[i] - 2)
      ) {
        results.push({
          teacherName: teacherNames[i],
          passed: false,
          prompt: true,
          percentage: percentage,
          matchCount: matchCount
        });
      } else {
        results.push({
          teacherName: teacherNames[i],
          passed: false,
          percentage: percentage,
          matchCount: matchCount
        });
      }
    }
  
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.passed) {
        console.log("pass");
        return "pass";
      } else if (result.prompt) {
         console.log("prompt");
         return "prompt";
      }
    }
    console.log("fail");
    return "fail";
  }

  module.exports = { testAnswer };