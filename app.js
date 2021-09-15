var Data = [];
var Names = [];
var Courses = [];
var Highlighted = [];

fetch("/new.json")
  .then((response) => response.text())
  .then((data) => MAIN(data));

function MAIN(data) {
  data = data.split("\n");
  for (var i = 0; i < data.length; i++) {
    data[i] = data[i].split(",");
    data[i].length = data[i].length - 1;
  }
  Data = data;
  fetch("/newNames.json")
    .then((response) => response.text())
    .then((data) => START(data));
}
function START(names) {
  names = names.split("\n");
  for (var i = 0; i < names.length; i++) {
    names[i] = names[i].split("|,");
  }
  var courses = [];
  for (var i = 0; i < names.length; i++) {
    courses[i] = names[i][0];
    //console.log(courses[i]);
  }
  courses.length = courses.length - 1;
  Names = names;
  Courses = courses;

  findCourse(Courses, Data, "ECON*4800");
}
function findCourse(Courses, CourseArray, searchTerm) {
  for (var i = 0; i < Courses.length; i++) {
    Highlighted[i] = 0;
  }
  var HTML = "";
  var f = search(Courses, searchTerm, 0);
  if (f == -1) filterGraph(searchTerm);
  Highlighted[f] = 1;
  HTML += "<h2>Course: " + searchTerm + "</h2><br>";
  if (Names[f][1]) {
    HTML += Names[f][1] + "<br>";
  }
  HTML += "<h3>Pre Requisities</h3>" + "<br>";

  for (var i = 0; i < Courses.length; i++) {
    //console.log(CourseArray[i][f]);
    if (CourseArray[i][f] == 1) {
      recursiveAdding(i, 0, -1);
      HTML += "<h5>" + Courses[i] + "</h5><br>";
      if (Names[i][1]) {
        HTML += Names[i][1] + "<br>";
      }
    }
  }
  HTML += "<h3>Leads to</h3>" + "<br>";
  for (var i = 0; i < Courses.length; i++) {
    if (CourseArray[f][i] == 1) {
      recursiveAdding(i, 0, 1);
      HTML += Courses[i] + "<br>";
      if (Names[i][1]) {
        HTML += Names[i][1] + "<br>";
      }
    }
  }
  document.getElementById("results").innerHTML = HTML;
  printGraph();
}
function recursiveAdding(searchTerm, jumps, direction) {
  if (direction == 1) {
    jumps++;
    if (jumps < 4) {
      if (Highlighted[searchTerm] != 1) {
        Highlighted[searchTerm] = 1;
        for (var i = 0; i < Courses.length; i++) {
          if (Data[i][searchTerm] == 1) Highlighted[i] == 1;
          if (Data[searchTerm][i] == 1) {
            recursiveAdding(i, jumps);
          }
        }
      }
    }
  } else {
    jumps++;
    if (jumps < 4) {
      if (Highlighted[searchTerm] != 1) {
        Highlighted[searchTerm] = 1;
        for (var i = 0; i < Courses.length; i++) {
          if (Data[i][searchTerm] == 1) {
            recursiveAdding(i, jumps);
          }
        }
      }
    }
  }
}

function search(data, course, index) {
  if (data.length > 1 && data[0] != course) {
    var midPoint = Math.floor(data.length / 2);
    if (data[midPoint] < course) {
      var d = midPoint + index;
      var newData = [];
      for (var i = midPoint; i < data.length; i++) {
        newData[i - midPoint] = data[i];
      }
      //console.log(newData);
      return search(newData, course, d);
    } else if (data[midPoint] > course) {
      var newData = [];
      for (var i = 0; i < midPoint; i++) {
        newData[i] = data[i];
      }
      //console.log(newData);
      return search(newData, course, index);
    } else {
      return index + midPoint;
    }
  } else if (data[0] == course) {
    return 0;
  } else {
    return -1;
  }
}

function filterGraph(searchTerm) {
  if (searchTerm) {
    var nodes = new vis.DataSet([]);
    var edges = new vis.DataSet([]);
    var l = Courses.length;
    for (var i = 0; i < l; i++) {
      if (Courses[i].includes(searchTerm)) {
        nodes.add({ id: i, label: Courses[i] });
        for (var j = 0; j < l; j++) {
          if (Data[i][j] == 1) {
            edges.add({ from: i, to: j, arrows: "to" });
          }
        }
      }
    }
    ///console.log(nodes);
    // create an array with edges

    // create a network
    var container = document.getElementById("mynetwork");
    container.style = `
  width: 100%;
  height:  80rem;
  border: 1px solid lightgray;
`;
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      layout: {
        hierarchical: {
          direction: "UD"
        }
      }
    };
    var network = new vis.Network(container, data, options);
  }
}

function printGraph() {
  var nodes = new vis.DataSet([]);
  var edges = new vis.DataSet([]);
  console.log(Courses);
  var l = Courses.length;
  for (var i = 0; i < l; i++) {
    if (Highlighted[i] == 1) {
      nodes.add({ id: i, label: Courses[i] });
      for (var j = 0; j < l; j++) {
        if (Data[i][j] == 1) {
          edges.add({ from: i, to: j, arrows: "to" });
        }
      }
    }
  }
  ///console.log(nodes);
  // create an array with edges

  // create a network
  var container = document.getElementById("mynetwork");
  container.style = `
  width: 100%;
  height:  80rem;
  border: 1px solid lightgray;
`;
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {
    layout: {
      hierarchical: {
        direction: "UD"
      }
    }
  };
  var network = new vis.Network(container, data, options);
}
