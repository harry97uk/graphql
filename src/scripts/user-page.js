const projectXPsvg = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);
projectXPsvg.setAttribute("height", `${600}px`);
projectXPsvg.setAttribute("width", `${1000}px`);
projectXPsvg.setAttribute("viewBox", `0 0 1000 700`);

const projectXPTimesvg = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);
projectXPTimesvg.setAttribute("height", `${600}px`);
projectXPTimesvg.setAttribute("width", `${1000}px`);
projectXPTimesvg.setAttribute("viewBox", `0 0 1000 700`);

const info = document.getElementById("userInfo");
info.style.display = "none";

const projectsXP = info.innerText.split(`"xps":[{`)[1].split(`}, {`);
const transactionsData = info.innerText
  .split(`"transactions":[{`)[1]
  .split(`"xps":[{`)[0]
  .split(`}, {`);
const progressesData = info.innerText
  .split(`"progresses":[{`)[1]
  .split(`"transactions":[{`)[0]
  .split(`}, {`);
const totalXP = calculateTotalXP(transactionsData);
const projectsXPChartData = generateProjectsXPData(projectsXP);
const projectsXPTimeChartData = generateProjectsXPTimeData(transactionsData);
const projectGrades = generateProjectGradesTable(progressesData);

function generateProjectsXPData(projectsXP) {
  console.log(projectsXP);
  let projectsXPChartData = [];
  projectsXP.forEach((v) => {
    let name = v.split("/london/div-01/")[1].split(`"}]}]}`)[0];
    name = name.slice(0, -1);
    const projectData = {
      projectName: name,
      xpAmount: v.split(`"amount":`)[1].split(",")[0],
    };
    if (!name.includes("piscine")) {
      projectsXPChartData.push(projectData);
    }
  });
  return projectsXPChartData;
}

function generateProjectsXPTimeData(transactionsData) {
  let projectsXPTimeChartData = [];
  projectsXPTimeChartData.push({
    date: "2022-10-01",
    dateLength: 0,
    xpAmount: 0,
  });
  let XPTotal = 0;
  transactionsData.forEach((v) => {
    let date = v
      .split(`"createdAt":`)[1]
      .split("}],")[0]
      .replaceAll('"', "")
      .split("T")[0];
    XPTotal = Number(v.split(`"amount":`)[1].split(",")[0]);
    const XPTimeData = {
      date: date,
      dateLength: Date.parse(date),
      xpAmount: XPTotal,
    };
    projectsXPTimeChartData.push(XPTimeData);
  });
  console.log(projectsXPTimeChartData);
  projectsXPTimeChartData.sort((a, b) => {
    return b.dateLength < a.dateLength;
  });
  projectsXPTimeChartData.reduce((prev, curr) => {
    curr.xpAmount += prev.xpAmount;
    return curr;
  });
  return projectsXPTimeChartData;
}

function generateProjectGradesTable(progressesData) {
  let projectGrades = [];
  progressesData.forEach((v) => {
    let name = v.split(`"name":"`)[1].split(`"`)[0];
    name = name.replaceAll("-", " ");
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const grade = Number(v.split(`"grade":`)[1]).toPrecision(3);
    const projectGradeObject = {
      Project_Name: name,
      Grade: grade,
    };
    if (projectGradeObject.Grade !== "NaN") {
      projectGrades.push(projectGradeObject);
    }
  });
  console.log(projectGrades);

  function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key.replaceAll("_", " "));
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }

  let table = document.createElement("table");
  table.classList.add("project-grade-list");
  let data = Object.keys(projectGrades[0]);
  generateTableHead(table, data);
  generateTable(table, projectGrades);

  return table;
}

function calculateTotalXP(transactionsData) {
  let total = 0;
  transactionsData.forEach((v) => {
    const amount = v.split(`"amount":`)[1].split(",")[0];
    total += Number(amount);
  });
  return total;
}

