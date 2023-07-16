function testAnswer(answer, teacherName1, teacherName2) {
  answer = answer.toLowerCase();
  teacherName1 = teacherName1.toLowerCase();
  teacherName2 = teacherName2.toLowerCase();

  const answerList = answer.split("");
  const answerLength = answerList.length;
  const teacherNameLength1 = teacherName1.length;
  const teacherNameLength2 = teacherName2.length;

  let total = 0;
  let addOn = 0; // If the letter in the answer is not the same in teachername,
  // addon will be subtracted from the teacher name to compensate

  let totalOne = 0;
  let totalTwo = 0;

  for (let i = 0; i < answerLength; i++) {
    if (answerList[i] == teacherName1[i - addOn]) {
      totalOne++;
    } else if (answerList[i] == teacherName2[i - addOn]) {
      totalTwo++;
    } else {
      addOn++;
    }
  }

  if (totalOne > totalTwo) {
    total = totalOne;
  } else {
    total = totalTwo;
  }

  if (
    (100 / answerLength) * total >= 75 &&
    (
      (answerLength <= teacherNameLength1 + 2 && answerLength >= teacherNameLength1 - 2) ||
      (answerLength <= teacherNameLength2 + 2 && answerLength >= teacherNameLength2 - 2)
    )
  ) {
    console.log("You passed with " + (100 / answerLength) * total + "%");
    console.log("Answer Length: " + answerLength);
    console.log("Teacher Name 1 Length: " + teacherNameLength1);
    console.log("Teacher Name 2 Length: " + teacherNameLength2);
  } else if (
    (100 / answerLength) * total > 50 &&
    (100 / answerLength) * total < 75 &&
    (
      (answerLength <= teacherNameLength1 + 2 && answerLength >= teacherNameLength1 - 2) ||
      (answerLength <= teacherNameLength2 + 2 && answerLength >= teacherNameLength2 - 2)
    )
  ) {
    console.log("Prompt");
  } else {
    console.log("You failed with " + (100 / answerLength) * total + "%");
    console.log("Answer Length: " + answerLength);
    console.log("Teacher Name 1 Length: " + teacherNameLength1);
    console.log("Teacher Name 2 Length: " + teacherNameLength2);
  }
}

testAnswer("two", "2", "Two");
