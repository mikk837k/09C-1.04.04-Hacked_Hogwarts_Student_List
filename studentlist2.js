"use strict";

window.addEventListener("DOMContentLoaded", init);

let studentlist = [];
let filteredStudentList;
let studentlist_expelled = [];
let chosenSorting = "remove";
let chosenFilter = "all";
let expel = "";
let action = "";
let inquisitorialS = "";
let bloodStatus;
let houseColor;

let destination = document.querySelector("#data_student");

const Student = {
  fullname: "-fullname-",
  firstname: "-firstname-",
  lastname: "-lastname-",
  imagename: "-imagename-",
  house: "-house-",
  blood_status: "-blood-",
  expelled: "-expelled-",
  inquisitorialSquad: "-inquisitorialSquad-",
  setJSONData: function(studentData) {
    this.fullname = studentData.fullname;
    const nameParts = studentData.fullname.split(" ");
    this.firstname = nameParts[0];
    this.lastname = nameParts[nameParts.length - 1];
    const firstletterLower = nameParts[0].substring(0, 1).toLowerCase();
    const lastnameLower = nameParts[nameParts.length - 1].toLowerCase();
    this.imagename = `images/${lastnameLower}_${firstletterLower}`;
    this.house = studentData.house;
    this.blood_status = studentData.blood_status;
    this.inquisitorialSquad = false;
  }
};

function init() {
  document.querySelector("#grid").addEventListener("click", siteClicked);

  fetchStudentData();
}
// Get JSON data and manipulate it

async function fetchStudentData() {
  let myJSON = await fetch("http://petlatkea.dk/2019/hogwarts/students.json");
  const studentArray = await myJSON.json();
  let familiesData = await fetch(
    "http://petlatkea.dk/2019/hogwarts/families.json"
  );
  bloodStatus = await familiesData.json();

  const theChosenOne = {
    fullname: "Mikkel Low Madsen",
    house: "Gryffindor"
  };
  studentArray.push(theChosenOne);

  manipulateStudentData(studentArray, bloodStatus);
}

function manipulateStudentData(studentArray) {
  studentArray.forEach(studentData => {
    const newStudent = Object.create(Student);

    newStudent.setJSONData(studentData);
    studentlist.push(newStudent);
  });
  studentlist.forEach(object => {
    object.uniqueID = generateUniqueID();
  });

  countStudents();
  setBloodStatus();
}
// Click eventhandler

function setBloodStatus() {
  console.log("setBloodStatus");
  studentlist.forEach(object => {
    bloodStatus.half.forEach(name => {
      if (object.lastname === name) {
        object.blood_status = "Half-blood";
      }
    });

    bloodStatus.pure.forEach(student => {
      if (object.lastname === student && object.blood_status === undefined) {
        object.blood_status = "Pure-blood";
      }
    });
    if (object.blood_status === undefined) {
      object.blood_status = "Muggle";
    }
  });

  hackedBloodStatus();
}

function hackedBloodStatus() {
  studentlist.forEach(object => {
    if (object.blood_status === "Pure-blood") {
      object.blood_status = "-blood-";
    } else {
      object.blood_status = "Pure-blood";
    }
  });
  hackPureBloods();
  console.table(studentlist);
  displayStudentList(studentlist);
}

function hackPureBloods() {
  studentlist.forEach(object => {
    if (object.blood_status === "-blood-") {
      let randomBloodStatus = Math.random();
      if (randomBloodStatus > 0.5) {
        object.blood_status = "Muggle";
      } else {
        object.blood_status = "Half-blood";
      }
    }
  });
}

function siteClicked(event) {
  action = event.target.dataset.action;

  if (
    action === "all" ||
    action === "Gryffindor" ||
    action === "Hufflepuff" ||
    action === "Ravenclaw" ||
    action === "Slytherin"
  ) {
    event.preventDefault();
    chosenFilter = action;
    filterList(chosenFilter);
  }
  // sort events
  if (
    action === "remove" ||
    action === "firstname" ||
    action === "lastname" ||
    action === "house"
  ) {
    event.preventDefault();
    chosenSorting = action;
    filterList(chosenFilter);
  }

  //   student modification by user

  if (action === "expel") {
    event.preventDefault();
    expel = action;
    expelStudent(event);
  }
  if (action === "inquisitorial_squad") {
    event.preventDefault();
    inquisitorialS = action;
    getISCompatibility(event);
  }
}

