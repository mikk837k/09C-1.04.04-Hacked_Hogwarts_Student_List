"use strict";

window.addEventListener("DOMContentLoaded", init);

let destination = document.querySelector("#data_student");
let chosenHouse = "all";
let chosenSorting = "";
let houseColor;

const newStudentArray = [];
let expelledStudents = [];

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
    this.expelled = studentData.expelled;
    this.inquisitorialSquad = studentData.inquisitorialSquad;
  }
};

function init() {
  console.log("init");

  // TODO: add event listeners, show modal, find images, and other stuff ...
  document.querySelectorAll(".filter_Button").forEach(button => {
    button.addEventListener("click", getChosenHouse);
  });

  document.querySelectorAll(".sort_Button").forEach(button => {
    button.addEventListener("click", getChosenSorting);
  });

  destination.addEventListener("click", clickStudentList);

  function getChosenHouse() {
    console.log("getChosenHouse");
    chosenHouse = this.dataset.house;
    filterList(chosenHouse);
  }

  function getChosenSorting() {
    console.log("getSortType");
    chosenSorting = this.dataset.sort;

    filterList(chosenHouse);
  }

  getJSON();
}

async function getJSON() {
  console.log("getJSON");
  let myJSON = await fetch("http://petlatkea.dk/2019/hogwarts/students.json");
  const studentArray = await myJSON.json();
  let familiesData = await fetch(
    "http://petlatkea.dk/2019/hogwarts/students.json"
  );
  const familyData = await familiesData.json();

  generateNewArray(studentArray);
}

function generateNewArray(studentArray) {
  console.log("generateNewArray run");
  studentArray.forEach(studentData => {
    const newStudent = Object.create(Student);

    newStudent.setJSONData(studentData);
    newStudentArray.push(newStudent);
  });
  newStudentArray.forEach(object => {
    object.uniqueID = uuidv4();
  });
  console.log(newStudentArray);
  // filterByHouse(newStudentArray);
  displayStudents(newStudentArray);
}

// Create a filter that only filters the list nothing more
function filterList(chosenHouse) {
  console.log("filterList");

  if (chosenHouse == "all") {
    sortList(chosenSorting, newStudentArray);
  } else {
    const filteredList = filterByHouse(chosenHouse);
    sortList(chosenSorting, filteredList);
  }
}

function filterByHouse(house) {
  console.log("filterByHouse  ");
  function chosenHouse(student) {
    return student.house === house;
  }
  return newStudentArray.filter(chosenHouse);
}

function sortList(chosenSorting, list) {
  console.log("sortList");

  let sorted;
  if (chosenSorting === "") {
    sorted = list;
  }
  if (chosenSorting == "firstname") {
    sorted = list.sort(sortByFirstname);
  } else if (chosenSorting == "lastname") {
    sorted = list.sort(sortByLastname);
  } else {
    sorted = list.sort(sortByHouse);
  }
  displayStudents(sorted);
}

function sortByFirstname(a, b) {
  // console.log("sortByFirstname");
  if (a.firstname < b.firstname) {
    return -1;
  } else {
    return 1;
  }
}
function sortByLastname(a, b) {
  // console.log("sortByLastname");
  if (a.lastname < b.lastname) {
    return -1;
  } else {
    return 1;
  }
}
function sortByHouse(a, b) {
  // console.log("sortByHouse");
  if (a.house < b.house) {
    return -1;
  } else {
    return 1;
  }
}

function clickStudentList(event) {
  console.log("clickList kørt");

  let whichButton = event.target.dataset.action;
  console.log(whichButton);

  if (whichButton === "expel") {
    event.preventDefault();
    clickRemove(event);
  }
}

function clickRemove(event) {
  console.log("clickRemove");

  let selectedStudent = event.target.dataset.id;
  console.log(selectedStudent);

  const expelStudent = newStudentArray.splice(
    newStudentArray.findIndex(obj => obj.uniqueID === selectedStudent),
    1
  );
  expelledStudents.push(expelStudent);

  displayStudents();
}

// Everything below this line is showing something visual

function displayStudents(list) {
  console.log("displayStudents");

  destination.textContent = "";

  list.forEach(displayStudent);
}

function displayStudent(student) {
  console.log("displayStudent");

  let myTemplate = document.querySelector("#data_template");

  let clone = myTemplate.cloneNode(true).content;
  clone.querySelector("h2").textContent = student.fullname;
  clone.querySelector("h2").addEventListener("click", () => {
    showModal(student);
  });
  clone.querySelector("p").textContent = student.house;
  clone.querySelector("button").dataset.id = student.uniqueID;

  destination.appendChild(clone);
}

function showModal(student) {
  console.log("showModal");
  const modal = document.querySelector("#modal");
  modal.classList.add("show");

  houseColor = student.house.toLowerCase();
  console.log(houseColor);
  document.querySelector(".modal_content").classList.add(houseColor);

  modal.querySelector(".firstname").innerHTML = `Firstname: ${
    student.firstname
  }`;
  modal.querySelector(".lastname").innerHTML = `Lastname: ${student.lastname}`;

  modal.querySelector(".studentphoto").src = `${student.imagename}.png`;
  modal.querySelector(".studentphoto").alt = `Student photo of ${
    student.fullname
  } from the house ${student.house}`;

  modal.querySelector(".housecrest").src = `img/${houseColor}.png`;
  modal.querySelector(".housecrest").alt = `Crest of the house ${
    student.house
  }`;

  modal.querySelector("div").addEventListener("click", hideModal);
}

function hideModal() {
  modal.classList.remove("show");
  document.querySelector(".modal_content").classList.remove(houseColor);
}

// Create an universal unique id --> Copied code from Stackoverflow: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