function createUserInfoString(userInfo) {
  const firstName = userInfo.innerText
    .split(`"firstName":`)[1]
    .split(",")[0]
    .replaceAll(`"`, "");
  const lastName = userInfo.innerText
    .split(`"lastName":`)[1]
    .split(",")[0]
    .replaceAll(`"`, "");
  const username = userInfo.innerText
    .split(`"login":`)[1]
    .split(",")[0]
    .replaceAll(`"`, "");
  const finalString = `First Name: ${firstName}${"\n"}Last Name: ${lastName}${"\n"}Username: ${username}`;
  return finalString;
}

function generateBarChart(data, svg) {
  const barChartElems = [];

  const createAxis = () => {
    // Draw X-axis
    const xAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    xAxis.setAttribute("x1", 20);
    xAxis.setAttribute("y1", 560);
    xAxis.setAttribute("x2", 1000);
    xAxis.setAttribute("y2", 560);
    xAxis.setAttribute("stroke", "black");
    svg.appendChild(xAxis);

    // Draw Y-axis
    const yAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    yAxis.setAttribute("x1", 20);
    yAxis.setAttribute("y1", 100);
    yAxis.setAttribute("x2", 20);
    yAxis.setAttribute("y2", 560);
    yAxis.setAttribute("stroke", "black");
    svg.appendChild(yAxis);
  };

  const create = (d) => {
    d.forEach((entry, index) => {
      const bar = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      bar.setAttribute("x", index * (950 / data.length));
      bar.setAttribute("y", 450 - 0 + 100);
      bar.setAttribute("height", `${0}px`);
      bar.setAttribute("width", `${950 / data.length}px`);
      bar.setAttribute("style", "transition: 0.5s all;");
      svg.appendChild(bar);
      barChartElems.push(bar);
    });
  };

  const label = (d) => {
    d.forEach((entry, index) => {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = entry.projectName;
      label.setAttribute("x", index * (950 / data.length) + 50);
      label.setAttribute("y", 565);
      label.setAttribute(
        "transform",
        `rotate(-90, ${index * (950 / data.length) + 50}, ${565})`
      );
      label.setAttribute("text-anchor", "end");
      svg.appendChild(label);
    });

    const maxValue = Math.max(...d.map((o) => o.xpAmount));
    let yScale = maxValue / 450;

    for (let i = 0; i <= maxValue; i = i + maxValue / 10) {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = i;
      label.setAttribute("x", 15);
      label.setAttribute("y", 460 - i / yScale + 100);
      label.setAttribute("text-anchor", "end");
      svg.appendChild(label);
    }
  };

  const update = (newData) => {
    if (newData.length > barChartElems.length) {
      create(newData.filter((e, i) => i > barChartElems.length - 1));
    }

    const maxValue = Math.max(...newData.map((o) => o.xpAmount));
    let yScale = maxValue / 450;

    newData.forEach((newEntry, index) => {
      if (index > barChartElems.length - 1) return;

      const bar = barChartElems[index];
      bar.setAttribute("x", index * (950 / newData.length) + 25);
      bar.setAttribute("width", `${950 / newData.length}px`);

      setTimeout(() => {
        bar.setAttribute("y", 450 - newEntry.xpAmount / yScale + 100);
        bar.setAttribute("height", `${newEntry.xpAmount / yScale}px`);
      }, 100 * index);
    });
  };

  createAxis();
  create(data);
  label(data);
  update(data);
  return update;
}