// Filter and sorting

function filterList(chosenFilter) {
  console.log("filterList");
  console.log(chosenFilter);
  // Find out which house that has been chosen

  // Use the targeted house as a parameter for the filter

  if (chosenFilter === "all") {
    displayStudents(studentlist);
  } else {
    const filteredStudentList = filterByHouse(chosenFilter);
    displayStudents(filteredStudentList);
  }
  countStudents();
}

function filterByHouse(house) {
  console.log("filterByHouse  ");
  function chosenHouse(student) {
    return student.house === house;
  }
  return studentlist.filter(chosenHouse);
}

function expelStudent(event) {
  // fetch the current studentlist
  console.log("expelStudent");

  const studentID = event.target.dataset.id;

  //   console.log(studentID);
  const findIndex = studentlist.findIndex(obj => obj.uniqueID === studentID);
  const expelStudent = studentlist.find(obj => obj.uniqueID === studentID);

  if (expelStudent.fullname === "Mikkel Low Madsen") {
    document.querySelector(".warning_background").classList.remove("hide");
    document.querySelector(".warning_box").classList.remove("hide");
    document.querySelector(".warning_box h1").textContent = "WARNING!";
    document.querySelector(".warning_box p").textContent =
      "Studant is undercover and can't be expelled!";
    document
      .querySelector("[data-action=close_warning]")
      .addEventListener("click", hideWarningbox);
  } else {
    studentlist.splice(findIndex, 1);
    expelStudent.expelled = "Expelled";
    //   find object to push
    studentlist_expelled.push(expelStudent);
  }

  console.table(studentlist_expelled);

  filterList(chosenFilter);
}

function getISCompatibility(event) {
  const studentID = event.target.dataset.id;

  console.log(studentID);

  const appointStudent = studentlist.find(obj => obj.uniqueID === studentID);

  console.log(appointStudent);
  if (
    appointStudent.blood_status === "Pure-blood" ||
    appointStudent.house === "Slytherin"
  ) {
    appointToIS(appointStudent);
  } else {
    // alert("Not Allowed!");
    document.querySelector(".warning_background").classList.remove("hide");
    document.querySelector(".warning_box").classList.remove("hide");
    document.querySelector(".warning_box h1").textContent = "WARNING!";
    document.querySelector(".warning_box p").textContent =
      "Studant cannot be appointed to the Inquisitorial Squad!";
    document
      .querySelector("[data-action=close_warning]")
      .addEventListener("click", hideWarningbox);
  }
}

function hideWarningbox() {
  document.querySelector(".warning_background").classList.add("hide");
  document.querySelector(".warning_box").classList.add("hide");
}

function appointToIS(appointStudent) {
  console.log("appointToIInquisitorialSquad");
  document.querySelector("[data-action=inquisitorial_squad]").textContent = "";
  if (appointStudent.inquisitorialSquad === false) {
    appointStudent.inquisitorialSquad = true;
    document.querySelector("[data-action=inquisitorial_squad]").textContent =
      "Remove from IS";
  } else {
    appointStudent.inquisitorialSquad = false;
    document.querySelector("[data-action=inquisitorial_squad]").textContent =
      "Appoint to IS";
  }
  const randomTime = Math.round(Math.random() * (5000 - 1000) + 1000);
  console.log(randomTime);
  setTimeout(resetISStatus, randomTime, appointStudent);
}

function resetISStatus(appointStudent) {
  console.log("resetISStatus");
  if (appointStudent.inquisitorialSquad === true) {
    appointStudent.inquisitorialSquad = false;
    document.querySelector("[data-action=inquisitorial_squad]").textContent =
      "";
    document.querySelector("[data-action=inquisitorial_squad]").textContent =
      "Appoint to IS";
    // Some visuel effect
  }
  console.log(appointStudent);
}

// update counters

