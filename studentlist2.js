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

  //   console.table(bloodStatus.pure);

  manipulateStudentData(studentArray, bloodStatus);
}

function manipulateStudentData(studentArray) {
  studentArray.forEach(studentData => {
    const newStudent = Object.create(Student);

    newStudent.setJSONData(studentData);
    studentlist.push(newStudent);
  });
  studentlist.forEach(object => {
    object.uniqueID = uuidv4();
  });

  console.table(studentlist);

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

  console.table(studentlist);

  displayStudentList(studentlist);
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
    getInquisitorialSquadCompatibility(event);
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
  studentlist.splice(findIndex, 1);

  expelStudent.expelled = "Expelled";
  //   find object to push
  studentlist_expelled.push(expelStudent);
  console.table(studentlist_expelled);

  filterList(chosenFilter);
}

function getInquisitorialSquadCompatibility(event) {
  const studentID = event.target.dataset.id;

  console.log(studentID);

  const appointStudent = studentlist.find(obj => obj.uniqueID === studentID);

  console.log(appointStudent);
  if (
    appointStudent.blood_status === "Pure-blood" ||
    appointStudent.house === "Slytherin"
  ) {
    appointToInquisitorialSquad(appointStudent);
  } else {
    alert("Not Allowed!");
  }
}

function appointToInquisitorialSquad(appointStudent) {
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
  let houseColor;
  modal.classList.add("show");
  houseColor = student.house.toLowerCase();
  document.querySelector(".modal_content").classList.add(houseColor);
  modal.querySelector("[data-field=firstname]").innerHTML = `Firstname: ${
    student.firstname
  }`;
  modal.querySelector("button").dataset.id = student.uniqueID;
  modal.querySelector("div").addEventListener("click", closeStudentDetails);
}

function closeStudentDetails() {
  modal.classList.remove("show");
  let houseColor;
  document.querySelector(".modal_content").classList.remove(houseColor);
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
