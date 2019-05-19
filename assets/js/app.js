

const svgWidth = 960;
const svgHeight = 600;

const margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;


const svg = d3
    .select(".scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


let chosenXAxis = "poverty";     
let chosenYAxis = "healthcare";



function xScale(peopleData, chosenXAxis) {
    const xLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenXAxis]) * 0.8,
        d3.max(peopleData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

function yScale(peopleData, chosenYAxis) {
    const yLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenYAxis]) * 0.8,
        d3.max(peopleData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}


function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
    return circlesGroup;
}

function renderXText(textGroup, newXScale, chosenXAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
    return textGroup;
}

function renderYText(textGroup, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]))
    return textGroup;
}

function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {
    let label = "";
    let labely = "";
    //x axis
    console.log("updateToolTip-chosenXAxis: " + chosenXAxis)
    console.log("updateToolTip-circlesGroup: " + circlesGroup)
    console.log("updateToolTip-chosenYAxis: " + chosenYAxis)
    if (chosenXAxis === "poverty") {
        label = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        label = "Age (Yrs)"
    } else if (chosenXAxis === "income") {
        label = "Income (USD)";
    }
    if (chosenYAxis === "healthcare") {
        labely = "No HealthCare (%)";
    }
    else if (chosenYAxis === "obesity") {
        labely = "Obesity (%)"
    } else if (chosenYAxis === "smokes") {
        labely = "Smokes (%)";
    }
    console.log("labely: " + labely)
    console.log("label: " + label)

    const toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -85])
        .html(function (d) {
            return (`${d.state}<br>${label}: ${d[chosenXAxis]}<br>${labely}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

(async function () {
    let peopleData = await d3.csv("assets/data/data.csv");

    peopleData.forEach(function (data) {
        data.id = +data.id;
        data.state = data.state;
        data.abbr = data.abbr;
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
    });
    console.log(peopleData)

    let xLinearScale = xScale(peopleData, chosenXAxis);

    let yLinearScale = yScale(peopleData, chosenYAxis);  
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

   
    var circlesGroup = chartGroup.selectAll("stateCircle")   
        .data(peopleData)     
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        
        .classed("stateCircle", true)

    
    var textGroup = chartGroup.selectAll(".stateText")
        .data(peopleData)    //bind to the data 
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(d => (d.abbr))
        .classed("stateText", true);

    const labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const inPovertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        .classed("active", true)   
        .text("In Poverty (%)");

    const ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") 
        .classed("inactive", true) 
        .text("Age (years, median)");

    const incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .classed("inactive", true)  
        .text("Household Income (USD, median)");

    const labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    const obesityLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity") 
        .classed("inactive", true)  
        .text("Obesity (%)");

    const smokesLabel = labelsYGroup.append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left + 20)
        .attr("dy", "1em")
        .attr("value", "smokes") 
        .classed("inactive", true) 
        .text("Smokes (%)");

    const healthcareLabel = labelsYGroup.append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left + 40)
        .attr("dy", "1em")
        .attr("value", "healthcare") 
        .classed("active", true)  
        .text("Lacks Healthcare (%)");

    circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

    labelsXGroup.selectAll("text")
        .on("click", function () {
            const value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                chosenXAxis = value;

                console.log(chosenXAxis)

                
                xLinearScale = xScale(peopleData, chosenXAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

                if (chosenXAxis === "poverty") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {  
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    labelsYGroup.selectAll("text")
        .on("click", function () {
            const value = d3.select(this).attr("value");
            console.log("value in y listener: " + value)
            console.log("pvs chosenYAxis in y listener: " + chosenYAxis)
            if (value !== chosenYAxis) {

                chosenYAxis = value;

                console.log(chosenYAxis)

                
                yLinearScale = yScale(peopleData, chosenYAxis);

                yAxis = renderYAxes(yLinearScale, yAxis);

                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);


                if (chosenYAxis === "obesity") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "healthcare") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()