function countStudents() {
  const counts = {
    Gryffindor: 0,
    Slytherin: 0,
    Hufflepuff: 0,
    Ravenclaw: 0
  };
  studentlist.forEach(student => {
    counts[student.house]++;
  });

  document.querySelector(
    "[data-field=allStudents]"
  ).textContent = `Total amount of students: ${counts.Gryffindor +
    counts.Hufflepuff +
    counts.Ravenclaw +
    counts.Slytherin}`;
  document.querySelector(
    "[data-field=expelledStudent]"
  ).textContent = `Total amount of expelled students: ${
    studentlist_expelled.length
  }`;
  document.querySelector(
    "[data-field=Gryffindor]"
  ).textContent = `Gryffindor: ${counts.Gryffindor}`;
  document.querySelector(
    "[data-field=Hufflepuff]"
  ).textContent = `Hufflepuff: ${counts.Hufflepuff}`;
  document.querySelector("[data-field=Ravenclaw]").textContent = `Ravenclaw: ${
    counts.Ravenclaw
  }`;
  document.querySelector("[data-field=Slytherin]").textContent = `Slytherin: ${
    counts.Slytherin
  }`;
}

function sortByFirstname(list) {
  console.log(list);
  // console.log("sortByFirstname");
  list.sort((a, b) => {
    if (a.firstname < b.firstname) {
      return -1;
    } else {
      return 1;
    }
  });
}
function sortByLastname(list) {
  // console.log("sortByLastname");
  list.sort((a, b) => {
    if (a.lastname < b.lastname) {
      return -1;
    } else {
      return 1;
    }
  });
}
function sortByHouse(list) {
  // console.log("sortByHouse");
  list.sort((a, b) => {
    if (a.house < b.house) {
      return -1;
    } else {
      return 1;
    }
  });
}

function displayStudents(list) {
  console.log("displayStudents");
  console.log(list);

  console.log(chosenSorting);
  if (chosenSorting === "firstname") {
    sortByFirstname(list);
  } else if (chosenSorting === "lastname") {
    sortByLastname(list);
  } else if (chosenSorting === "house") {
    sortByHouse(list);
  }
  displayStudentList(list);
}

function displayStudentList(list) {
  destination.textContent = "";
  list.forEach(displayStudent);
}

function displayStudent(student) {
  console.log("displayStudent");

  let myTemplate = document.querySelector("#data_template");

  let clone = myTemplate.cloneNode(true).content;
  clone.querySelector("[data-field=fullname]").textContent = student.fullname;
  clone.querySelector("h2").addEventListener("click", () => {
    openStudentDetails(student);
  });
  clone.querySelector("p").textContent = student.house;
  clone.querySelector("button").dataset.id = student.uniqueID;

  destination.appendChild(clone);
}

function openStudentDetails(student) {
  const modal = document.querySelector("#modal");
  modal.classList.add("show");
  houseColor = student.house.toLowerCase();

  console.log(houseColor);
  document.querySelector(".modal_content").classList.add(houseColor);
  modal.querySelector("[data-field=firstname]").innerHTML = student.firstname;
  modal.querySelector("[data-field=lastname]").innerHTML = student.lastname;
  modal.querySelector("[data-field=blood_status]").innerHTML =
    student.blood_status;
  modal.querySelector("[data-field=studentphoto]").src = `${
    student.imagename
  }.png`;
  modal.querySelector("[data-field=studentphoto]").alt = `Student photo of ${
    student.fullname
  } from the house ${student.house}`;

  if (student.firstname === "Justin") {
    modal.querySelector("[data-field=studentphoto]").src =
      "images/fletchley_j.png";
  }
  if (student.lastname === "-unknown-") {
    modal.querySelector("[data-field=studentphoto]").src = "images/unknown.png";
  }

  modal.querySelector("[data-field=housecrest]").src = `img/${houseColor}.png`;
  modal.querySelector("[data-field=housecrest]").alt = `Crest of the house ${
    student.house
  }`;
  modal.querySelector("button").dataset.id = student.uniqueID;
  modal
    .querySelector(".closeArea")
    .addEventListener("click", closeStudentDetails);
}

function closeStudentDetails() {
  document.querySelector(".modal_content").classList.remove(houseColor);
  modal.classList.remove("show");
}

function generateUniqueID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