function generateLineChart(data, svg) {
  let lineChartElems = [];
  let eyeLineElems = [];

  const createAxis = () => {
    // Draw X-axis
    const xAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    xAxis.setAttribute("x1", 20);
    xAxis.setAttribute("y1", 560);
    xAxis.setAttribute("x2", 1000);
    xAxis.setAttribute("y2", 560);
    xAxis.setAttribute("stroke", "black");
    svg.appendChild(xAxis);

    // Draw Y-axis
    const yAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    yAxis.setAttribute("x1", 20);
    yAxis.setAttribute("y1", 100);
    yAxis.setAttribute("x2", 20);
    yAxis.setAttribute("y2", 560);
    yAxis.setAttribute("stroke", "black");
    svg.appendChild(yAxis);
  };

  const create = (d) => {
    d.forEach((entry, index) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", index * (950 / data.length));
      line.setAttribute("x2", index * (950 / data.length));
      line.setAttribute("y1", 460 - 0 + 100);
      line.setAttribute("y2", 460 - 0 + 100);
      line.setAttribute("stroke", "black");
      if (index % 5 === 0) {
        const eyeLine = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        eyeLine.setAttribute("x1", index * (950 / data.length) + 20);
        eyeLine.setAttribute("x2", index * (950 / data.length) + 20);
        eyeLine.setAttribute("y1", 560);
        eyeLine.setAttribute("y2", 560);
        eyeLine.setAttribute("stroke", "black");
        eyeLine.setAttribute("stroke-dasharray", 4);
        eyeLine.setAttribute("style", "transition: 0.5s all;");
        eyeLineElems.push(eyeLine);
        svg.appendChild(eyeLine);
      }
      svg.appendChild(line);
      lineChartElems.push(line);
    });
  };

  const label = (d) => {
    d.forEach((entry, index) => {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = entry.date;
      label.setAttribute("x", index * (950 / data.length) + 25);
      label.setAttribute("y", 565);
      label.setAttribute(
        "transform",
        `rotate(-90, ${index * (950 / data.length) + 25}, ${565})`
      );
      label.setAttribute("text-anchor", "end");
      svg.appendChild(label);
    });

    const maxValue = Math.max(...d.map((o) => o.xpAmount));
    console.log(maxValue);
    let yScale = maxValue / 450;

    for (let i = 0; i <= maxValue; i = i + maxValue / 10) {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = (i / 1000).toFixed(1) + "Kb";
      label.setAttribute("x", 15);
      label.setAttribute("y", 460 - i / yScale + 100);
      label.setAttribute("text-anchor", "end");
      svg.appendChild(label);
    }
  };

  const update = (newData) => {
    if (newData.length > lineChartElems.length) {
      create(newData.filter((e, i) => i > lineChartElems.length - 1));
    }

    const maxValue = Math.max(...newData.map((o) => o.xpAmount));
    let yScale = maxValue / 450;

    newData.forEach((newEntry, index) => {
      if (index > lineChartElems.length - 1) return;

      const line = lineChartElems[index];

      line.setAttribute("x1", index * (950 / newData.length) + 20);
      if (index !== newData.length - 1) {
        line.setAttribute("x2", (index + 1) * (950 / newData.length) + 20);
      } else {
        line.setAttribute("x2", index * (950 / newData.length) + 20);
      }

      // Use a class to trigger the transition effect
      line.classList.add("transition");

      setTimeout(() => {
        line.setAttribute("y1", 450 - newEntry.xpAmount / yScale + 110);
        if (index !== newData.length - 1) {
          line.setAttribute(
            "y2",
            450 - newData[index + 1].xpAmount / yScale + 110
          );
        } else {
          line.setAttribute("y2", 450 - newEntry.xpAmount / yScale + 110);
        }
        if (index % 5 === 0) {
          const eyeLine = eyeLineElems[index / 5];
          eyeLine.setAttribute("y1", 450 - newEntry.xpAmount / yScale + 110);
          eyeLine.setAttribute("y2", 560);
        }
      }, 100 * index);
    });
  };

  createAxis();
  create(data);
  label(data);
  update(data);
  return update;
}

generateBarChart(projectsXPChartData, projectXPsvg);
generateLineChart(projectsXPTimeChartData, projectXPTimesvg);

const userInfo = document.createElement("div");
userInfo.classList.add("user-info");
userInfo.innerText = createUserInfoString(info);
const totalXPDisplay = document.createElement("div");
totalXPDisplay.classList.add("totalxp-display");
totalXPDisplay.innerText = "Total XP achieved: " + totalXP;

const infoContainer = document.createElement("div");
infoContainer.classList.add("info-container");
infoContainer.appendChild(userInfo);
infoContainer.appendChild(totalXPDisplay);
infoContainer.appendChild(projectGrades);

const svgContainer = document.createElement("div");
svgContainer.classList.add("svg-container");
svgContainer.appendChild(projectXPsvg);
svgContainer.appendChild(projectXPTimesvg);

document.body.appendChild(infoContainer);
document.body.appendChild(svgContainer);
