// const teacherName = "Madoo";
// const answer =      "Madoo";
// const answerList = answer.split('');
// const answerLength = answerList.length;
// let total = 0;
// let addOn = 0; // If the letter in the answer is not the same in teachername, 
//                // addon will be subtracted from the teacher name to compensate

// for (let i = 0; i < answerLength; i++) {
//     if (answerList[i] === teacherName[i - addOn]) { 
//         total++;
//     } else {
//         addOn++;
//     }
// }

// if ((100/answerLength) * total >= 75 && answerLength <= answerLength + 2 && answerLength >= answerLength - 2) {
//     console.log("You passed with!" + (100/answerLength) * total + "%");
// } else {
//     console.log("Prompt");
// }

function testAnswer(answer, teacherName) {
    const answerList = answer.split('');
    const answerLength = answerList.length;
    let total = 0;
    let addOn = 0; // If the letter in the answer is not the same in teachername, 
                   // addon will be subtracted from the teacher name to compensate
    
    for (let i = 0; i < answerLength; i++) {
        if (answerList[i] === teacherName[i - addOn]) { 
            total++;
        } else {
            addOn++;
        }
    }
    
    if ((100/answerLength) * total >= 75 && answerLength <= answerLength + 2 && answerLength >= answerLength - 2) {
        console.log("You passed with!" + (100/answerLength) * total + "%");
    } else {
        console.log("Prompt");
    }
}


testAnswer("Madoo", "Madoo");
/*
run case:

Answer = Madoo : You passed with!100%
Answer = Madofo : You passed with!83.33333333333334%
Answer = Mado : You passed with!100%
Answer = Madoos : Prompt


*/
