function testAnswer(answer, teacherName) {
  answer = answer.toLowerCase();
  teacherName = teacherName.toLowerCase();

  const answerList = answer.split("");
  const answerLength = answerList.length;
  const teacherNameLength = teacherName.length;

  let total = 0;
  let addOn = 0; // If the letter in the answer is not the same in teachername,
  // addon will be subtracted from the teacher name to compensate

  let totalOne = 0;
  let totalTwo = 0;

  for (let i = 0; i < answerLength; i++) {
    if (answerList[i] == teacherName[i - addOn]) {
      totalOne++;
    } else {
      addOn++;
    }
  }

  for (let j = 0; j < answerLength; j++) {
    if (answerList[j] == teacherName[j]) {
      totalTwo++;
    }
  }

  if (totalOne > totalTwo) {
    total = totalOne;
  } else {
    total = totalTwo;
  }

  if (
    (100 / answerLength) * total >= 75 &&
    answerLength <= teacherNameLength + 2 &&
    answerLength >= teacherNameLength - 2
  ) {
    console.log("You passed with!" + (100 / answerLength) * total + "%");
    console.log("Answer Length: " + answerLength);
    console.log("Teacher Name Length: " + teacherNameLength);
  } else if (
    (100 / answerLength) * total > 50 &&
    (100 / answerLength) * total < 75 &&
    answerLength <= teacherNameLength + 2 &&
    answerLength >= teacherNameLength - 2
  ) {
    console.log("Prompt");
  } else {
    console.log("You failed with!" + (100 / answerLength) * total + "%");
    console.log("Answer Length: " + answerLength);
    console.log("Teacher Name Length: " + teacherNameLength);
  }
}

testAnswer("kronledge", "Kronledge");
