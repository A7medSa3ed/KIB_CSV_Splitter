
let enteredFile = document.getElementById("file");
let outputFiles = document.getElementById("output");

const groupByKey = (givenArr = [], key = "name") => {
  let tempGroup = {};

  givenArr.forEach(order => {
    tempGroup[order[key]] = tempGroup[order[key]] ?? [];
    tempGroup[order[key]].push(order);
  });

  return tempGroup;
};

const convertCSVToArr = (csvTxt, delimiter = ",") => {
  // define static header
  const staticCSVHeader = ["id", "area", "name", "quantity", "brand"];

  // convert string to array based on break line
  const arrayOfLines = csvTxt.split("\n");

  const csvArray = arrayOfLines.map(sLine => {
    const values = sLine.split(delimiter);

    // return object of each order with it's details
    const sOrder = staticCSVHeader.reduce((accumulatorObj, header, i) => {
      accumulatorObj[header] = values[i].replace(/[\r]/gm, "");
      return accumulatorObj;
    }, {});
    return sOrder;
  });

  return csvArray;
};


const getRepeatedBrand = (brandArr = []) => {
  let repeated = {
    max: 0,
    brand: ""
  };
  const groupedObject = groupByKey(brandArr, "brand");

  Object.keys(groupedObject).map(key => {
    if (repeated.max < groupedObject[key].length) {
      repeated.max = groupedObject[key].length;
      repeated.brand = key;
    }
  });

  return repeated.brand;
};

const getAvgPerOrder = (grouppedOrders, totalOrders) => {
  let average = {};

  Object.keys(grouppedOrders).map(key => {
    average[key] = {};
    average[key].brand = getRepeatedBrand(grouppedOrders[key]);

    const total = grouppedOrders[key].reduce(
      (prev, current) => +current.quantity + prev,
      0
    );
    average[key].total = total / totalOrders;
  });

  return average;
};

const generateCSVFile = (
  grouppedData = {},
  fileName = "file name",
  attr = ""
) => {
  let arrayOfLines = [];

  Object.keys(grouppedData).map(key => {
    arrayOfLines.push([key, grouppedData[key][attr]]);
  });

  let csvContent =
    "data:text/csv;charset=utf-8," +
    arrayOfLines.map(line => line.join()).join("\n");
  var encodedUri = encodeURI(csvContent);

  var fileLink = document.createElement("a");
  fileLink.innerText = fileName;
  fileLink.setAttribute("href", encodedUri);
  fileLink.setAttribute("download", fileName);

  output.appendChild(fileLink);
};

// start Point 👇
enteredFile.onchange = ({ target }) => {
  let loadedFile = target.files[0];
  const fileReader = new FileReader();

  fileReader.onload = ({ target }) => {
    outputFiles.innerHTML = "";
    const csvText = target.result;
    const csvDataArray = convertCSVToArr(csvText);
    const groupedAndAverageCalc = getAvgPerOrder(
      groupByKey(csvDataArray),
      csvDataArray.length
    );

    // get Generated Files
    generateCSVFile(groupedAndAverageCalc, `0_${loadedFile.name}`, "total");
    generateCSVFile(groupedAndAverageCalc, `1_${loadedFile.name}`, "brand");
  };
  fileReader.readAsText(loadedFile);
};
